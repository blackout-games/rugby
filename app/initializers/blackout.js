import Ember from 'ember';
import config from '../config/environment';
var E = Ember;
var $ = E.$;

class Blackout {
  
  /**
   * Allows us to create a jquery item, complete with event listeners or other javascript and add it when we're already in the view layer which only allows static html (i.e. markdown)
   * 
   * Static html is returned for entry into the DOM, and on the next ember run loop, the given jquery $item will be inserted into the placeholder.
   * 
   * @param  {jquery object} $item A jquery item for insertion on the next run loop.
   * @return {html}       The html to insert into the DOM
   */
  eventedHTML( $item ){
    
    // Generate an id (html placeholder)
    let id = 'blackout-ev-' + this.generateId();
    
    // Run later
    Ember.run.next(()=>{
      
      $('#'+id).replaceWith($item);
      
    });
    
    // Return placeholder html
    return '<span id="' + id + '"></span>';
    
  }
  
  /**
   * This fills the gap where sometimes we need to wait for a promise to resolve, but we're already in the view layer which isn't promise aware (i.e. helpers).
   * 
   * Give this function a potential promise and a callback function which receives the resolved item, builds and returns the real HTML.
   * 
   * Optionally provide an event name too (listens from eventbus), and the html will be replaced again any time this event is broadcast. This supports areas like helpers with i18n because the i18n 't' component caches helper output meaning when the locale gets changed, the html is returned to the initial holder html we return from this function.
   * 
   * This function returns a basic html wrapper with an id, which will be filled with your provided html when the promise resolves.
   * 
   * @param  {object} potentialPromise A potential promise like what you would provide to assertPromise()
   * @param  {object} potentialPromise 
   * @return {string}  HTML object which will be filled when the promise resolves
   */
  promiseHTML( potentialPromise, callback, eventName=null ){
    
    // Generate an id (promise placeholder)
    let id = 'blackout-pp-' + this.generateId();
    let eventBus = this.App.lookup('service:event-bus');
    
    // Run the promise
    this.assertPromise( potentialPromise ).then(function(data){
      
      let watcher = () => {
        Ember.run.next(() => {
          
          // Must generate html from callback again so that updaters get run e.g. see manager helper
          let html = callback(data);
          let $holder = $('#'+id);
          
          if($holder.length){
            $holder.html(html);
          } else if(eventName) {
            eventBus.unsubscribe(eventName,watcher);
          }
          
        });
      };
      
      watcher();
      
      if(eventName){
        
        // Listen for the given event name, and on publishing of this event, we update the html again.
        
        eventBus.subscribe(eventName,watcher);
        
      }
      
    });
    
    // Return placeholder html
    return '<span id="' + id + '"></span>';
    
  }
  
  /**
   * Ensures whatever is passed in, even if not a promise, is turned into a promise. This allows us to process data returned by ember data which may not have resolved yet, i.e. a relationship. We can then process the data in only one place, whereas checking if something is a promise can result in code being repeated
   * 
   * Use: assertPromise( potentialPromise ).then( function(data){ // Process } )
   *  
   * @param  {object} potentialPromise Generally something passed in from ember data, e.g. in a template 
   * @return {promise}  A promise
   */
  assertPromise( potentialPromise ){
    
    return new Ember.RSVP.Promise(function(resolve) {
      
      // Check for array of items
      let data;
      if(Ember.isArray(potentialPromise)){
        data = potentialPromise.get('firstObject');
      } else {
        data = potentialPromise;
      }
      
      // Check for promise
      let type = Ember.inspect(data);
      
      if(type.indexOf('DS.PromiseObject')>=0){
        
        data.then(function(data){
          resolve(data);
        });
        
      } else {
        
        // Not a promise
        resolve(data);
        
      }
      
    });
    
  }
  
  /**
   * Check if any given value is a promise
   */
  isPromise(value) {
    
    if(!value){
      return false;
    }
    
    if (typeof value.then !== "function") {
        return false;
    }
    
    var promiseThenSrc = String($.Deferred().then);
    var valueThenSrc = String(value.then);
    
    return promiseThenSrc === valueThenSrc;
    
  }
  
  /**
   * Converts htmlBars.safeString to normal string if applicable
   * @param {stringy} maybeStr Anything really.
   */
  String( maybeStr ){
    
    if(typeof(maybeStr)==='string'){
      
      return maybeStr;
      
    // Check for safestring
    // http://emberjs.com/api/classes/Ember.String.html#method_htmlSafe
    } else if(typeof(maybeStr)==='object' && maybeStr.toString){
      
      return maybeStr.toString();
      
    } else {
      return null;
    }
    
  }
  
  /**
   * Same as Ember.isEmpty, except also supports options attributes passed to didUpdateAttrs
   * Also supports checking for empty objects, and empty arrays
   * @param  {any}  item Item to check if empty
   * @return {Boolean}
   */
  isEmpty( item ) {
    
    if(typeof(item)==='object' && "value" in item && (item.value===undefined || item.value===null || item.value===false)){
      return true;
    } else if(typeof(item)==='object' && "value" in item){
      return Ember.isEmpty(item.value);
    } else if(item instanceof Array){ // Array
      return item.length === 0;
    } else if(typeof(item)==='object'){ // Object
      return Object.keys(item).length === 0 && JSON.stringify(item) === JSON.stringify({});
    } else if(item===false){
      return true; // Ember.isEmpty says false is not an empty value
    } else {
      return Ember.isEmpty(item);
    }
    
  }
  
  isEqual( itemA, itemB ){
    
    if(typeof(itemA)==='object' && typeof(itemB)==='object'){
      return JSON.stringify(itemA) === JSON.stringify(itemB);
    } else {
      return Ember.isEqual(itemA,itemB);
    }
    
  }

  /**
   * Rand function which mimic's PHP's rand function
   * @param  {number} min The minimum number to return
   * @param  {number} max The maximum number to return
   * @return {number}     The random number.
   */
  rand(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
  }

  generateId(len = 5) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  /**
   * Shuffles an array
   * @param  {array} array The array to shuffle.
   * @return {array}       The shuffled array.
   */
  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
  
  getCSSColor(color){
    return this.getCSSValue('background-color',color);
  }

  /**
   * Gets the value of a CSS property based on a class that hasn't been used yet (if it's been used you can just read the property using $.css() ).
   * @param  {string} prop             The CSS property for the value you want.
   * @param  {string} classOrjQueryObj The CSS class containing the property.
   * @return {string}                  The CSS value.
   */
  getCSSValue(prop, className) {
    
    var inspector = $("<div>").css('display', 'none').addClass(className);
    $("body").append(inspector); // add to DOM, in order to read the CSS property
    try {
      return this.trimChar(inspector.css(prop), '\"');
    } finally {
      inspector.remove(); // and remove from DOM
    }

  }
  
  /**
   * Hammer-time
   */
  makeFastClick($el){
    $el.css({
      'touch-action': 'manipulation',
      '-ms-touch-action': 'manipulation',
      'cursor': 'pointer',
    });
  }

  /**
   * Gets the value of a CSS pseudo property based on a class.
   * @param  {string} prop             The CSS property for the value you want.
   * @param  {string} classOrjQueryObj The CSS class containing the pseudo property, or a jquery element with the class already applied.
   * @return {string}                  The pseudo CSS value.
   */
  getCSSPseudoValue(prop, classOrjQueryObj, pseudoSelector=':before') {

    var inspector;
    
    if(typeof(classOrjQueryObj)==='string'){
      
      // Note cannot use display: none, otherwise it doesn't work on safari
      
      inspector = $("<div>").css('visibility', 'hidden').addClass(classOrjQueryObj);
      
      $("body").append(inspector); // add to DOM, in order to read the CSS property
    } else {
      inspector = classOrjQueryObj;
    }
    
    try {
      
      let val = window.getComputedStyle(inspector[0], pseudoSelector).getPropertyValue(prop);
      
      if( (prop === 'background-image' || prop === 'backgroundImage') && val.indexOf('.css')>=0 ){
        val = '';
      }
      
      return val;
      
    } finally {
      if(typeof(classOrjQueryObj)==='string'){
        inspector.remove(); // and remove from DOM
      }
    }

  }
  
  /**
   * Allows us to manipulate pseudo rules
   * @param {string} selector CSS selector, i.e. .some-class:before
   * @param {string} css      CSS rules, i.e. background-image: url(...); ...
   * @param {number} index    An integer index for the rule
   * http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
   */
  addCSSRule(selector,css,index=0) {
    if(document.styleSheets[0].addRule){
      document.styleSheets[0].addRule(selector,css);
    } else if(document.styleSheets[0].insertRule){
      document.styleSheets[0].insertRule(selector + ' { ' + css + ' }',index);
    }
  }
  
  /**
   * Allows us to remove a previously added pseudo rule
   * @param {number} index    An integer index for the rule to delete
   * http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
   */
  deleteCSSRule(index) {
    document.styleSheets[0].deleteRule(index);
  }
  
