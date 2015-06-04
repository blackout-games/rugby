import Ember from 'ember';

export default Ember.Component.extend({
  contextElementId: '',
  
  setupLinks: function(){
    Ember.$('[id^=link-] > a').on('mousedown touchstart',this.handleLink);
  }.on('didInsertElement'),
  
  cleanLinks: function(){
    Ember.$('[id^=link-] > a').off('mousedown touchstart',this.handleLink);
  }.on('willDestroy'),
  
  handleLink: function(){
    Ember.$('[id^=link-]').data('ignore-link',false);
    Ember.$(this).parent().addClass('active').siblings().removeClass('active').data('ignore-link',true);
  }
});
