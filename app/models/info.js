import DS from 'ember-data';

export default DS.Model.extend({
  currentTime: DS.attr(),
  timeDiffs: DS.attr(),
  country: DS.belongsTo('country',{ async: false })
});
