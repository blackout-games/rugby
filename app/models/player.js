import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  name: DS.attr('string'),
  club: DS.belongsTo('club',{ async: true }),
  manager: DS.belongsTo('manager',{ async: true }),
});
