import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr(),
  lastName: DS.attr(),
  name: DS.attr(),
  club: DS.belongsTo('club'),
});