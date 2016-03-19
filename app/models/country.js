import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  timeDiff: DS.attr('number'),
  timeZone: DS.attr('string'),
  localTime: DS.attr(),
  activeTeams: DS.attr('number'),
  currentWeather: DS.belongsTo('weather',{ async: false })
});