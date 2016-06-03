import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

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
  totalPoints: attr(),
  club: belongsTo('club',{ async: false}),
  country: belongsTo('country'),
  league: belongsTo('league',{ async: false}),
});