  /**
   * Sometimes we need to wait for an object to render, and ember.run.next doesn't wait long enough. e.g. when using a vendor ui item such as bubble slider.
   */
  waitForWidthToChange($el,initialWidth,callback,start=0){
    
    /**
     * Stop waiting if element is removed
     */
    if(!$el || $el.length===0){
      return false;
    }
    
    let w = $el.width();
    let now = Date.now();
    
    /**
     * Stop waiting if element is removed (width will turn to zero when we move to a new route)
     */
    if($el.length===0){
      $el.remove();
      return false;
    }
    
    /**
     * We need to wait for as long as needed because the user may not open this element (or parent) for any length of time. e.g. List player floating window, custom deadline.
     * @type {Boolean}
     */
    let waitForever = true;
    
    if(!start){
      start = now;
    }
    
    let timetaken = now-start;
    if((w!==initialWidth) || (!waitForever && timetaken>=1000)){
      if(!waitForever && timetaken>=1000){
        Ember.Logger.warn('waitForWidthToChange failed to detect a change in width');
      }
      callback();
    } else {
      Ember.run.later(this,this.waitForWidthToChange,$el,initialWidth,callback,start,111);
    }
  }
  
  /**
   * Sometimes ember takes a while to start returning a height
   * for a hidden item. This function will loop until we get a height.
   * If we reach 1s before we get a height other than 0, 0 is assumed
   * 
   * NOTE that this can cause DOM flickering due to manipulation of the DOM
   */
  waitForSizeOfHidden($el,$elToMove,callback,opts={}){
    if(typeof $elToMove === 'function'){
      opts = callback;
      if(!opts){
        opts = {};
      }
      callback = $elToMove;
      $elToMove = null;
    }
    
    let size = this.getSizeOfHidden($el,$elToMove,opts);
    let now = Date.now();
    
    /**
     * Defaults
     */
    
    if(!('debug' in opts)){
      opts.debug = false;
    }
    if(!('start' in opts)){
      opts.start = now;
    }
    // Limit by parent width
    if(!('limitWidth' in opts)){
      opts.limitWidth = true;
    }
    
    let timetaken = now-opts.start;
    
    if((size.width>0 && size.height>0) || timetaken>=1000){
      if(timetaken>=1000){
        Ember.Logger.warn('waitForSizeOfHidden failed to find height within 1s');
      }
      callback(size,timetaken);
    } else {
      Ember.run.next(this,this.waitForSizeOfHidden,$el,$elToMove,callback,opts);
    }
  }
  
  /**
   * Be sure that the children of the item you're wanting to calculate are visible. For example, with blackout-fader we spent far too much time debugging an issue, when it just turned out to be the children of this element were hidden.
   */
  getSizeOfHidden($el,$elToMove=null,opts={}){
    
    // Save originals
    let previousCss,previousCssElToMove;
    let elToMoveWasGiven = false;
    if(!$elToMove){
      $elToMove = $el;
    } else {
      elToMoveWasGiven = true;
    }
    let index = $elToMove.index();
    let $parent = $elToMove.parent();
    let moved = false;
    let parentWidth,parentHeight;
    
    // Insert in body in case $el is in a display:none parent.
    if(!$elToMove.is(":visible") || !$el.is(":visible")){
      let $visibleParent = $elToMove.closest(":visible");
      parentWidth = $visibleParent.width();
      parentHeight = $visibleParent.height();
      $('body').append($elToMove);
      moved = true;
    } else {
      parentWidth = $elToMove.parent().width();
      parentHeight = $elToMove.parent().height();
    }
    
    if(elToMoveWasGiven){
      
      previousCssElToMove = $elToMove.attr("style");
      $elToMove.css({
        position:   'absolute',
        visibility: 'visible',
        height: opts.limitHeight ? parentHeight : 'auto',
      });
      
      previousCss = $el.attr("style");
      $el.css({
        position:   'absolute',
        visibility: 'visible',
        display:    'inline-block',
        'max-height': 'none',
        'max-width': opts.limitWidth ? parentWidth : 'none',
        opacity: '1',
        width: 'auto',
        height: opts.limitHeight ? parentHeight : 'auto',
      });
      
    } else {
      
      previousCss = $el.attr("style");
      $el.css({
        position:   'absolute',
        visibility: 'visible',
        display:    'inline-block',
        'max-height': 'none',
        'max-width': opts.limitWidth ? parentWidth : 'none',
        opacity: '1',
        width: 'auto',
        height: opts.limitHeight ? parentHeight : 'auto',
      });
      
    }
    
    let width = $el.width();
    let height = $el.height();
    let scrollHeight = $el[0].scrollHeight;
    let scrollWidth = $el[0].scrollWidth;
    let outerWidth = $el.outerWidth();
    let outerHeight = $el.outerHeight();
    
    if(!opts.debug){
      if(elToMoveWasGiven){
        $elToMove.attr("style", previousCssElToMove ? previousCssElToMove : "");
      }
      $el.attr("style", previousCss ? previousCss : "");
    }
    
    if(moved){
      $parent.insertAt(index,$elToMove);
    }
    
    return { width:width, height:height, scrollWidth:scrollWidth, scrollHeight:scrollHeight, outerWidth:outerWidth, outerHeight:outerHeight };
    
  }

  /**
   * trimChar
   * @param  {string} string       String to trim
   * @param  {char} charToRemove   The character to trim
   * @return {string}              Trimmed string
   */
  trimChar(string, charToRemove) {
    
    if(string){
      while (string.charAt(0) === charToRemove) {
        string = string.substring(1);
      }

      while (string.charAt(string.length - 1) === charToRemove) {
        string = string.substring(0, string.length - 1);
      }
    }

    return string;
  }
  
  /**
   * Remove all newlines \n
   * @param  {string} string The string to strip
   * @return {string}        The trimmed string
   */
  stripNewlines(string){
    return string.trim().replace(/\r?\n|\r?/g,"");
  }
  
