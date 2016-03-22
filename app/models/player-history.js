import DS from 'ember-data';

export default DS.Model.extend({
  date: DS.attr(),
  event: DS.attr(),
  playerId: DS.attr(),
});