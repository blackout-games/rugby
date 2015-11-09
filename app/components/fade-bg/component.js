import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['fade-bg-default'],
  defaultColor: 'tomato',
  
  setup: Ember.on('didInsertElement',function(){
    
    var $fadeBg = this.$().findClosest('.fade-bg');
    //var self = this;
    
    // Set default background color
    this.$().css('background-color',this.get('defaultColor'));
    
    if(this.get('imageClass')){
      $fadeBg.addClass(this.get('imageClass') + ' fade-bg-ready');
      
      // Get image url
      var url = Ember.Blackout.getCSSPseudoValue('background-image',$fadeBg,':before').replace(/url\(/,'').rtrim(')');
      
      // Load image
      Ember.Blackout.preloadImage(url,function() {
        Ember.run.next(function(){
          $fadeBg.addClass('fade-bg-show');
        });
      });
    }
    
  }),
  
});