  /**
   * Trim all html <br> (and variants) along with whitespace
   * Also replaces any inline breaks with <br> instead of variants
   * @param  {string} string The string to trim
   * @return {string}        The trimmed string
   */
  trimBr(string){
    return string.replace(/ *<br ?\/?> */gi,'<br>').replace(/(^([\.\-\_\=\#\*\{\}\[\]\,\\\/]|<br>)*|(<br>)*$)/gi, "").trim();
  }
  
  /**
   * Convert a <br> based string into <p> where appropriate.
   * @param  {string} string The string to convert
   * @return {string}        The converted string
   */
  br2p(string){
    return '<p>' + string.replace(/(?:<br\s*\/?>\s*?){2,}/gi, '</p><p>') + '</p>';
  }
  
  /**
   * Convert a <br> based string into \n where appropriate.
   * @param  {string} string The string to convert
   * @return {string}        The converted string
   */
  br2nl(string){
    return string.replace(/(?:<br\s*\/?>\s*?){2,}/gi, "\n");
  }

  /**
   * Updates the URL hash without triggering scroll
   * @param  {string} hash The new hash
   * @return {null}      
   */
  updateHashQuietly(hash) {

    hash = hash.replace(/^#/, '');
    var fx, node = $('#' + hash);
    if (node.length) {
      node.attr('id', '');
      fx = $('<div></div>')
        .css({
          position: 'absolute',
          visibility: 'hidden',
          top: $(document).scrollTop() + 'px'
        })
        .attr('id', hash)
        .appendTo(document.body);
    }
    document.location.hash = hash;
    if (node.length) {
      fx.remove();
      node.attr('id', hash);
    }

  }
  
  /**
   * Encode any oldstyle characters.
   */
  encodeOldStyleChars(str){
      
    return str.replace(/\[/g,'&#91;');
    
  }
  
  /**
   * Decode any oldstyle characters.
   */
  decodeOldstyleChars(str){
    
    return str.replace(/&#91;/g,'[');
    
  }
  
  /**
   * The point of this isn't to find and format code (the main markdown parser will do that).
   * Here we just need to encode any markdown characters within code blocks so that they don't get picked up by our custom markdown parsing stuff.
   */
  encodeMarkdownCode(markdown){
    
    return markdown.replace(/```([^`][^]+?)```|`([^`\n]+?)`/g,function( fullMatch, codeBlock, inlineCode){
      
      if(codeBlock){
        return '```' + codeBlock.encodeMarkdownChars() + '```';
      } else if(inlineCode){
        return '`' + inlineCode.encodeMarkdownChars() + '`';
      } else {
        return fullMatch;
      }
      
    });
    
  }
  
  /**
   * Converts old style format tags like [b][/b] to markdown.
   * @param  {string} str The string to convert
   * @return {string}     The markdown string
   */
  toMarkdown(str){
    
    // ------------------------------------------- Pre-code
    
    // We must process code blocks that are already markdown to ensure they won't be touched either.
    
    str = str.replace(/```([^`][^]+?)```|`([^`\n]+?)`/g,( fullMatch, codeBlock, inlineCode)=>{
      
      if(codeBlock){
        return '```' + this.encodeOldStyleChars(codeBlock) + '```';
      } else if(inlineCode){
        return '`' + this.encodeOldStyleChars(inlineCode) + '`';
      } else {
        return fullMatch;
      }
      
    });
    
    // ------------------------------------------- Code
    
    str = str.replace(/\[(i?code)\]((.|[\r\n?])*?)\[\/i?code\]/g,(fullMatch,tag,code)=>{
      
      if(tag==='icode'){
        return '`' + this.encodeOldStyleChars(code) + '`';
      } else {
        return '```' + "\n" + this.encodeOldStyleChars(code) + "\n" + '```';
      }
      
    });
    
    // ------------------------------------------- Bold
    
    str = str.replace(/\[b\]((.|[\r\n?])*?)\[\/b\]/g,(fullMatch,text)=>{
      return '**' + text + '**';
    });
    
    // ------------------------------------------- Italic
    
    str = str.replace(/\[i\]((.|[\r\n?])*?)\[\/i\]/g,(fullMatch,text)=>{
      return '*' + text + '*';
    });
    
    // ------------------------------------------- Striked
    
    str = str.replace(/\[t\]((.|[\r\n?])*?)\[\/t\]/g,(fullMatch,text)=>{
      return '~~' + text + '~~';
    });
    
    // ------------------------------------------- Underline
    
    str = str.replace(/\[u\]((.|[\r\n?])*?)\[\/u\]/g,(fullMatch,text)=>{
      return text;
    });
    
    // ------------------------------------------- Underline
    
    str = str.replace(/\[u\]((.|[\r\n?])*?)\[\/u\]/g,(fullMatch,text)=>{
      
      return text;
      
    });
    
    // ------------------------------------------- Links
    
    str = str.replace(/\[(?:link|url)(?:=(.*?))?\](.*?)\[\/(?:link|url)\]/g,(fullMatch,link,text)=>{
      
      if(!link){
        link = text;
      }
      
      if(link.substr(0,1)==='!'){
        link = 'https://www.blackoutrugby.com/game/' + link.substr(1);
      }
      
      return '[' + text + '](' + link + ')';
      
    });
    
    // ------------------------------------------- Quotes
    
    str = str.replace(/\[quote(?:=(.*?))?\]((.|[\r\n?])*?)\[\/quote\]/g,(fullMatch,quoteUser,quote)=>{
      
      // Break into lines
      let lines = quote.split("\n");
      quote = '';
      
      // Process lines, adding '>' if not empty
      $.each(lines,(i,line)=>{
        
        // Add > if line is not empty
        if( line.trim() !== '' || i===0 ){
          
          // Add > and user to first line
          lines[i] = '> ' + (i===0&&quoteUser?'@['+quoteUser+'] ':'') + line;
          
        }
        
        // Add newline at end of line except the last line
        quote += lines[i] + (lines.length===i+1?"":"\n");
        
      });
      
      return quote;
      
    });
    
    // Decode any oldstyle chars
    str = this.decodeOldstyleChars(str);
    
    return str;
    
  }
  
  /**
   * Add url protocol if not already there
   */
  assertURL( url, securingURL ) {
    url = url.trim('"').trim('[').trim(']');
    if( url.substr(0,7)!=='/assets' && url.substr(0,7)!=='assets/' && url.search(/\/\/[^\/]|https?:\/\/|ftps?:\/\/|mailto:/) !== 0 ){
      url = 'http://' + url;
    }
    if(!securingURL){
      url = this.secureURLIfHttps(url,true);
    }
    return url;
    
  }
  
  /**
   * Checks if we're current using https, and if so, changes insecure URLs to match
   */
  secureURLIfHttps( url, assertingURL ){
    if(!assertingURL){
      url = this.assertURL(url,true);
    }
    if(url.substr(0,7)!=='/assets' && url.substr(0,7)!=='assets/' && window.location.protocol==='https:' && url.substr(0,5)!=='https'){
      url = url.replace('http:','https:');
    }
    return url;
  }

  /**
   * If we're currently in responsive small mode
   * @param  {Ember obj}  obj The current ember object with media injected, i.e. routes, controllers, components (this)
   * @return {Boolean}
   */
  isSmallMode(obj) {
    return obj.get('media.isMobile');
  }

  /**
   * If we're currently in responsive big mode
   * @param  {Ember obj}  obj The current ember object with media injected, i.e. routes, controllers, components (this)
   * @return {Boolean}
   */
  isBigMode(obj) {
    return !obj.get('media.isMobile');
  }

  /**
   * Preloads an array of image paths, returns promise hash
   * @param  {array}   paths  An array of image paths
   */
  preloadImages(paths) {
    
    let hash = {};
    
    paths.forEach((path,i)=>{
      hash['image'+i] = this.preloadImage(path);
      i++;
    });
    
    return Ember.RSVP.hash(hash);
    
  }

  /**
   * Preloads an image, returns promise
   * @param  {array}   path  Path to the image
   */
  preloadImage(path) {
    
    var self = this;
    
    return new Ember.RSVP.Promise(function(resolve,reject){
      
      // Trim any potential quotes
      path = path.trim('"');
      
      var img = $('<img src="'+path+'" />');
      
      img.on('load',function() {
        $(this).remove();
        // Promises can only return one value, so use a hash
        resolve({ w:this.width, h:this.height });
      }).on('error', (e)=>{
        print('Error while preloading image','Path: '+path,e,'Stack trace: ');
        self.logStackTrace();
        reject();
      });
      
    });
    
  }
  
  /**
   * Pass a jquery item to this function to have it fade in
   * Uses animate.css library
   * @param  {jquery object} $jqueryItem The item to fade in
   */
  animateUI($jqueryItem){
    this.fadeInUp($jqueryItem);
    //$jqueryItem.on(this.afterCSSAnimation,()=>{
    //  Ember.run.debounce(this,this.unFadeInUp,$jqueryItem,11);
    //});
  }
  animateFast($jqueryItem){
    $jqueryItem.removeClass('animated-fastish');
    $jqueryItem.addClass('animated-fast');
  }
  animateFastish($jqueryItem){
    $jqueryItem.removeClass('animated-fast');
    $jqueryItem.addClass('animated-fastish');
  }
  animateResetDuration($jqueryItem){
    $jqueryItem.removeClass('animated-fast');
    $jqueryItem.removeClass('animated-fastish');
  }
  animateEaseOutExpo($jqueryItem){
    $jqueryItem.addClass('animated-out-expo');
  }
  animateResetEase($jqueryItem){
    $jqueryItem.removeClass('animated-out-expo');
  }
  
  fadeIn($jqueryItem){
    $jqueryItem.addClass('animated fadeIn');
    this.cleanAfterAnimation($jqueryItem,'fadeIn');
  }
  unFadeIn($jqueryItem){
    $jqueryItem.removeClass('animated fadeIn');
  }
  fadeOut($jqueryItem){
    $jqueryItem.addClass('animated fadeOut');
    this.cleanAfterAnimation($jqueryItem,'fadeOut');
  }
  unFadeOut($jqueryItem){
    $jqueryItem.removeClass('animated fadeOut');
  }
  fadeInUp($jqueryItem){
    $jqueryItem.addClass('animated fadeInUp');
  }
  unFadeInUp($jqueryItem){
    $jqueryItem.removeClass('animated fadeInUp');
  }
  fadeInDown($jqueryItem){
    $jqueryItem.addClass('animated fadeInDown');
  }
  unFadeInDown($jqueryItem){
    $jqueryItem.removeClass('animated fadeInDown');
  }
  fadeOutDown($jqueryItem){
    $jqueryItem.addClass('animated fadeOutDown');
    this.cleanAfterAnimation($jqueryItem,'fadeOutDown');
  }
  unFadeOutDown($jqueryItem){
    $jqueryItem.removeClass('animated fadeOutDown');
  }
  fadeOutUp($jqueryItem){
    $jqueryItem.addClass('animated fadeOutUp');
    this.cleanAfterAnimation($jqueryItem,'fadeOutUp');
  }
  unFadeOutUp($jqueryItem){
    $jqueryItem.removeClass('animated fadeOutUp');
  }
  cleanAfterAnimation($jqueryItem,type){
    $jqueryItem.off(this.afterCSSAnimation).on(this.afterCSSAnimation,()=>{
      this.cleanAnimation($jqueryItem,type);
      $jqueryItem.off(this.afterCSSAnimation);
    });
  }
  cleanAnimation($jqueryItem,type){
    $jqueryItem.removeClass('animated '+type);
  }
  
  /**
   * Logs a string, or strings to a visible on screen console (helpful for debugging on mobile)
   */
  log() {
    if ($('#console').length === 0) {

      // Create console viewport
      $('body').prepend('<div id="console"></div>');

      /*
      $('#console').perfectScrollbar({
        suppressScrollX: true,
      });
      */

      Ember.$(window).on('resize', Ember.run.bind(this, function() {
        //$('#console').perfectScrollbar('update');
      }));

    }

    var args = Array.prototype.slice.call(arguments);
    $.each(args,(i,val) => {
      if(typeof(val) === 'undefined'){
        args[i] = 'undefined';
      } else if(typeof(val) === 'boolean'){
        args[i] = val ? 'true' : 'false';
      } else if( typeof(val) === 'object'){
        args[i] = JSON.stringify(val);
      }
    });
    
    var entry = args.join(', ');

    $('#console').append('<div class="console-entry"><span class="console-date">' + Date.now() + ' > </span>' + entry + '</div>').scrollTop($('#console')[0].scrollHeight);
  }

  /**
   * Find out if element is in a fixed position = ''
   * @param  {element} element Element to check
   * @return {boolean}
   */
  elementOrParentIsFixed(element) {
    var $element = $(element);
    var $checkElements = $element.add($element.parents());
    var isFixed = false;
    $checkElements.each(function() {
      if ($(this).css("position") === "fixed") {
        isFixed = true;
        return false;
      }
    });
    return isFixed;
  }

  /**
   * Find out if element is inside a scrollable box
   * @param  {element} element Element to check
   * @return {boolean}
   */
  elementOrParentIsScrollable(element) {
    var $element = $(element);
    var $checkElements = $element.add($element.parents());
    var isScrollable = false;
    $checkElements.each(function() {
      let el = $(this)[0];
      // Body should still be able to be detectable as a scrollable
      if (el.scrollHeight>el.clientHeight+10){// && el.id!=='nav-body') {
        //log('id='+el.id,el.scrollHeight+'>'+el.clientHeight,$(this).attr('class').split(/\s+/));
        isScrollable = true;
        return false;
      }
    });
    return isScrollable;
  }
  
  /**
   * Maps a keycode + shift key to the actual character pressed
   */
  mapKeyPressToActualCharacter(isShiftKey, characterCode) {
    if (characterCode === 27
        || characterCode === 8
        || characterCode === 9
        || characterCode === 20
        || characterCode === 16
        || characterCode === 17
        || characterCode === 91
        || characterCode === 13
        || characterCode === 92
        || characterCode === 18) {
        return false;
    }
    if (typeof isShiftKey !== "boolean" || typeof characterCode !== "number") {
      return false;
    }
    var characterMap = [];
    characterMap[192] = "~";
    characterMap[49] = "!";
    characterMap[50] = "@";
    characterMap[51] = "#";
    characterMap[52] = "$";
    characterMap[53] = "%";
    characterMap[54] = "^";
    characterMap[55] = "&";
    characterMap[56] = "*";
    characterMap[57] = "(";
    characterMap[48] = ")";
    characterMap[109] = "_";
    characterMap[107] = "+";
    characterMap[219] = "{";
    characterMap[221] = "}";
    characterMap[220] = "|";
    characterMap[59] = ":";
    characterMap[222] = "\"";
    characterMap[188] = "<";
    characterMap[190] = ">";
    characterMap[191] = "?";
    characterMap[32] = " ";
    var character = "";
    if (isShiftKey) {
      if (characterCode >= 65 && characterCode <= 90) {
        character = String.fromCharCode(characterCode);
      } else {
        character = characterMap[characterCode];
      }
    } else {
      if (characterCode >= 65 && characterCode <= 90) {
        character = String.fromCharCode(characterCode).toLowerCase();
      } else {
        character = String.fromCharCode(characterCode);
      }
    }
    return character;
  }
  
  /**
   * Deprecated. Youth names are generated at API level to allow for future feature allowing renaming of youth clubs
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  juniorClubName(name){
    Ember.Logger.warn('juniorClubName() deprecated. Youth names are generated at API level');
    return 'Jr ' + name;
  }
  
  matchPathToMenuItem(path,route){
    
    // Unify splitter characters
    path = path.replace(/[/.]/g,'_');
    route = route.replace(/[/.]/g,'_');
    
    let parts = path.trim('_').split('_');
    let bestMatch = '';
    let matchedParts = 0;
    
    $.each(parts,(i,val)=>{
      
      let pattern1 = bestMatch + val + '_';
      let pattern2 = bestMatch + val + '$';
      
      if(route.regexIndexOf(new RegExp(pattern1+'|'+pattern2, 'gmi')) === 0){
        bestMatch += val + '_';
        matchedParts++;
      } else {
        return false;
      }
    });
    
    return matchedParts>0 ? matchedParts : false;
    
  }
  
  findPathInMenu(path){
    
    let $matchedMenu = $();
    let bestMatch = 0;
    
    // Unify splitter characters
    path = path.replace(/[/.]/g,'_');
    
    // Get all menu items
    $('#nav-panel a.menu-link').each((i,target)=>{
      
      let route = $(target).attr('id').substr(String("menuItem_").length);
      let matched = this.matchPathToMenuItem(path,route);
      
      if(matched > bestMatch){
        bestMatch = matched;
        
        if($(target).data('menu-route')){
          $matchedMenu = $('#menuItem_'+$(target).data('menu-route').replace(/[/.]/g,'_'));
        } else {
          $matchedMenu = $(target);
        }
        
      }
      
    });
    
    return $matchedMenu;
    
  }
  
  /**
   * Converts all keys in an object to camelcase
   */
  camelKeys( obj ){
    
    $.each(obj,(key,val)=>{
      let camelKey = key.camelize();
      if(camelKey !== key){
        obj[camelKey] = val;
        delete obj[key];
      }
    });
    
    return obj;
    
  }
  
  /**
   * Converts all keys in an object to dasherized format
   */
  dashKeys( obj ){
    
    $.each(obj,(key,val)=>{
      let dashKey = key.dasherize();
      if(dashKey !== key){
        obj[dashKey] = val;
        delete obj[key];
      }
    });
    
    return obj;
    
  }
  
  /**
   * Converts any date to a season/round/day
   */
  
  getSeasonRoundDay( date=null ){
    
    // Caching
    let key = 'seasonRoundDay_' + String(date);
    let cached = this.cache.get(key);
    if(cached){
      return cached;
    }
    
    // Use now if date not given
    if(!date){
      date = Date.now();
    } else if(typeof(date)==='string' || typeof(date)==='number') {
      date = new Date(date).getTime();
    }
    date = Math.round(date/1000);
    
    let season1Start = new Date('2007-12-17T00:00:00+12:00').getTime();
    season1Start = Math.round(season1Start/1000);
    let floor = Math.floor;
    
    // ----- Season
    
    let season = floor((date-season1Start) / (16*7*24*60*60)) + 1;
    let seasonStart = season1Start + (season-1)*16*7*24*60*60;
    
    // ----- Round
    
    let round = floor((date-seasonStart)/(7*24*60*60))+1;
    
    if(round<1){
      round = 16+round;
      season--;
      seasonStart -= 16*7*24*60*60;
    }
    
    if(round>16){
      round = round-16;
      season++;
      seasonStart += 16*7*24*60*60;
    }
    
    let roundStart = seasonStart+(round-1)*7*24*60*60;
    
    // ----- Day
    
    let day = floor((date-roundStart)/(24*60*60))+1;
    
    // ----- Season Round Day
    
    let obj = { season: season, round: round, day: day };
    this.cache.set(key,obj);
    
    return obj;
    
  }
  
  /**
   * Determines which separator to use to extend a given a URL
   */
  getSeparator(url){
    
    return url.indexOf('?')>=0 ? '&' : '?';
    
  }
  
  /**
   * Get a hex version of the current time in seconds, helpful for cache invalidation in URLs
   */
  getTimeHex( ms ){
    let time = ms ? Date.now() : Date.now()/1000;
    return Math.round(time).toString(16);
  }
  
  /**
   * Get a unique token based on a given string, plus the time
   * Not absolutely guaranteed to be unique
   */
  getUniqueToken(str){
    str += '::' + this.getTimeHex(true);
    print('str',str);
    return str.hashCode();
  }
  
  /**
   * ---------------------------- Ember Data Helpers
   */
  
  /**
   * Format error information JSON API style for blackout-form
   */
  error(obj){
    
    return {
      errors: obj,
    };
    
  }
  
  logStackTrace(){
    var obj = {};
    Error.captureStackTrace(obj, this.logStackTrace);
    console.log(obj.stack);
  }
  
  getStackTrace(){
    var obj = {};
    Error.captureStackTrace(obj, this.getStackTrace);
    return obj.stack;
  }
  
  /**
   * Print object
   */
  inspectObject(obj){
    if(EmberInspector){
      EmberInspector.inspect(obj);
    } else {
      Ember.Logger.warn('Please ensure ember inspector is open before calling EmberInspector');
    }
  }
  inspectModel(data){ this.inspectObject(data); }
  inspectRecord(data){ this.inspectObject(data); }
  inspectRecords(data){ this.inspectObject(data); }
  inspect(data){ this.inspectObject(data); }
  
  /**
   * Env
   */
  
  getFileHost(){
    return config.assetFilesHost;
  }
  
  /**
   * ---------------------------- Util
   */
  
  processAttrs(attrs){
    $.each(attrs,(i,attr)=>{
      if(attr && typeof(attr) === 'object' && 'value' in attr){
        attrs[i] = attr.value;
      }
    });
    return attrs;
  }
  
  /**
   * Print JSON string of object, handling circular references
   */
  JSONize(obj){
    let cache = [];
    let str = JSON.stringify(obj, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null;
    return str;
  }

}

/**
 * A global store for all your stuff
 * @type {Object}
 */
Blackout.prototype.store = {};

var BlackoutInstance = new Blackout();

export function initialize( /*application*/ ) {
  // application.inject('route', 'foo', 'service:foo');
  Ember.Blackout = BlackoutInstance;
  
  // Variables
  Ember.Blackout.afterCSSTransition = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
  Ember.Blackout.afterCSSAnimation = 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';
  
  // Link some local functions
  Ember.Blackout.runManualEvent = _runManualEvent;
  Ember.Blackout.preventNextClick = _preventNextClick;
  Ember.Blackout.preventNextFastClick = _preventNextFastClick;
  Ember.Blackout.refreshHoverWatchers = _refreshWatchers;

  /**
   * Shortcut to blackout console logging
   */
  window.log = Ember.Blackout.log;
}

export default {
  name: 'blackout',
  initialize: initialize
};

/**
 * Jeremy's print, so we don't have to type console.log
 */
window.print = console.log.bind(console);

/**
 * Misc shims
 */

// Fix date.now in IE8-
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  };
}

/**
 * Form context for debounces
 */
Ember.FormContext = {
  name: 'currentForm'
};

/**
 * Jeremy's blackout namespace (used elsewhere)
 */
window.blackout = {};

/**
 * Jeremy's minimal OS detection
 */
window.os = {};
window.os.iOS = navigator.userAgent.match( /iPad/i ) || navigator.userAgent.match( /iPhone/i ) || navigator.userAgent.match( /iPod/i );
window.os.android = navigator.userAgent.match( /Android/i );
window.os.touchOS = window.os.iOS || window.os.android;

/**
 * Jeremy's minimal browser detections
 */
window.browsers = {};
window.browsers.chromeiOS = /crios/i.test(navigator.userAgent);
window.browsers.chrome = /Chrome/i.test(navigator.userAgent) && !window.browsers.chromeiOS;
window.browsers.safari = /Safari/i.test(navigator.userAgent) && !window.browsers.chrome;
window.browsers.safariOS = /(iPod|iPhone|iPad)/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !window.browsers.chromeiOS;
window.browsers.webkit = navigator.userAgent.indexOf('AppleWebKit') !== -1;
window.browsers.standalone = window.navigator.standalone;
window.browsers.firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
//window.browsers.standalone = false;

/**
 * Jeremy's minimal os and browser detections
 * Add as needed
 */
window.features = {};
//window.browsers.standalone = true;
window.features.canParallax = !window.os.iOS&&!window.os.android;


//window.features.lockBody = window.browsers.safariOS && window.browsers.standalone;
// Performance is too slow in Chrome, Safari when page resizes on vertical scroll.
// So we just lock auto scrolling on ios and android.
window.features.lockBody = window.os.iOS || window.os.android;

// Lock body in all browsers, makes scrollbars look nicer
window.features.lockBody = true;


/**
 * Scroll body selector
 */
if(window.features.lockBody){
  window.features.lockBodyScroller = '#nav-body';
}



/**
 * String extensions
 */
String.prototype.ucFirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.lcFirst = function() {
  return this.charAt(0).toLowerCase() + this.slice(1);
};
String.prototype.nl2br = function() {
  return this.replace(/(?:\r\n|\r|\n)/g, '<br>');
};

String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

String.prototype.regexLastIndexOf = function(regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) === "undefined") {
        startpos = this.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = this.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    let result;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
};


  
String.prototype.trim = function(charlist) {
  //  discuss at: http://phpjs.org/functions/trim/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: mdsjack (http://www.mdsjack.bo.it)
  // improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Steven Levithan (http://blog.stevenlevithan.com)
  // improved by: Jack
  //    input by: Erkekjetter
  //    input by: DxGx
  // bugfixed by: Onno Marsman
  //   example 1: trim('    Kevin van Zonneveld    ');
  //   returns 1: 'Kevin van Zonneveld'
  //   example 2: trim('Hello World', 'Hdle');
  //   returns 2: 'o Wor'
  //   example 3: trim(16, 1);
  //   returns 3: 6

  var whitespace, l = 0,
    i = 0;
  var str = this;

  if (!charlist) {
    // default list
    whitespace =
      ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
  } else {
    // preg_quote custom list
    charlist += '';
    whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
  }

  l = str.length;
  for (i = 0; i < l; i++) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(i);
      break;
    }
  }

  l = str.length;
  for (i = l - 1; i >= 0; i--) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(0, i + 1);
      break;
    }
  }

  return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
};


  
String.prototype.rtrim = function(charlist) {
  //  discuss at: http://phpjs.org/functions/rtrim/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Erkekjetter
  //    input by: rem
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //   example 1: rtrim('    Kevin van Zonneveld    ');
  //   returns 1: '    Kevin van Zonneveld'
  var str = this;
  charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
  var re = new RegExp('[' + charlist + ']+$', 'g');
  
  return (str + '').replace(re, '');
};
  
/**
 * Replace a specified part of a string
 * @param  {string} str     The subject string to act upon
 * @param  {string} replace The new sub string
 * @param  {int} start      The start point in the subject string
 * @param  {int} length     The length of the subject string to replace
 * @return {string}         The new string
 * 
 * Discuss at: http://phpjs.org/functions/substr_replace/
 * Original by: Brett Zamir (http://brett-zamir.me)
 */
String.prototype.substrReplace = function(replace, start, length) {
  
  var str = this;
  if (start < 0) { // start position in str
    start = start + str.length;
  }
  length = length !== undefined ? length : str.length;
  if (length < 0) {
    length = length + str.length - start;
  }

  return str.slice(0, start) + replace.substr(0, length) + replace.slice(length) + str.slice(start + length);
};

String.prototype.stripMarkdown = function(options) {
  
  let md = this;
  options = options || {};
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : false;

  var output = md;
  try {
    if (options.stripListLeaders) {
      output = output.replace(/^([\s\t]*)([\*\-\+]|\d\.)\s+/gm, '$1');
    }
    output = output
      // Remove HTML tags
      .replace(/<(.*?)>/g, '$1')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[.*?\][\[\(].*?[\]\)]/g, '')
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^\#{1,6}\s*([^#]*)\s*(\#{1,6})?/gm, '$1')
      .replace(/([\*_]{1,2})(\S.*?\S)\1/g, '$2')
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      .replace(/^-{3,}\s*$/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\n{2,}/g, '\n\n');
  } catch(e) {
    console.error(e);
    return md;    
  }
  return output;
};

