import Ember from 'ember';

export default Ember.Component.extend({
  
  showNumbers: true,
  
  // ---------------------------- Convert standings to clubs
  
  rankings: Ember.computed('standings',function(){
    
    let rankings = [];
    
    this.get('standings').forEach( standing => {
      rankings.pushObject( standing.get('club') );
    });
    
    return rankings;
    
  }),
  
  // ---------------------------- Add previous rankings
  
  prevRankingsSort: ['previousRatingPoints:desc'],
  rankingsSortedByPrevious: Ember.computed.sort('rankings','prevRankingsSort'),
  
  extendedRankings: Ember.computed('rankingsSortedByPrevious',function(){
    
    this.get('rankingsSortedByPrevious').forEach( (club,i) => {
      club.set('prevRanking',i+1);
    });
    
    return this.get('rankingsSortedByPrevious');
    
  }),
  
  // ---------------------------- Add previous rankings
  
  rankingsSort: ['ratingPoints:desc'],
  rankingsSorted: Ember.computed.sort('extendedRankings','rankingsSort'),
  
  finalRankings: Ember.computed('rankingsSorted',function(){
    
    this.get('rankingsSorted').forEach( (club,i) => {
      
      let prevRanking = club.get('prevRanking');
      let currentRanking = i+1;
      let change = prevRanking - currentRanking;
      club.set('rankingChange',change);
      club.set('rankingChangeAbs',Math.abs(change));
      
    });
    
    return this.get('rankingsSorted');
    
  }),
  
  // ---------------------------- //
  
  changesExist: Ember.computed('finalRankings',function(){
    let changesExist = false;
    this.get('finalRankings').forEach(club=>{
      if(club.get('rankingChange')!==0){
        changesExist = true;
      }
    });
    return changesExist;
  }),
  
});
