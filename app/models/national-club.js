import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  stadium: DS.attr('string'),
  logo: DS.attr(),
  country: DS.belongsTo('country',{ async: false }),
});