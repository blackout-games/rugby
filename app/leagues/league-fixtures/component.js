import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  rounds: Ember.computed('dataSorted',function(){
    
    let rounds = [];
    let data = this.get('dataSorted');
    
    if(data){
      data.forEach( fixture => {
        
        let round = fixture.get('round');
        let competition;
        
        if(round>14){
          
          competition = fixture.get('competition');
          if(competition==='SemiFinal'){
            round = 15;
          } else if(competition==='BronzeFinal'){
            round = 16;
          } else if(competition==='Final'){
            round = 17;
          } else if(competition==='Qualifier'){
            round = 18;
          }
          
        }
        
        if(!rounds.findBy('round',round)){
          rounds.pushObject({
            round: round,
            fixtures: [],
            competition: competition,
            competitionT: competition ? 'competitions.' + competition.dasherize() : null,
          });
        }
        let fixtures = rounds.findBy('round',round).fixtures;
        
        fixtures.pushObject(fixture);
        
      });
      
      return rounds;
    } else {
      return [];
    }
    
  }),
  
  // Show loader only on first load
  isLoadingData: true,
  firstLoad: true,
  
  data: Ember.computed( 'league', function(){
    let data = this.dataProxy();
    
    if(data && data.then){
      return this.get('previousData');
    } else if(!data){
      return Ember.Object.create();
    }
    this.set('previousData',data);
    return data;
  }),
  
  sorting: ['id:asc'],
  dataSorted: Ember.computed.sort('data','sorting'),
  
  dataProxy(){
    
    let league = this.get('league');
    let cache = this.get('cache');
    
    // Caching
    let key = 'leagueFixtures_' + league.get('id');
    if(cache.keyExists(key)){
      this.set('isLoadingData',false);
      return cache.get(key);
    }
    
    let query = {
      filter: {
        'league.id': league.get('id'),
      },
      fields: {
        fixtures: 'kick-off,home-club,guest-club,winner-id,home-points,guest-points,final-whistle,round,competition',
        clubs: 'name,owner',
      },
      include: 'home-club,guest-club',
    };
    
    Ember.Blackout.startLoading();
    
    
    let firstLoad = this.get('firstLoad');
    if (firstLoad) {
      // Let tab know we're going to load more stuff
      this.attrs.registerTabLoading();
      this.set('firstLoad',false);
    }
    
    
    return this.get('store').query('fixture',query).then((data)=>{
      
      Ember.Blackout.stopLoading();
      cache.set(key,data);
      
    }).finally(()=>{
      
      // Force refresh of dataProxy
      this.notifyPropertyChange('league');
      this.set('isLoadingData',false);
      
      if (firstLoad) {
        // Let tab know we're done
        this.attrs.finishTabLoading();
      }
      
    });
    
  },
});
