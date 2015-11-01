import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  stadium: DS.attr('string'),
  logo: DS.attr('string'),
  bankBalance: DS.attr('number'),
  contentment: DS.attr('number'),
  owner: DS.belongsTo('manager',{ async: true }),
  country: DS.belongsTo('country',{ async: true }),
  region: DS.belongsTo('region'),
});