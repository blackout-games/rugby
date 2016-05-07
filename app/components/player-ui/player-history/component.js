import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  isLoadingData: true,
  
  resetOnChange: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'player')){
      this.set('isLoadingData',true);
    }
  }),
  
  data: Ember.computed( 'player', function(){
    let data = this.dataProxy();
    
    if(!data || data.then){
      return null;
    }
    
    return data;
  }),
  
  dataProxy(){
    
    let playerid = this.get('player.id');
    let cache = this.get('cache');
    
    // Caching
    let key = 'playerHistory_' + playerid;
    if(cache.keyExists(key)){
      this.set('isLoadingData',false);
      return cache.get(key);
    }
    
    let query = {
      filter: {
        'player-id': playerid,
      },
      page: {
        size:100,
      }
    };
    
    Ember.Blackout.startLoading();
    
    return this.get('store').queryRecord('player-history',query).then((data)=>{
      
      Ember.Blackout.stopLoading();
      // data;
      
      //data = data.get('firstObject').toJSON();
      
      cache.set(key,data);
      
    }).finally(()=>{
      // Force refresh of currentSeason stats
      this.notifyPropertyChange('player');
      this.set('isLoadingData',false);
    });
    
  },
  
});
