import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['sticky-footer-wrapper'],
  
  setup: function(){
    
    Ember.$('.sticky-footer-content').css({
      'margin-bottom': '-' + this.get('footerHeight')
    });
    Ember.$('.sticky-footer').css({
      'height': this.get('footerHeight')
    });
    document.styleSheets[0].addRule('.sticky-footer-content:after','height: ' + this.get('footerHeight'));
    document.styleSheets[0].insertRule('.sticky-footer-content:after { color: ' + this.get('footerHeight') + ' }', 0);
    
  }.on('didInsertElement')
  
});
