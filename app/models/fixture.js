import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  competition: attr(),
  shortCompetition: attr(),
  season: attr('number'),
  round: attr('number'),
  kickOff: attr('date'),
  finalWhistle: attr('date'),
  winnerId: attr(),
  homePoints: attr(),
  guestPoints: attr(),
  homeClub: belongsTo('club',{ async: false}),
  guestClub: belongsTo('club',{ async: false}),
  country: belongsTo('country',{ async: false}),
  league: belongsTo('league'),
  winner: Ember.computed('winnerId',function(){
    if(Number(this.get('homeClub.id')) === this.get('winnerId')){
      return this.get('homeClub');
    } else if(Number(this.get('guestClub.id')) === this.get('winnerId')){
      return this.get('guestClub');
    } else {
      return null; // Draw or match not finished
    }
  }),
  isDraw: Ember.computed('winnerId',function(){
    if(this.get('isFinished')){
      return this.get('homePoints') === this.get('guestPoints');
    } else {
      return false;
    }
  }),
  isFinished: Ember.computed('finalWhistle',function(){
    if(this.get('finalWhistle')){
      let finalWhistle = new Date(this.get('finalWhistle'));
      return Date.now() > finalWhistle.getTime();
    }
    return false;
  }),
});