/**
 * Strips any non-alphanumeric characters
 */
String.prototype.alphaNumeric = function() {
  return this.replace(/[^a-zA-Z0-9]/g,'');
};

/**
 * Generate a hash integer from a string
 * (Faster than md5)
 */
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0){
    return hash;
  }
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Prepare a string id for use with API requests using a unique string instead of the normal number ID. Used for example, when reqiesting managers via their username
 * @return {string} The prepared string.
 */
String.prototype.pkString = function() {
  return this.toLowerCase().replace(/ /g,'_sp_');
};

/**
 * php.js version of str_replace
 * @param  {string|array} search  The string or array of strings to search for
 * @param  {string|array} replace The string or array of strings to use as replacements
 * @param  {number} count         Optional, Limit the replacements to this number
 * @return {string}               The final string.
 */
String.prototype.str_replace = function(search, replace, count) {

  let subject = this;

  var i = 0,
    j = 0,
    temp = '',
    repl = '',
    sl = 0,
    fl = 0,
    f = [].concat(search),
    r = [].concat(replace),
    s = subject,
    ra = Object.prototype.toString.call(r) === '[object Array]',
    sa = Object.prototype.toString.call(s) === '[object Array]';
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }

  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue;
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + '';
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
      s[i] = (temp)
        .split(f[j])
        .join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  return sa ? s : s[0];
};

