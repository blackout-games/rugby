import Ember from 'ember';

export default Ember.Component.extend({
  
  showNumbers: true,
  
  rankings: Ember.computed('standings',function(){
    
    let rankings = [];
    
    this.get('standings').forEach( standing => {
      
      rankings.pushObject( standing.get('club') );
      
    });
    
    return rankings;
    
  }),
  
  rankingsSort: ['ratingPoints:desc'],
  rankingsSorted: Ember.computed.sort('rankings','rankingsSort'),
  
});
