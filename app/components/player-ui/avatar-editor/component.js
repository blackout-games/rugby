import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  actions: {
    savePlayerImage(url,succeed,fail,final){
      
      let id = this.get('player.id');
      let model = this.get('store').peekRecord('player',id);
      
      model.set('imageUrl',url);
      model.patch({ imageUrl: true }).then(()=>{
        
        succeed();
        
      },fail).finally(final);
      
    },
  },
  
  clubIsNotPremium: Ember.computed('player',function(){
    return ! this.get('session').clubIsPremium(this.get('player.club.id'));
  }),
});
