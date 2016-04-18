import DS from 'ember-data';

export default DS.Model.extend({
  bid: DS.attr(),
  date: DS.attr(),
  autoBid: DS.attr(),
  transfer: DS.belongsTo('transfer'),
  club: DS.belongsTo('club',{ async: false}),
  manager: DS.belongsTo('manager'),
});