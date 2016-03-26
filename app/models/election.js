import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr(),
  start: DS.attr(),
  end: DS.attr(),
  country: DS.belongsTo('country',{ async: false}),
});