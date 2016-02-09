import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  timeDiff: DS.attr('number'),
  timeZone: DS.attr('string'),
  activeTeams: DS.attr('number'),
});