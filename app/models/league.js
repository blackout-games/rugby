import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  shortName: DS.attr('string'),
  season: DS.attr('number'),
  division: DS.attr('number'),
  league: DS.attr('number'),
  navLeft: DS.attr('number'),
  navRight: DS.attr('number'),
  navAbove: DS.attr('number'),
  navBelow: DS.attr('number'),
  prizePool: DS.attr('number'),
  finalsCreated: DS.attr('boolean'),
  country: DS.belongsTo('country',{ async: false }),
  lounge: DS.belongsTo('lounge',{ async: false }),
});