/**
 * Encode any markdown special characters into html codes
 * @param  {boolean} decode Set to true to reverse the process
 * @return {string}         The encoded string
 */
String.prototype.encodeMarkdownChars = function(decode=false){
  
  let markdownChars = [
    '#', // must be first html etities have hash in them
    '*',
    '_',
    '~',
    '=',
    '[',
    ']',
    '(',
    ')',
    '>',
    '!',
    '@',
    '.',
    ':',
  ];
  
  let htmlCodes = [
    '&#35;', // #
    '&#42;', // *
    '&#95;', // _
    '&#126;', // ~
    '&#61;', // =
    '&#91;', // [
    '&#93;', // ]
    '&#40;', // (
    '&#41;', // )
    '&gt;', // >
    '&#33;', // !
    '&#64;', // @
    '&#46;', // .
    '&#58;', // :
  ];
  
  if(!decode){
    return this.str_replace(markdownChars,htmlCodes);
  } else {
    return this.str_replace(htmlCodes.reverse(),markdownChars.reverse());
  }
  
};

/**
 * Decode any markdown special characters
 * @return {string}         The encoded string
 */
String.prototype.decodeMarkdownChars = function(){
  
  return this.encodeMarkdownChars(true);
  
};

String.prototype.generalizeRoute = function(){
  
  return this.replace(/\/(?:[0-9]+|me)(\/?)/,function(fullMatch,endSlash){
    return '/:id' + endSlash;
  });
  
};

String.prototype.strtr = function(from, to){
  //  discuss at: http://phpjs.org/functions/strtr/
  // original by: Brett Zamir (http://brett-zamir.me)
  //    input by: uestla
  //    input by: Alan C
  //    input by: Taras Bogach
  //    input by: jpfle
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //  depends on: krsort
  //  depends on: ini_set
  //   example 1: $trans = {'hello' : 'hi', 'hi' : 'hello'};
  //   example 1: strtr('hi all, I said hello', $trans)
  //   returns 1: 'hello all, I said hi'
  //   example 2: strtr('äaabaåccasdeöoo', 'äåö','aao');
  //   returns 2: 'aaabaaccasdeooo'
  //   example 3: strtr('ääääääää', 'ä', 'a');
  //   returns 3: 'aaaaaaaa'
  //   example 4: strtr('http', 'pthxyz','xyzpth');
  //   returns 4: 'zyyx'
  //   example 5: strtr('zyyx', 'pthxyz','xyzpth');
  //   returns 5: 'http'
  //   example 6: strtr('aa', {'a':1,'aa':2});
  //   returns 6: '2'
  
  let str = this;
  if(!from){
    return str;
  }

  let i = 0,
    j = 0,
    lenStr = 0,
    lenFrom = 0,
    fromTypeStr = '',
    toTypeStr = '',
    istr = '';
  var tmpFrom = [];
  var tmpTo = [];
  var ret = '';
  var match = false;

  // Received replace_pairs?
  // Convert to normal from->to chars
  if (typeof from === 'object' && Object.prototype.toString.call( from ) !== '[object Array]') {
    
    $.each(from,(fromChar,toChar)=>{
      tmpFrom.push(fromChar);
      tmpTo.push(toChar);
    });

    from = tmpFrom;
    to = tmpTo;
  } else if(!to){
    return str;
  }

  // Walk through subject and replace chars when needed
  lenStr = str.length;
  lenFrom = from.length;
  fromTypeStr = typeof from === 'string';
  toTypeStr = typeof to === 'string';

  for (i = 0; i < lenStr; i++) {
    match = false;
    if (fromTypeStr) {
      istr = str.charAt(i);
      for (j = 0; j < lenFrom; j++) {
        if (istr === from.charAt(j)) {
          match = true;
          break;
        }
      }
    } else {
      for (j = 0; j < lenFrom; j++) {
        if (str.substr(i, from[j].length) === from[j]) {
          match = true;
          // Fast forward
          i = (i + from[j].length) - 1;
          break;
        }
      }
    }
    if (match) {
      ret += toTypeStr ? to.charAt(j) : to[j];
    } else {
      ret += str.charAt(i);
    }
  }

  return ret;
};



