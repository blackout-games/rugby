import Ember from 'ember';

export default Ember.Component.extend({
  
  /**
   * INCOMLETE
   */
  
  /**
   * The image URL or src
   * @type {String}
   */
  url: '',
  
  /**
   * Internals
   */
  
  classNames: ['img-responsive'],
  tagName: 'img',
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().attr('src',this.get('url'));
    
  }),
  
});
