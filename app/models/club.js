import Model from 'ember-data/model';
import { belongsTo } from 'ember-data/relationships';
import attr from 'ember-data/attr';

export default Model.extend({
  name: attr('string'),
  stadium: attr('string'),
  logo: attr('string'),
  kit: attr('string'),
  bankBalance: attr('number'),
  contentment: attr('number'),
  isPremium: attr(),
  ratingPoints: attr('number'),
  previousRatingPoints: attr('number'),
  countryRanking: attr('number'),
  worldRanking: attr('number'),
  averageTop15Csr: attr('number'),
  stadiumCapacity: attr('number'),
  //owner: belongsTo('manager',{ async: true }),
  owner: belongsTo('manager',{ async: true, inverse: null }),
  country: belongsTo('country',{ async: true }),
  region: belongsTo('region'),
  league: belongsTo('league'),
});