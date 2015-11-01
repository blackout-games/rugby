import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  created: DS.attr('date'),
  updated: DS.attr('date'),
  lounge: DS.belongsTo('lounge',{ async: false }),
  creator: DS.belongsTo('manager',{ async: false }),
});
