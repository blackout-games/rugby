import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  stadium: DS.attr('string'),
  logo: DS.attr('string'),
  kit: DS.attr('string'),
  bankBalance: DS.attr('number'),
  contentment: DS.attr('number'),
  isPremium: DS.attr(),
  ratingPoints: DS.attr('number'),
  previousRatingPoints: DS.attr('number'),
  countryRanking: DS.attr('number'),
  worldRanking: DS.attr('number'),
  averageTop15Csr: DS.attr('number'),
  stadiumCapacity: DS.attr('number'),
  owner: DS.belongsTo('manager',{ async: true }),
  country: DS.belongsTo('country',{ async: true }),
  region: DS.belongsTo('region'),
  league: DS.belongsTo('league'),
});