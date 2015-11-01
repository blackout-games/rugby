import DS from 'ember-data';

export default DS.Model.extend({
  competition: DS.attr('string'),
  season: DS.attr('number'),
  round: DS.attr('number'),
  kickoff: DS.attr('date'),
  country: DS.belongsTo('country',{ async: false }),
  homeClub: DS.belongsTo('club',{ async: false }),
  guestClub: DS.belongsTo('club',{ async: false }),
});
