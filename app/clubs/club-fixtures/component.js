import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  // Show loader only on first load
  isLoadingData: true,
  firstLoad: true,
  
  data: Ember.computed( 'club', function(){
    let data = this.dataProxy();
    
    if(data && data.then){
      return this.get('previousData');
    } else if(!data){
      return Ember.Object.create();
    }
    this.set('previousData',data);
    return data;
  }),
  
  dataProxy(){
    
    let club = this.get('club');
    let cache = this.get('cache');
    
    if(this.get('preloadedFixtures')){
      return this.get('preloadedFixtures');
    }
    
    // Caching
    let key = 'leagueFixtures_' + club.get('id');
    if(cache.keyExists(key)){
      this.set('isLoadingData',false);
      return cache.get(key);
    }
    
    
    
    let hash = {};
    let fixtureFields = 'kick-off,home-club,guest-club,winner-id,home-points,guest-points,final-whistle,round,shortCompetition';
    let clubFields = 'name,logo,owner';
    
    // ------------------ Future
    
    let futureQuery = {
      'for-club': club.get('id'),
      future: 1,
      fields: {
        fixtures: fixtureFields,
        clubs: clubFields,
      },
      page: {
        size: 4,
      },
      include: 'home-club,guest-club',
      sort: 'id',
    };
    
    hash.future = this.get('store').query('fixture',futureQuery);
    
    // ------------------ Past
    
    let pastQuery = {
      'for-club': club.get('id'),
      past: 1,
      fields: {
        fixtures: fixtureFields,
        clubs: clubFields,
      },
      page: {
        size: 4,
      },
      include: 'home-club,guest-club',
      sort: '-id',
    };
    
    hash.past = this.get('store').query('fixture',pastQuery);
    
    
    
    
    
    Ember.Blackout.startLoading();
    
    
    let firstLoad = this.get('firstLoad');
    if (firstLoad) {
      // Let tab know we're going to load more stuff
      this.attrs.registerTabLoading();
      this.set('firstLoad',false);
    }
    
    return Ember.RSVP.hash(hash).then((data)=>{
      
      Ember.Blackout.stopLoading();
      cache.set(key,data);
      
      if(this.attrs.loadedFixtures){
        this.attrs.loadedFixtures(data);
      }
      
    }).finally(()=>{
      
      // Force refresh of dataProxy
      this.notifyPropertyChange('club');
      this.set('isLoadingData',false);
      
      if (firstLoad) {
        // Let tab know we're done
        this.attrs.finishTabLoading();
      }
      
    });
    
  },
  
  upcomingSorting: ['kickOff:asc'],
  upcomingFixtures: Ember.computed.sort('data.future','upcomingSorting'),
  
  pastSorting: ['kickOff:desc'],
  previousFixtures: Ember.computed.sort('data.past','pastSorting'),
  
});
