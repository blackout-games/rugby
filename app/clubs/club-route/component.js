import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['dash-box'],
  
  actions: {
    saveClubKit(url,succeed,fail,final){
      
      let model = this.get('club');
      
      model.set('kit',url);
      model.patch({ kit: true }).then(()=>{
        
        succeed();
        
      },fail).finally(final);
      
    },
  },
  
});
