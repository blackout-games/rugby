import Ember from 'ember';
import PreventBodyScroll from '../../mixins/prevent-body-scroll';
const { $ } = Ember;

export default Ember.Component.extend(PreventBodyScroll,{
  
  // State
  disabled: false,
  selected: null, // A value from an item in the 'options' attr
  classNames: ['bs-wrapper'],
  
  selectedItem: Ember.computed('selected',function(){
    return this.get('options') ? this.get('options').findBy('value',this.get('selected')) : null;
  }),
  
  // Prevent body scroll
  preventBodyScrollSelectors: ['.bs-options-scroller'],
  preventMouseWheelPropagation: true,
  
  // Helps when debugging issues
  _log(){
    //console.log( arguments );
  },
  
  setup: Ember.on('didInsertElement',function(){
    
    this.buildElement();
    this.changeOption();
    this.updateState();
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    this.cleanupOptionsEvents();
    this.cleanupEvents();
    this.cleanupReferences();
  }),
  
  handleAttrChanges: Ember.on('didUpdateAttrs',function(attrs){
    
    if(this.attrChanged(attrs,'disabled')){
      this.updateState();
    }
    if(this.attrChanged(attrs,'options')){
      Ember.run.next(()=>{
        this.buildOptions();
        this.changeOption();
      });
    }
    if(this.attrChanged(attrs,'selected')){
      this.changeOption();
    }
    
  }),
  
  updateState(){
    
    if(this.get('disabled')){
      this.get('$newSel').addClass('bs-disabled');
      this.$('select').prop('disabled',true);
      this.toggleSelect('close');
    } else {
      this.get('$newSel').removeClass('bs-disabled');
      this.$('select').prop('disabled',false);
    }
    
  },
  
  enableSelect(){
    this.set('disabled',false);
    this.updateState();
  },
  
  disableSelect(){
    this.set('disabled',true);
    this.updateState();
  },
  
  buildOptions(){
    
    let $sel = this.$('select'),
      options='',
      $options,
      $newSel = this.get('$newSel'),
      $placeholder = this.get('$placeholder'),
      $scroller = this.get('$scroller');
      
    $sel.find('option').each((index,opt) => {
      if( $sel.prop('disabled') ) { return; }
      options += this.buildOption($(opt));
    });
    
    if(!this.get('$options')){
      
      // --------------- First time build
      
      $options = $('<div class="bs-options bs-options-ready" aria-hidden="true"><ul>' + options + '</ul></div>');
      
      $newSel.append($options);
      this.set('$options',$options);
      
      // Insert normal scroll component
      let $optionsList = $newSel.find('ul');
      $scroller.append($optionsList);
      $options.append($scroller);
      
    } else {
      
      // --------------- Rebuild
      
      this.cleanupOptionsEvents();
      $options = this.get('$options');
      let $optionItems = $options.find('li');
      $optionItems.remove();
      $optionItems = $(options);
      $scroller.find('ul').append($optionItems);
      
      this.refreshWatchers();
      
    }
    
    this.initOptionsEvents();
    
    // Figure out width based on widest option
    // Add ready class to ensure display is not none
    $options.css('width','auto').addClass('bs-options-ready');
    let $firstOption = $options.find('li').first();
    let selectWidth = 'auto';
    let updateWidths = (optionsWidth)=>{
      selectWidth = (optionsWidth+55)+'px';
      if(!this.get('customPlaceholder')){
        $placeholder.css('width',selectWidth);
      }
      $options.removeClass('bs-options-ready').css('width',selectWidth);
    };
    if($firstOption.length){
      let optionsWidth = $firstOption.outerWidth();
      updateWidths(optionsWidth);
    }
    
  },
  
  buildElement(){
    
    let $sel = this.$('select'),
      options='',
      disabledClass = this.get('disabled')?' bs-disabled':'';
    
    $sel.find('option').each((index,opt) => {
      if( $sel.prop('disabled') ) { return; }
      options += this.buildOption($(opt));
    } );
    
    
    let $placeholder;
    if(this.get('customPlaceholder')){
      $placeholder = $('<span class="bs-placeholder bs-custom btn-a" aria-hidden="true"><span class="bs-placeholder-text"></span></span>');
    } else {
      $placeholder = $('<span class="bs-placeholder" aria-hidden="true"><span class="bs-placeholder-text"></span><span class="bs-dropdown center-parent"><i class="icon-select icon-smd"></i></span>');
      $placeholder.addClass($sel.prop('className'));
    }
    $placeholder.addClass(this.get('classes'));
    
    let $newSel = $('<div class="bs-container '+disabledClass+'"></div>');
    $sel.prop('className','');
    
    // Temporary DOM insert to get sizes
    $newSel.append($placeholder);
    $('body').append($newSel);
    
    // Save for later use
    this.set('$newSel',$newSel);
    this.set('$placeholder',$placeholder);
    this.set('$scroller',this.$('.bs-options-scroller'));
    
    this.buildOptions();
    
    this.initEvents();
    
    // Insert DOM
    $newSel.insertAfter( $sel );
    $newSel.append( $sel );
    
    // Hide real select element but make sure it's still accessible by screen readers
    $sel.addClass('hidden-but-accessible');
    this.refreshWatchers();
    
  },
  
  refreshWatchers(){
    
    // Fastclick (Using hammertime)
    Ember.Blackout.makeFastClick(this.get('$newSel'));
    Ember.Blackout.refreshHoverWatchers();
    
    this.get('$options').find('li').each((i,option)=>{
      // Fastclick (Using hammertime)
      Ember.Blackout.makeFastClick(this.$(option));
    });
    
  },
  
  buildOption($opt){
    return '<li data-value="' + $opt.val() + '"' + ($opt.prop('disabled')?' data-disabled="disabled"':'') + ' class="bs-option btn-events' + ($opt.prop('disabled')?' disabled':'') + '"><span>' + $opt.text() + '</span></li>';
  },
  
  optionClick(e){
    if(this.changeOption($(e.currentTarget))){
      // Ensure select elem is open
      this._log('toggleSelect via clicking on an option');
      this.toggleSelect('close');
      this.addFocus();
    }
    e.stopPropagation();
  },
  
  initOptionsEvents() {
    
    let $options = this.get('$options');
    
    this.set('clearActiveOptionBound',Ember.run.bind(this,this.clearActiveOption));
    this.set('optionClickBound',Ember.run.bind(this,this.optionClick));
    
    // Reset selected option on mouse enter
    $options.find('ul').on('mouseenter touchstart',this.get('clearActiveOptionBound'));

    // Clicking the options
    $options.find('.bs-option').each( (key,opt) => {
      $(opt).on( 'click', this.get('optionClickBound'));
    });
    
  },
  
  cleanupOptionsEvents(){
    let $options = this.$('options');
    
    $options.find('ul').off('hover touchstart',this.get('clearActiveOptionBound'));
    this.set('clearActiveOptionBound',false);

    // Clicking the options
    $options.find('.bs-option').each( (key,opt) => {
      $(opt).off( 'click', this.get('optionClickBound'));
    });
  },
  
  initEvents() {
    
    let $sel = this.$('select');
    let $newSel = this.get('$newSel');
    
    // Create bound functions
    if(!this.get('docClickBound')){
      this.set('docClickBound',Ember.run.bind(this,this.docClick));
      this.set('addFocusBound',Ember.run.bind(this,this.addFocus));
      this.set('removeFocusBound',Ember.run.bind(this,this.removeFocus));
      this.set('trackBlurTargetBound',Ember.run.bind(this,this.trackBlurTarget));
      this.set('untrackBlurTargetBound',Ember.run.bind(this,this.untrackBlurTarget));
    }
    
    // Focus/blur
    $sel.on('focus',this.get('addFocusBound'));
    $sel.on('blur',this.get('removeFocusBound'));
    
    // Track element that caused blur
    $(document).on('mousedown touchstart',this.get('trackBlurTargetBound'));
    $(document).on('mouseup touchend',this.get('untrackBlurTargetBound'));
    
    // Open/close on mouse down
    /*$newSel.on( 'click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
    });
    $newSel.on( 'mousedown touchstart', (e)=>{*/
    
    // Open/close
    $newSel.on( 'click', (e)=>{
      this._log('toggleSelect via clicking on new select element');
      this.toggleSelect();
      e.stopPropagation();
    });

    // Clicking the original select
    $sel.on( 'click', (e) => {
      e.stopPropagation();
    });

    // Selecting an option on the original select
    $sel.on( 'change', () => {
      $newSel.find('.bs-option').each((key,opt) => {
        if($(opt).attr('data-value')===$sel.val()){
          $(opt).click();
        }
      });
    });

    // Close the select element if the target it´s not the select element or one of its descendants
    $('body')[0].addEventListener("mousedown", this.get('docClickBound'), true);
    $('body')[0].addEventListener("touchstart", this.get('docClickBound'), true);
    $('body')[0].addEventListener("mousewheel", this.get('docClickBound'), true);

    // keyboard navigation events
    $sel.on( 'keydown', ( e ) => {
      let keyCode = e.keyCode || e.which;
      let cursor = this.get('cursor');
      
      switch (keyCode) {
        // up key
        case 38:
          e.preventDefault();
          this.navigateOpts('prev');
          break;
        // down key
        case 40:
          e.preventDefault();
          this.navigateOpts('next');
          break;
        // enter key
        case 13:
          if( this.isOpen() && typeof cursor !== 'undefined' && cursor !== -1 ) {
            e.preventDefault();
            if(this.changeOption(this.get('$options').find('li').eq(cursor))){
              this.toggleSelect('close');
            }
          }
          break;
        // esc key
        case 27:
          e.preventDefault();
          if( this.isOpen() ) {
            this.toggleSelect();
          }
          break;
        // space key
        case 32:
          e.preventDefault();
          let success = true;
          if( this.isOpen() && typeof cursor !== 'undefined' && cursor !== -1 ) {
            success = this.changeOption(this.get('$options').find('li').eq(cursor));
          } else {
            this.navigateOpts(null,true);
          }
          if(success){
            this.toggleSelect();
          }
          break;
        // tab key
        case 9:
          if( this.isOpen()){
            e.preventDefault();
          }
          break;
        default:
        
          // If a character is entered, jump to item
          let char = Ember.Blackout.mapKeyPressToActualCharacter(e.shiftKey,keyCode);
          
          if(!Ember.Blackout.isEmpty(char)){
            e.preventDefault();
            this.jumpTo(char);
          }
      }
      
    });
    
    this._log('added listeners');
  },
  
  cleanupEvents(){
    
    if(this.get('docClickBound')){
      
      let $sel = this.$('select');
      
      $("body")[0].removeEventListener("mousedown", this.get('docClickBound'), true);
      $("body")[0].removeEventListener("touchstart", this.get('docClickBound'), true);
      $("body")[0].removeEventListener("mousewheel", this.get('docClickBound'), true);
      
      $sel.off( 'focus', this.get('addFocusBound'));
      $sel.off( 'blur', this.get('removeFocusBound'));
      $(document).off('mousedown touchstart',this.get('trackBlurTargetBound'));
      $(document).off('mouseup touchend',this.get('untrackBlurTargetBound'));
      
      this.set('docClickBound',false);
      this.set('addFocusBound',false);
      this.set('removeFocusBound',false);
      this.set('trackBlurTargetBound',false);
      this.set('untrackBlurTargetBound',false);
      
      this._log('cleaned up listeners');
      
    }
    
  },
  
  cleanupReferences(){
    
    this.set('$newSel',null);
    this.set('$options',null);
    this.set('$placeholder',null);
    this.set('$scroller',null);
    this.set('$currentOption',null);
    
  },
  
  /**
   * Handle a click somewhere other than the select
   */
  docClick(e){
    var target = e.target;
    let $newSel = this.get('$newSel');
    let $options = this.get('$options');
    
    if( target !== $newSel[0] && !$(target).hasParent( $newSel )
      && target !== $options[0] && !$(target).hasParent( $options )) {
      
      if(this.isOpen()){
        this._log('toggleSelect via document click');
        this.toggleSelect();
      }
      this.removeFocus();
    }
  },
  
  /**
   * Cleay any active options when we hover the mouse or begin a touch
   */
  clearActiveOption(){
    this.removeOptionsFocus();
  },
  
  isOpen(){
    return this.get('$newSel').hasClass('bs-active');
  },
  
  toggleSelect(force,manual){
    
    let $newSel = this.get('$newSel');
    let $options = this.get('$options');
    
    if( force === 'close' || (force !== 'open' && this.isOpen()) ) {
      
      // ------------- Close
      
      this._log('select closed');
      
      if(this.isOpen()){
        
        // Get ready for close animation
        this.get('$options').addClass('bs-options-ready');
        
        Ember.run.next(()=>{
          
          $options.off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
            this.get('$options').removeClass('bs-options-ready');
          });
          
          if($options.data('bs-positioned')){
            $options.css('position',$options.data('bs-position')).data('bs-positioned',false);
          }
          
        });
        
        if(this.attrs.onClose && typeof this.attrs.onClose === 'function'){
          this.attrs.onClose();
        }
      }
      
      // Must happen after check isOpen()
      $newSel.removeClass('bs-active');
      $options.removeClass('bs-options-active');
      
      if(!manual){
        // Should stay focused when a new option is selected (to match native behavior)
        //this.removeFocus();
        //this.$('select').blur();
      }
      
    } else if( force !== 'close' && !this.get('disabled') ) {
      
      // -------------- Open
      
      this._log('select opened');
      this.focusCurrentOption();
      this.get('$newSel').addClass('bs-active');
      
      
      // Move options into global dom (incomplete) -------------- //
      // Don't do this. Too unreliable across browsers.
      // If you do it, probably disable scrolling. Or hide drop down as soon as a scrollable parent of this select, starts to scroll
      // However, best thing is to just ensure any parents of this select do not have overflow:hidden, so that the dropdown will be visible.
      //this.get('$options').appendTo('body');
      // -------------------------------------------------------- //
      
      
      // Move options up to nearest scrollable ------------------ //
      // This seems a good compromise to ensure options are visible above any other children within it's scrollable (usually body, or sidebar panel).
      
      // Find nearest scrollable parent
      let $scrollable = this.$().closest('.ps-container, .normal-scroll, #nav-body, body');
      
      let positioning = $scrollable.css('position');
      
      if(positioning!=='relative' && positioning!=='absolute' && positioning!=='fixed'){
        $scrollable.css('position','relative').data('bs-positioned',true).data('bs-position',positioning);
      }
      
      // Get position of select within scrollable
      let pos = this.$().positionRelativeTo($scrollable);
      let xMiddle = pos.left + this.$().outerWidth()*0.5;
      pos.leftCenter = xMiddle - $options.outerWidth()*0.5;
      
      // Get distance to top of screen
      let screenPos = this.$().offsetWindow();
      let screenHeight = Ember.$(window).height();
      let distTop = screenPos.top;
      let distBottom = screenHeight - distTop - $newSel.height();
      
      // Always act as if tab bar is showing
      if($('#nav-tabbar:visible').length && this.get('media.isMobile')){
        distBottom = distBottom - 55;
      }
      
      // Give room for status bar on standalone
      if(window.browsers.standalone){
        distTop = distTop - 22;
      }
      
      // Give padding
      let padding = 22;
      distBottom = distBottom - padding;
      distTop = distTop - padding;
      
      let top, aboveOrBelow, optsHeight;
      
      // Always go below if can fit without scrolling
      let optsNaturalHeight = this.get('$options').outerHeight();
      let canFitAtBottom = optsNaturalHeight <= distBottom;
      let scrollToBottom = false;
      
      // Decide if dropdown appears above or below
      if(!canFitAtBottom && distTop > distBottom + 44){
        
        // Above
        let optsGap = Math.min(optsNaturalHeight,distTop);
        top = pos.top - optsGap + $scrollable[0].scrollTop - 2;
        aboveOrBelow = 'bs-options-above';
        optsHeight = distTop;
        scrollToBottom = true;
        
        // A bit more distance for custom
        if(this.get('customPlaceholder')){
          top -= 7;
          optsHeight -= 7;
        }
        
      } else {
        
        // Below
        top = pos.top + $newSel.height() + $scrollable[0].scrollTop;
        aboveOrBelow = 'bs-options-below';
        optsHeight = distBottom;
        
        // A bit more distance for custom
        if(this.get('customPlaceholder')){
          top += 7;
          optsHeight -= 7;
        }
        
      }
      
      // Not too high
      if(optsHeight > screenHeight*0.5){
        let minHeight = Math.min(300,optsHeight);
        optsHeight = Math.min(optsHeight,Math.max(minHeight,screenHeight*0.8));
      }
      
      // Position and show options
      $options.removeClass('bs-options-ready bs-options-above bs-options-below').addClass('bs-options-active '+aboveOrBelow).appendTo($scrollable).css({
        top: top,
        left: pos.leftCenter,
        'max-height': optsHeight,
      });
      
      // Set height of scroller
      $options.find('.bs-options-scroller').css({
        'max-height': optsHeight,
      });
      
      // Scroll to bottom?
      if(scrollToBottom){
        
        // No, don't do this, it should always be scrolled at top until
        // TODO: scroll so that selected item is relative to options list
        
        //let $scroller = this.get('$options').find('.bs-options-scroller');
        //$scroller[0].scrollTop = $scroller[0].scrollHeight - $scroller.outerHeight();
        
      }
      
      // -------------------------------------------------------- //
      
      
      if(!manual){
        this.addFocus();
        
        // Causes native select UI to show on mobile. But we need focus on desktop so that arrow keys are captured by the select and not cause a potential scrollable parent to scroll
        if(!window.os.touchOS){
          this.$('select').focus();
        }
      }
      
      if(this.attrs.onOpen && typeof this.attrs.onOpen === 'function'){
        this.attrs.onOpen();
      }
      
    }
    
  },
  
  getSelectedIndex(){
    
    let selected = this.get('selected');
    let index = null;
    
    if(!Ember.Blackout.isEmpty(selected)){
      
      Ember.$(this.get('options')).each((key,val)=>{
        if(Ember.Blackout.isEqual(val,selected)){
          index = key;
          return false;
        }
      });
      
    }
    
    return index;
    
  },
  
  changeOption($opt){
    
    if(!$opt){
      
      let selectedIndex = this.getSelectedIndex();
      if(selectedIndex!==null){
        $opt = this.get('$options').find('li').eq(selectedIndex);
      } else {
        return false;
      }
      
    } else if($opt.data('disabled')) {
      
      return false;
      
    } else {
      
      // Call closure action
      if(this.attrs.onChange){
        this.attrs.onChange(this.get('options')[$opt.index()]);
      }
    
    }
    
    let currentOption = this.get('options')[$opt.index()];
    
    // Set the current option
    this.set('$currentOption',$opt);
    
    // Update placeholder text
    if(this.get('customPlaceholder')){
      this.$('.bs-placeholder-text').html(this.attrs.customPlaceholder(currentOption));
    } else {
      this.$('.bs-placeholder-text').text($opt.text());
    }
    
    // Select the option
    $opt.addClass('bs-option-focus');
    
    // Update native select
    this.$('select').prop('selectedIndex', $opt.index());
    
    this._log('option changed');
    
    return true;
    
  },
  
  trackBlurTarget(e){
    this.set('blurTarget',e.target);
  },
  
  untrackBlurTarget(){
    this.set('blurTarget',false);
  },
  
  addFocus(e){
    
    if(this.get('disabled')){
      return;
    }
    
    this._log('focus added '+(e?'via real select':'via toggleSelect'));
    
    let hadFocus = this.$('.bs-placeholder').hasClass('bs-focus');
    this.$('.bs-placeholder').addClass('bs-focus');
    
    if(e){
      this._log('toggleSelect via addFocus');
      
      // Don't open on keyboard focus
      // Blur target will be set if a mouse event only
      if(this.get('blurTarget')){
        this.toggleSelect('open',true);
      }
    }
    
    // Send event
    if(!hadFocus){
      Ember.run.once(this,this.sendFocusEvent);
    }
    
  },
  
  removeFocus(e){
    
    // Prevent clicks on the 
    if(this.get('blurTarget') && ($(this.get('blurTarget')).hasParent(this.get('$newSel')) || $(this.get('blurTarget')).hasParent(this.get('$options')))){
      if(e){
        e.preventDefault();
      }
      this.set('blurTarget',false);
      return false;
    }
    
    this._log('focus removed '+(e?'via real select':'via toggleSelect'));
    
    let hadFocus = this.$('.bs-placeholder').hasClass('bs-focus');
    this.$('.bs-placeholder').removeClass('bs-focus');
    
    if(e){
      this._log('toggleSelect via removeFocus');
      this.toggleSelect('close',true);
    }
    
    // Send event once
    if(hadFocus){
      Ember.run.once(this,this.sendBlurEvent);
    }
    
  },
  
  /**
   * Send a focus event outside this component
   */
  sendFocusEvent(){
    if(this.attrs.onFocus && typeof this.attrs.onFocus === 'function'){
      this.attrs.onFocus();
    }
  },
  
  /**
   * Send a blur event outside this component
   */
  sendBlurEvent(){
    if(this.attrs.onBlur && typeof this.attrs.onBlur === 'function'){
      this.attrs.onBlur();
    }
  },
  
  removeOptionsFocus(){
    this.get('$options').find('li').removeClass('bs-option-focus');
  },
  
  focusCurrentOption(){
    let $currentOption = this.get('$currentOption');
    if($currentOption){
      this.removeOptionsFocus();
      $currentOption.addClass('bs-option-focus');
      this.set('cursor',$currentOption.index());
    }
  },
  
  navigateOpts(direction,showCursorOnly){
    
    if(this.get('disabled')){
      return;
    }
    
    let cursor = this.get('cursor');
    let selectedCursor = this.$('select').prop('selectedIndex');
    let wasAlreadyOpen = false;
    let numOpts = this.$('select').children('option:enabled').length;
    
    // Open if not open
    // Figure out initial cursor
    if( !this.isOpen() ) {
      if(!showCursorOnly){
        this.toggleSelect();
      }
      cursor = selectedCursor;
    } else {
      cursor = typeof cursor !== 'undefined' && cursor !== -1 ? cursor : selectedCursor;
      wasAlreadyOpen = true;
    }
    
    // If was already open move cursor
    if(wasAlreadyOpen && direction){
      cursor = direction === 'next' ? cursor + 1 : cursor - 1;
      if(cursor > numOpts-1){
        cursor = 0;
      } else if(cursor < 0){
        cursor = numOpts - 1;
      }
    }
    
    // Display new cursor position
    this.set('cursor', cursor);
    // remove focus class if any..
    this.removeOptionsFocus();
    // add class focus - track which option we are navigating
    this.get('$options').find('li:not(.disabled)').eq(cursor).addClass('bs-option-focus');
    
  },
  
  /**
   * Goes one step further than normal browsers
   * If the entered string does not match any options from the start,
   * and there are more than 1 character in the query string
   * it will search at any point in the string.
   * 
   * e.g. Typing 'zeal' in a country list would select the New Zealand option.
   */
  searchChars: '',
  searchCharsLastUpdated: 0,
  jumpTo(char){
    
    if(this.get('disabled')){
      return;
    }
    
    this._log('char entered ',char);
    
    let searchChars = this.get('searchChars');
    let searchCharsLastUpdated = this.get('searchCharsLastUpdated');
    let now = Date.now();
    
    if(now - searchCharsLastUpdated > 777){
      searchChars = char;
    } else {
      searchChars += char;
    }
    searchChars = searchChars.toLowerCase();
    this.set('searchChars',searchChars);
    this.set('searchCharsLastUpdated',now);
    
    this._log('searching for chars',searchChars);
    
    let $matchingOpt;
    let optIndex = -1;
    
    // Look for match from the start of each option string
    this.$('select > option:enabled').each((index,opt)=>{
      let text = $(opt).text().toLowerCase();
      if(text.indexOf(searchChars)===0){
        this._log('matched at start of string for option ',text,'(index '+index+')');
        $matchingOpt = $(opt);
        optIndex = index;
        return false;
      }
    });
    
    // If nothing is found yet, try and match at any place in the string
    if(optIndex===-1 && searchChars.length > 1){
      
      this.$('select > option:enabled').each((index,opt)=>{
        let text = $(opt).text().toLowerCase();
        if(text.indexOf(searchChars)>=0){
        this._log('matched later in string for option ',text,'(index '+index+')');
          $matchingOpt = $(opt);
          optIndex = index;
          return false;
        }
      });
      
    }
    
    if($matchingOpt){
    
      if( this.isOpen() ){
        
        // Display new cursor position
        this.set('cursor', optIndex);
        // remove focus class if any..
        this.removeOptionsFocus();
        // add class focus - track which option we are navigating
        this.get('$options').find('li').eq(optIndex).addClass('bs-option-focus');
        
      } else {
        
        this.changeOption($matchingOpt);
        
      }
      
    }
    
  },
  
});
