import Ember from 'ember';

/**
 * Sometimes a "jump" can still be observed when a fader is hidden. But this is only external.
 * It happens when this element resides at the bottom of a parent element with a bottom margin, and below another element with a bottom margin. These margins will "collapse" when no other element separates them, therefore when this fader is removed, those two margins remaining will collapse instantly giving the "jump" effect.
 * 
 * Two options:
 * 1. We add a dummy div here in the fader so this can never happen, or
 * 2. We change the layout of the parent and sibling div so their margins won't overlap.
 */

export default Ember.Component.extend({
  classNames: ['blackout-fader','inactive','clearfix'],
  
  setup: Ember.on('didInsertElement',function(){
    if(this.get('active')){
      this.$().removeClass('inactive');
      if(!this.get('showing')){
        this.hide(true);
        if(this.get('debugFader')){
          this.$().data('debugFader',true);
        }
      } else {
        Ember.Blackout.waitForSizeOfHidden(this.$(),(size)=>{
          this.set('height',size.height);
          this.show(true);
        });
      }
      
      // Add divider div to prevent margin collapse jumping
      let $div = Ember.$('<div class="divider"></div>');
      $div.insertAfter(this.$());
    }
    
  }),
  
  detectChange: Ember.on('didUpdateAttrs',function(opts){
    if( this.attrChanged(opts,'showing')){
      if(this.get('showing')){
        this.show();
      } else {
        this.hide();
      }
    }
  }),
  
  show( immediate ){
    
    Ember.Blackout.waitForSizeOfHidden(this.$(),(size)=>{
      
      this.$().show();
      Ember.run.next(()=>{
        
        this.set('height',size.height);
        
        this.$().css('overflow','visible');
        if(immediate){
          this.$().addClass('no-transition');
        } else {
          this.$().removeClass('no-transition');
        }
        this.$().css({
          'max-height': this.get('height'),
          opacity: 1,
        }).off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
          this.$().css('max-height','none');
          this.$().addClass('no-transition');
        }).removeClass('no-margin');
        
        if(immediate){
          this.$().css('max-height','none');
          this.$().addClass('no-transition');
        }
        
      });
      
    });
    
  },
  
  hide( immediate ){
    let $el = this.$();
    // Skip any CSS transitions to the end
    this.$().addClass('no-transition');
    this.$().css('max-height',this.$().height());
    if(immediate){
      this.$().addClass('no-margin');
    }
    Ember.run.next(()=>{
      this.$().removeClass('no-transition');
      this.$().addClass('no-margin');
      if(this.$().height()>0){
        this.set('height',this.$().height());
      }
      if(!immediate){
        this.$().css('max-height',this.get('height'));
      }
      $el.css('overflow','hidden');
      Ember.run.later(()=>{
        if($el){
          $el.css({
            'max-height': '0px',
            opacity: 0,
          }).off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
            
            /**
             * Remove children
             * This enables tabbing on keyboard to skip over elements in this fader
             * We don't remove the parent because otherwise we lose margins,
             * which causes jumping
             */
            //$el.children().hide();
            
            /**
             * We've since added animations for the margins too, so we can now just hide the parent
             */
            $el.hide();
            
          });
          
          if(immediate){
            this.$().hide();
          }
          
        } else {
          print('CSS didnt exist',this.$());
        }
      },44);
    });
    
  },
  
});