/**
 * Array extensions
 */

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushUnique = function (item){
    if(this.indexOf(item) === -1) {
        this.push(item);
        return true;
    }
    return false;
};

/**
 * Remove item by value
 * array.remove(value);
 */
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

/**
 * Prevent mouse events up and down from being fired if the event chain
 * started with touchstart
 * 
 * These functions will be always called if an event is fired,
 * even if stopImmediatePropagation is used on the event target
 * 
 * The 'true' is for event capturing, meaning these are fired first, always.
 * 
 * Added this to prevent mousedown being fired on the same element
 * where touchstart had already been fired (when closing a float window,
 * the mousedown event would hit items underneath the touch blocker).
 */

let _preventMouseDown,_preventMouseUp,_touchMoved,_waitingForClick,_stopNextClick,_stopNextFastClick,_isFastClicking;
let forceFastClick = window.os.touchOS || window.browsers.standalone;


document.documentElement.addEventListener('touchstart', function(){
  _preventMouseDown = true;
  _preventMouseUp = true;
  _touchMoved = false;
  if(!_isFastClicking){
    _stopNextClick = false;
  }
}, true);

document.documentElement.addEventListener('touchmove', function(){
  _touchMoved = true;
}, true);

document.documentElement.addEventListener('touchend', function(e){
  
  // Sometimes on mobile, touchstart and touchend can happen without triggering a click
  // No freakin idea why
  // Have seen time between touchend and click get up to 119, but that was on Samsung S3, while connected to laptop for debugging.
  
  if(!forceFastClick && !_touchMoved){
    
    _waitingForClick = true;
    
    window.setTimeout(()=>{
      if(_waitingForClick){
        _runManualEvent(e,'click');
      }
    },111);
    
  }
  
}, true);

document.documentElement.addEventListener('click', function(e){
  _waitingForClick = false;
  if(_stopNextClick){
    e.preventDefault();
    e.stopImmediatePropagation();
    _stopNextClick = false;
  }
  if(Ember.Blackout){
    Ember.Blackout.lastClickEvent = e;
  }
}, true);

document.documentElement.addEventListener('mousedown', function(e){
  if(_preventMouseDown&&!e.isManual){
    //e.preventDefault(); // Breaks text inputs on mobile
    e.stopImmediatePropagation();
    _preventMouseDown = false;
  }
}, true);

document.documentElement.addEventListener('mouseup', function(e){
  if(_preventMouseUp&&!e.isManual){
    //e.preventDefault(); // Breaks text inputs on mobile
    e.stopImmediatePropagation();
    _preventMouseUp = false;
  }
}, true);

/**
 * Hammer-time doesn't fix clicks on standalone
 */
if(forceFastClick){
  
  let _touchElement;
  
  document.documentElement.addEventListener('touchstart', function(e){
    if(e.originalEvent){
      e = e.originalEvent;
    }
    _touchElement = e.target;
  }, true);
  
  document.documentElement.addEventListener('touchend', function(e){
    if(e.originalEvent){
      e = e.originalEvent;
    }
    
    _stopNextClick = false;
    
    if(!_touchMoved && !e.isManual){
      _stopNextFastClick = false;
      if(_touchElement===e.target){
        _stopNextClick = true;
        _isFastClicking = true;
        window.setTimeout(()=>{
          _isFastClicking = false;
          if(!_stopNextFastClick){
            let ogStopper = _stopNextClick;
            _stopNextClick = false;
            _runManualEvent(e,'click',e.target);
            _stopNextClick = ogStopper;
          }
          _stopNextFastClick = false;
        },1);
      } else {
        _stopNextClick = true;
      }
    }
  }, true);
  
}

