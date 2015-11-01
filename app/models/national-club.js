import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  stadium: DS.attr('string'),
  country: DS.belongsTo('country',{ async: false }),
});