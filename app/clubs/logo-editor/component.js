import Ember from 'ember';

export default Ember.Component.extend({
  
  actions: {
    saveClubImage(url,succeed,fail,final){
      
      let model = this.get('club');
      
      model.set('logo',url);
      model.patch({ logo: true }).then(()=>{
        
        succeed();
        
      },fail).finally(final);
      
    },
  },
  
});