function _runManualEvent(e,eventType,theTarget=null){
  if(e.originalEvent){
    e = e.originalEvent;
  }
  if(e.changedTouches){
    
    if(!theTarget){
      theTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
    
    if(!theTarget){
      Ember.Logger.warn('No target found at client position ['+e.changedTouches[0].clientX+', '+e.changedTouches[0].clientY+']');
      theTarget = e.target;
    }
    if(theTarget.nodeType === 3){
      theTarget = theTarget.parentNode;
    }
    
    let theEvent;
    if((eventType==='touchstart' || eventType==='touchmove' || eventType==='touchend')){
      
      try {
        theEvent = document.createEvent('UIEvent');
        theEvent.isManual = true;
        theEvent.initUIEvent(eventType, true, true);
      } catch (err2) {
        theEvent = document.createEvent('Event');
        theEvent.isManual = true;
        theEvent.initEvent(eventType, true, true);
      }
      
    } else {
      theEvent = document.createEvent('MouseEvent');
      theEvent.isManual = true;
      theEvent.initMouseEvent(eventType, true, true);
    }
    
    theTarget.dispatchEvent(theEvent);
  }
}

function _preventNextClick(){
  _stopNextClick = true;
  window.setTimeout(function(){
    _stopNextClick = false;
  },1000);
}

function _preventNextFastClick(){
  _stopNextFastClick = true;
}

// The magic code // Shows all events triggered
/*var oldAddEventListener = EventTarget.prototype.addEventListener;

EventTarget.prototype.addEventListener = function(eventName, eventHandler)
{
  oldAddEventListener.call(this, eventName, function(event) {
    print(event.type);
    eventHandler(event);
  });
};*/

/**
 * Add functionality to the ember view class to manage hover states manually by applying a .hover class to .btn elements whenever a new section is rendered.
 * 
 * We do this so that we can do hovers on mobile properly (as opposed to the browser default for :hover which is to leave the hover state sticky after touch)
 * 
 * If you find yourself trying to just use :active, and/or :focus to remove hover state on mobile - the reason that doesn't work is because on desktop we then end up with buttons that lose hover state after a click. This is bad for buttons like the menu button which stay in place on screen.
 */
Ember.Component.reopen({
  
  _scheduleHoverWatcher: Ember.on('didInsertElement', function() {
    
    //log('setup watchers');
    
    Ember.run.once('_refreshWatchers', _refreshWatchers );
    Ember.run.once('inlinizeSVG', _inlinizeSVG );

  }),

});


var _hoverStartEvent,_hoverEventObj,_hoverEndEvent,_mouseDownTime=0,_clickTimeout;

function _refreshWatchers() {
  
  //log('refreshing watchers');
  
  // Prevent click after drag
  Ember.$('.btn,.btn-a').off('click touchend mouseup', _preventClickAfterDrag);
  Ember.$('.btn,.btn-a').onFirst('click', _preventClickAfterDrag);
  Ember.$('.btn,.btn-a').onFirst('touchend', _preventClickAfterDrag);
  Ember.$('.btn,.btn-a').onFirst('mouseup', _preventClickAfterDrag);
  
  // Hover
  //Ember.$('.btn,.btn-a,.btn-events').off('mouseenter touchstart', _hover);
  //Ember.$('.btn,.btn-a,.btn-events').on('mouseenter touchstart', _hover);
  Ember.$('.btn,.btn-a,.btn-events').each((i,el)=>{
    el.removeEventListener('mouseenter', _hover, true);
    el.removeEventListener('touchstart', _hover, true);
    el.addEventListener('mouseenter', _hover, true);
    el.addEventListener('touchstart', _hover, true);
    el.addEventListener('mousedown', _hover, true);
  });
  
  // Fastclick (Using hammertime)
  // This is automatically added to a, button, input, etc.
  /*Ember.$('.btn,.btn-a,.btn-events').css({
    'touch-action': 'manipulation',
    '-ms-touch-action': 'manipulation',
    'cursor': 'pointer',
  });*/

  // Leave
  Ember.$('.btn,.btn-a,.btn-events').off('mouseleave touchend', _leave);
  Ember.$('.btn,.btn-a,.btn-events').onFirst('mouseleave touchend', _leave);
  
  // Click
  Ember.$('.btn').off('click', _click);
  Ember.$('.btn').on('click', _click);
  
  // Detect clicks on btn-a
  // First click doesn't work when inside perfect-scrollbar on safari os x
  Ember.$('.btn-a').off('mousedown mouseup click', _mouse);
  Ember.$('.btn-a').on('mousedown mouseup click', _mouse);
  
}


/**
 * First click doesn't work when inside perfect-scrollbar on safari os x
 * This runs a manual click in this case.
 */
function _mouse (e) {
  
  if( e.type === 'mousedown' ){
    _mouseDownTime = Date.now();
  }
  
  if( e.type === 'mouseup' && Date.now()-_mouseDownTime<222 ){
  
    // Run a click shortly
    _clickTimeout = window.setTimeout(() => {
      $(this).click();
      _clickTimeout = null;
    },11);
    
  }
  
  if( e.type === 'click' ){
    if(_clickTimeout){
      window.clearTimeout(_clickTimeout);
    }
  }
  
}

function _hover (e) {

  //log('hover > ' + e.type);
  //print('hover > ' + e.type);

  if (!_hoverEndEvent ||

    (_hoverEndEvent === 'touchend' &&
      e.type === 'touchstart') ||

    (_hoverEndEvent === 'mouseleave' &&
      (e.type === 'mouseenter' || e.type === 'mousedown'))) {
    
    // For determining touch screen
    if (!_hoverStartEvent) {
      _hoverStartEvent = e.type;
    }
    
    // Handle 'pressed' class
    // Used for button animations that need to last beyond mouseup / touchend
    if(e.type === 'mousedown' || e.type === 'touchstart'){
      $(this).removeClass('pressed');
      window.setTimeout(()=>{
        $(this).addClass('pressed');
      },1);
      
      // No longer needed for mousedown
      if(e.type === 'mousedown'){
        return;
      }
    }
    
    _hoverEventObj = e;
    
    let ogE = e;
    if(ogE.originalEvent){
      ogE = ogE.originalEvent;
    }

    if (e.type === 'touchstart'||ogE.isManual) {
      
      // If item is scrollable
      // (Basing this behaviour on facebook app main menu)
      if(BlackoutInstance.elementOrParentIsScrollable(this)){
        
        if(!$(this).data('isTouching')){
          
          // Wait before allowing 'press' event
          //let timeoutId = Ember.run.later(this,()=>{
          //  _removeTouchTimeout($(this),timeoutId,'delayedPresses');
          //  _delayedPress($(this));
          //},77);
          
          //_addTouchTimeout($(this),timeoutId,'delayedPresses');
          
          // Add press straight away. It makes the app feel more reactive.
          // Press will then be removed if the user drags.
          $(this).siblings().removeClass('press');
          $(this).addClass('press');
          
          if(!ogE.isManual){
            window.setTimeout(()=>{
              _runManualEvent(ogE,e.type);
            },1);
          }
          
          let moveWrapper = (e)=>{
            e.callbackFunction = moveWrapper;
            e.realTarget = this;
            _move(e);
          };
          
          $(document)[0].addEventListener('touchmove',moveWrapper,true);
          //$('body').on('touchmove',$(this).siblings(),_move);
          
          $(this).data('isTouching',true);
        }
        
      } else {
        $(this).addClass('press');
      }
      
    } else {
      $(this).addClass('hover');
    }
    
    if(ogE.isManual){
      e.preventDefault();
      e.stopImmediatePropagation();
    }

  }
}

/*function _addTouchTimeout($item,timeoutId,groupName){
  var group = $item.data(groupName);
  if(!group){
    group = [];
  }
  group.push(timeoutId);
  $item.data(groupName,group);
}

function _removeTouchTimeout($item,timeoutId,groupName){
  var group = $item.data(groupName);
  if(!group){
    return;
  }
  group.remove(timeoutId);
  $item.data(groupName,group);
}*/

function _cancelAllTouchTimeouts($item,groupName){
  var group = $item.data(groupName);
  if(!group){
    return;
  }
  group.forEach(timeoutId=>{
    Ember.run.cancel(timeoutId);
  });
  $item.data(groupName,[]);
}

function _preventClickAfterDrag(e) {
  if($(this).data('isDrag')){
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}

function _leave (e) {

  //log('leave > ' + e.type);
  //print('leave > ' + e.type);

  if (!_hoverStartEvent ||

    (_hoverStartEvent === 'touchstart' &&
      e.type === 'touchend') ||

    (_hoverStartEvent === 'mouseenter' &&
      e.type === 'mouseleave')) {

    if (!_hoverEndEvent) {
      _hoverEndEvent = e.type;
    }
    
    $(this).removeClass('press hover');
    
    /**
     *   NOTICE: If CLICK events are not working, see the perfect scroll component
     */

    if (e.type === 'touchend') {
      
      // If item is scrollable
      // (Basing this behaviour on facebook app main menu)
      if(BlackoutInstance.elementOrParentIsScrollable(e.target)){
        
        // Cancel any delayed press events
        _cancelAllTouchTimeouts($(this),'delayedPresses');
        
        // Wait to mark as not dragging
        Ember.run.next(()=>{
          $(this).data('isTouching',false);
          $(this).data('isDrag',false);
        });
        
      }
      
    }

  }
}

function _click () {
  // Remove focus after click so buttons don't just sit there in the 'focused' state event after clicking. e.e. login button > sidebar > home screen > desktop.
  $(this).blur();
  
}

/**
 * Not sure 
 * @return {[type]} [description]
 */
/*function _delayedPress ( $el ) {
  if($el.data('isTouching') && !$el.data('isDrag')){
    $el.siblings().removeClass('press');
    $el.addClass('press');
  }
}*/

function _move (e) {
  //let timeoutId = e.data.timeoutId;
  
  /*if(timeoutId){
    Ember.run.cancel(timeoutId);
    _removeTouchTimeout($(this),timeoutId,'delayedPresses');
  }*/
  $(e.realTarget).removeClass('press');
  $(e.realTarget).siblings().removeClass('press');
  $(e.realTarget).data('isDrag',true);
  $(document)[0].removeEventListener('touchmove',e.callbackFunction,true);
}

/*
 * Replace all SVG images with inline SVG
 */
function _inlinizeSVG () {
  Ember.$('img.svg').each(function() {

    var $img = Ember.$(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgAlt = $img.attr('aria-label');
    var imgURL = $img.attr('src');
    var imgHost = config.assetFilesHost;
    //imgHost = 'https://s3.amazonaws.com/rugby-ember/';
    //imgHost = 'https://dah9mm7p1hhc3.cloudfront.net/';
    
    // Add cloudfront?
    if(imgURL.substr(0,4)!=='http' && imgHost!=='/'){
      $img.attr('src',imgHost.trim('/') + '/' + $img.attr('src').trim('/'));
      imgURL = $img.attr('src');
    }
    
    // Add svg rebuilder as function
    var rebuildSVG = function(){
      
      if(!$img.data('hasLoadedSVG')){
        
        $.ajax({
          url: imgURL,
          headers: {
          },
          dataType: 'xml',
        }).then(function(data){ //---------------- Success
          
          $img.data('hasLoadedSVG',true);
          
          // Get the SVG tag, ignore the rest
          var $svg = Ember.$(data).find('svg');

          // Add replaced image's ID to the new SVG
          if (typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
          }
          // Add replaced image's classes to the new SVG
          if (typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass + ' replaced-svg');
          }
          // Add replaced image's alt text to the new SVG
          if (typeof imgAlt !== 'undefined') {
            $svg = $svg.attr('aria-label', imgAlt);
          }

          // Remove any invalid XML tags as per http://validator.w3.org
          $svg = $svg.removeAttr('xmlns:a');

          // Replace image with new SVG
          $img.replaceWith($svg);
          
          if($img.data('ajaxCacheOff')){
            
            // Turn on cache
            $.ajaxSetup({ cache: true });
            
            // Track that cache has been turned off
            $img.data('ajaxCacheOff',false);
            
          }
          
        },function(/*xhr*/){ //---------------- Error
          
          if(!$img.data('ajaxCacheOff')){
            
            // Assume CORS issues from a cached SVG 
            // So we try again without cache
            
            
            // Turn off cache
            $.ajaxSetup({ cache: false });
            
            // Track that cache has been turned off
            $img.data('ajaxCacheOff',true);
            
            // Get SVG again
            rebuildSVG();
            
          } else {
            
            // Turn on cache
            $.ajaxSetup({ cache: true });
            
            // Track that cache has been turned off
            $img.data('ajaxCacheOff',false);
            
            // Don't go again
            
          }
          
        });
        
        
      }
      
      
    };
    
    rebuildSVG();

  });
}

/**
 * Charts.js customisation
 */

let customChartToolTipTimeout = null;

BlackoutInstance.customChartToolTips = function(tooltip) {
    
    let tooltipEl;
    if(tooltip){
      // Tooltip Element
      tooltipEl = $(tooltip.chart.canvas).siblings('.chartjs-tooltip');
    } else {
      $('.chartjs-tooltip').css({
        opacity: 0
      });
      return;
    }
    // Hide if no tooltip
    if(!tooltipEl.length){
      return;
    }
    if (!tooltip) {
        tooltipEl.css({
            opacity: 0
        });
        return;
    }
    // Set caret Position
    tooltipEl.removeClass('above below');
    tooltipEl.addClass(tooltip.yAlign);
    // Set Text
    tooltipEl.html(tooltip.text);
    // Find Y Location on page
    var top;
    if (tooltip.yAlign === 'above') {
        top = tooltip.y - tooltip.caretHeight - tooltip.caretPadding;
    } else {
        top = tooltip.y + tooltip.caretHeight + tooltip.caretPadding;
    }
    // Display, position, and set styles for font
    tooltipEl.css({
        opacity: 1,
        left: tooltip.chart.canvas.offsetLeft + tooltip.x + 'px',
        top: tooltip.chart.canvas.offsetTop + top + 'px',
        fontFamily: tooltip.fontFamily,
        fontSize: tooltip.fontSize,
        fontStyle: tooltip.fontStyle,
    });
    // If touch device, auto-hide
    if(window.os.touchOS){
      
      if(customChartToolTipTimeout!==null){
        Ember.run.cancel(customChartToolTipTimeout);
      }
      
      customChartToolTipTimeout = Ember.run.later(function(){
        BlackoutInstance.customChartToolTips();
        customChartToolTipTimeout = null;
      },3000);
    }
};

Chart.defaults.global.customTooltips = BlackoutInstance.customChartToolTips;

BlackoutInstance.hideAllToolTips = function(){
  Chart.defaults.global.customTooltips(null);
};

/**
 * jQuery extensions
 */

// Find closest relative with selector
(function($) {
  $.fn.findClosest = function(filter) {
    var $found = $(),
      $currentSet = this.children(); // Current place
    while ($currentSet.length) {
      $found = $currentSet.filter(filter);
      if ($found.length){
        break; // At least one match: break loop
      }
      // Get all children of the current set
      $currentSet = $currentSet.children();
    }
    return $found.first(); // Return first match of the collection
  };
})(Ember.$);

// Get position on-screen
(function($) {
  $.fn.offsetWindow = function() {
    var offset = $(this).offset();
    var posY = offset.top - $(window).scrollTop();
    var posX = offset.left - $(window).scrollLeft();
    return { left: posX, top: posY };
  };
})(Ember.$);


Ember.$.extend( Ember.$.fn, {
  
  /**
   * Returns items within another item
   */
  within: function( pSelector ) {
    // Returns a subset of items using jQuery.filter
    return this.filter(function(){
      // Return truthy/falsey based on presence in parent
      return $(this).closest( pSelector ).length;
    });
  },
  
  /**
   * Returns boolean, true if first item has second item as a parent
   */
  hasParent: function( pSelector ) {
    // Returns a subset of items using jQuery.filter
    return this.within(pSelector).length>0;
  },

  /**
   * Get position of element, relative to the given element
   */
  positionRelativeTo: function( $element ) {
    return {
      top: $(this).offset().top - $element.offset().top,
      left: $(this).offset().left - $element.offset().left,
    };
  },
  
});

/**
 * Fixes bug in IE Edge (and maybe 10 and 11) where fixed items would scroll a little bit when scrolling with mouse wheel before returning to where they should be.
 * https://social.msdn.microsoft.com/Forums/ie/en-US/9567fc32-016e-48e9-86e2-5fe51fd67402/new-bug-in-ie11-scrolling-positionfixed-backgroundimage-elements-jitters-badly?forum=iewebdevelopment
 */
if(navigator.userAgent.match(/MSIE 10/i) || navigator.userAgent.match(/MSIE 11/i) || navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.match(/Edge\/[0-9]+\./)) {
  $(window.features.lockBody?'#nav-body':'body').on("DOMMouseScroll mousewheel", function () {
    if(!$(event.target).parents('.fix-mousewheel-scroll').length){
      event.preventDefault();
      var wd = event.wheelDelta;
      var csp = window.pageYOffset;
      window.scrollTo(0, csp - wd);
    }
  });
}

/**
 * Fixes a bug with scrollable divs where the mousewheel doesn't work, and it just scrolls the document/body
 * 
 * Apr 28 2016
 * Made changes to prevent this from stealing all mouse
 * events once a div had been scrolled all the way to either extreme.
 * If bug re-appear that this was supposed to fix, note them here.
 */
$(document).on('DOMMouseScroll mousewheel', '.fix-mousewheel-scroll', function(ev) {
    var $this = $(this),
        scrollWidth = this.scrollWidth,
        width = $this.width(),
        delta = (ev.type === 'DOMMouseScroll' ?
            ev.originalEvent.detail * -40 :
            ev.originalEvent.wheelDelta),
        up = delta > 0;

    var prevent = function() {
        ev.stopPropagation();
        ev.preventDefault();
        ev.returnValue = false;
        return false;
    };
    
    // Horizontal scrolling
    if(scrollWidth > width){
      
      var scrollLeft = this.scrollLeft,
        maxScrollLeft = scrollWidth - width;
      
      if (!up && -delta > scrollWidth - width - scrollLeft && scrollLeft < maxScrollLeft) {
          // Scrolling down, but this will take us past the bottom.
          $this.scrollLeft(maxScrollLeft);
          return prevent();
      } else if (up && delta > scrollLeft && scrollLeft > 0) {
          // Scrolling up, but this will take us past the top.
          $this.scrollLeft(0);
          return prevent();
      }
      
    // Vertical scrolling
    } else {
      
      var scrollTop = this.scrollTop,
        scrollHeight = this.scrollHeight,
        height = $this.height(),
        maxScrollTop = scrollHeight - height;

      if (!up && -delta > scrollHeight - height - scrollTop && scrollTop < maxScrollTop) {
          // Scrolling down, but this will take us past the bottom.
          $this.scrollTop(maxScrollTop);
          return prevent();
      } else if (up && delta > scrollTop && scrollTop > 0) {
          // Scrolling up, but this will take us past the top.
          $this.scrollTop(0);
          return prevent();
      }
      
    }
});

/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    // Browser globals
    factory($);
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));


