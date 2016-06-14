import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import Ember from 'ember';

export default Model.extend({
  standing: attr('number'),
  played: attr('number'),
  season: attr('number'),
  wins: attr('number'),
  losses: attr('number'),
  draws: attr('number'),
  bt: attr('number'),
  bl: attr('number'),
  pointsFor: attr('number'),
  pointsAgainst: attr('number'),
  divisionNumber: attr('number'),
  leagueNumber: attr('number'),
  penalty: attr('number'),
  totalPoints: attr('number'),
  standingChange: attr('number'),
  pointsMargin: Ember.computed('pointsFor','pointsAgainst', function() {
    return this.get('pointsFor') - this.get('pointsAgainst');
  }),
  standingChangeAbs: Ember.computed('standingChange', function() {
    return Math.abs(this.get('standingChange'));
  }),
  club: belongsTo('club',{ async: false}),
  country: belongsTo('country'),
  league: belongsTo('league',{ async: false}),
});