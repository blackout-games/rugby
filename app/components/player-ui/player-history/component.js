import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  isLoadingData: true,
  
  actions: {
    fetchMore(){
      this.dataProxy(true);
    },
  },
  
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
  
  firstLoad: true,
  page:1,
  
  dataProxy(nextPage){
    
    let playerid = this.get('player.id');
    let key = 'playerHistory_' + playerid;
    let cache = this.get('cache');
    let firstLoad = this.get('firstLoad');
    let page = this.get('page');
    let pages = this.get('pages');
    let newPage;
    
    this.set('firstLoad',false);
    
    let query = {
      filter: {
        'player-id': playerid,
      },
      page: {
        size:20,
      }
    };
    
    if (nextPage && page) {
      if(page===pages){
        // No more pages
        return;
      }
      newPage = Number(page) + 1;
      query.page.number = newPage;
      key += '_page' + newPage;
    }
    
    // Caching
    if(cache.keyExists(key)){
      this.set('isLoadingData',false);
      return cache.get(key);
    }
    
    if (firstLoad) {
      Ember.Blackout.startLoading();
      // Let tab know we're going to load more stuff
      this.attrs.registerTabLoading();
    }
    
    this.set('isLoadingData',true);
    
    return this.get('store').query('player-history',query).then((data)=>{
      
      this.set('page', data.get('meta.page'));
      this.set('pages', data.get('meta.num-pages'));
      
      if (firstLoad) {
        Ember.Blackout.stopLoading();
      }
      // data;
      
      //data = data.get('firstObject').toJSON();
      
      cache.set(key,data);
      
    }).finally(()=>{
      if(nextPage){
        // Set data to add
        this.set('addToData',cache.get(key));
      } else {
        // Force refresh of currentSeason stats
        this.notifyPropertyChange('player');
      }
      this.set('isLoadingData',false);
      if (firstLoad) {
        // Let tab know we're done
        this.attrs.finishTabLoading();
      }
    });
    
  },
  
});
