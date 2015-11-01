import DS from 'ember-data';

export default DS.Model.extend({
  competition: DS.attr('string'),
  season: DS.attr('number'),
  round: DS.attr('number'),
  kickoff: DS.attr('date'),
  type: DS.attr('number'),
  country: DS.belongsTo('country',{ async: false }),
  homeClub: DS.belongsTo('national-club',{ async: false }),
  guestClub: DS.belongsTo('national-club',{ async: false }),
});