/**
 * Allows us to insert an element at a certain index within children
 */
$.fn.insertAt = function(index, element) {
  var lastIndex = this.children().size();
  if (index < 0) {
    index = Math.max(0, lastIndex + 1 + index);
  }
  this.append(element);
  if (index < lastIndex) {
    this.children().eq(index).before(this.children().last());
  }
  return this;
};

/*
 LockableStorage.lock(key, lockAquiredCallback, bool:wait)
*/
(function () {

    function now() {
        return new Date().getTime();
    }
    
    function someNumber() {
        return Math.random() * 1000000000 | 0;
    }

    var myId = now() + ":" + someNumber();
    
    /**
     * Gets expiring key from localStorage
     * If key does not exist, or exists but expired, returns null.
     */
    function getter(lskey) {
        return function () {
            var value = localStorage[lskey];
            if (!value){
              return null;
            }
            
            var splitted = value.split(/\|/);
            if (parseInt(splitted[1]) < now()) {
                return null;
            }
            return splitted[0];
        };
    }
    
    /**
     * 
     */
    function _mutexTransaction(mutexKey, mutexValue, callback) {
        
        // Attempt to take lock (others may do the same)
        localStorage[mutexKey] = mutexValue;
        //console.log('set mutex',mutexValue);
        
        // Check later that we still own it
        setTimeout(callback, 44);
        
    }
    
    function lockImpl(key, callback, maxDuration=5000, wait=false, failedCallback=()=>{}) {
        var mutexKey = key + "__MUTEX",
            getMutex = getter(mutexKey),
            mutexValue = myId + ":" + someNumber() + "|" + (now() + maxDuration);
        
        function restart () {
            setTimeout(function () { lockImpl(key, callback, maxDuration, wait); }, 10);
        }
        
        /**
         * If lock exists, return false, or wait
         */
        if (getMutex()) {
            if (wait){
              restart();
            }
            failedCallback();
            return;
        }
        
        /**
         * Get lock
         */
        _mutexTransaction(mutexKey, mutexValue, function () {
          
            // Make sure we still own the lock
            if (localStorage[mutexKey] !== mutexValue) {
                if (wait){
                  restart();
                }
                failedCallback();
                return;
            }
            
            if (wait){
              setTimeout(mutexAquired, 0);
              return;
            }
            mutexAquired();
            
        });
        
        return;
        
        function mutexAquired() {
            BlackoutInstance.assertPromise(callback()).finally(()=>{
              if (localStorage[mutexKey] !== mutexValue){
                //console.log('expexting mutex',mutexValue, 'got',localStorage[mutexKey]);
                throw key + " was locked by a different process while I held the lock";
              }
              
              // Release lock
              localStorage.removeItem(mutexKey);
            });
        }
        
    }
    
    window.LockableStorage = {
      lockAndRunNow: function (key, callback, maxDuration, failedCallback) { return lockImpl(key, callback, maxDuration, false, failedCallback); },
      waitForLock: function (key, callback, maxDuration) { return lockImpl(key, callback, maxDuration, true); },
    };
})();


/**
 * Allows us to bind an event to be called first when
 * the event is fired
 */
$.fn.onFirst = function(name, fn) {
  var elem, handlers, i, _len;
  this.bind(name, fn);
  for (i = 0, _len = this.length; i < _len; i++) {
    elem = this[i];
    handlers = $._data(elem).events[name.split('.')[0]];
    if(handlers){
      handlers.unshift(handlers.pop());
    }
  }
};

/**
 * Put cursor at end of text field or textarea
 */
$.fn.putCursorAtEnd = function(){

  return this.each(function() {

    $(this).focus();

    // If this function exists...
    if (this.setSelectionRange) {
      // ... then use it (Doesn't work in IE)

      // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
      var len = $(this).val().length * 2;

      this.setSelectionRange(len, len);
    
    } else {
    // ... otherwise replace the contents with itself
    // (Doesn't work in Google Chrome)

      $(this).val($(this).val());
      
    }

    // Scroll to the bottom, in case we're in a tall textarea
    // (Necessary for Firefox and Google Chrome)
    this.scrollTop = 999999;

  });
  
};