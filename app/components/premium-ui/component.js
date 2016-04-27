import Ember from 'ember';

export default Ember.Component.extend({
  
  active:true,
  classNameBindings: ['classNamesIfHidden'],
  
  classNamesIfHidden: Ember.computed('classIfHidden','hideFeature',function(){
    if(this.get('hideFeature') && this.get('classIfHidden')){
      return this.get('classIfHidden');
    } else {
      return false;
    }
  }),
  
  hideFeature: Ember.computed('active',function(){
    return this.get('active') && !this.get('session.isPremium');
  }),
  
});
