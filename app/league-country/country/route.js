import Ember from 'ember';

export default Ember.Route.extend({
  info: Ember.inject.service(),
  
  model(params){
    
    if(!params.country_id){
      this.intermediateTransitionTo('nope');
      return;
    }
    
    let query = {
      season: this.get('info.gameDate.season'),
      country: params.country_id
    };
    
    // Need a hash here, to get country details as well
    // Also add season to the hash, or just use info service directly in template?
    let hash = {
      
      divisions: this.get('store').findRecord('custom','league-country',{ adapterOptions: { query: query }}).then((data)=>{
        
        data = JSON.parse(window.JXG.decompress(data.get('customData')));
        
        return data;
      }),
      
      country: this.get('store').findRecord('country',params.country_id),
      
    };
    
        
    return Ember.RSVP.hash(hash).then((data) => {
      
      data.season = this.get('info.gameDate.season');
      return data;
      
    });
    
  },
  
});
