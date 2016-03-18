import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['blackout-fader','inactive','clearfix'],
  
  setup: Ember.on('didInsertElement',function(){
    if(this.get('active')){
      this.$().removeClass('inactive');
      if(!this.get('showing')){
        this.hide(true);
        Ember.Blackout.waitForHeightOfHidden(this.$(),(height)=>{
          this.set('height',height);
        });
      } else {
        Ember.Blackout.waitForHeightOfHidden(this.$(),(height)=>{
          this.set('height',height);
          this.show(true);
        });
      }
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
    this.$().css('overflow','visible');
    this.$().children().show();
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
    });
  },
  
  hide( immediate ){
    let $el = this.$();
    // Skip any CSS transitions to the end
    this.$().addClass('no-transition');
    this.$().css('max-height',this.$().height());
    Ember.run.next(()=>{
      this.$().removeClass('no-transition');
      if(this.$().height()>0){
        this.set('height',this.$().height());
      }
      if(!immediate){
        this.$().css('max-height',this.get('height'));
      }
      Ember.run.later(()=>{
        if($el){
          $el.css({
            'max-height': '0px',
            opacity: 0,
          }).off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
            $el.css('overflow','hidden');
            // Remove children
            // This enables tabbing on keyboard to skip over elements in this fader
            // We don't remove the parent because otherwise we lose margins, which causes jumping
            $el.children().hide();
          });
        } else {
          print('CSS didnt exist',this.$());
        }
      },44);
    });
    
  },
  
});
