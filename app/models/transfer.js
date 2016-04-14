import DS from 'ember-data';

export default DS.Model.extend({
  price: DS.attr(),
  deadline: DS.attr(),
  views: DS.attr(),
  watchers: DS.attr(),
  listPrice: DS.attr(),
  listed: DS.attr(),
  fireIfUnsold: DS.attr(),
  player: DS.belongsTo('player',{ async: false}),
  club: DS.belongsTo('club',{ async: false}),
  biddingClub: DS.belongsTo('club',{ async: false}),
});