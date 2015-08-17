import DS from 'ember-data';

export default DS.Model.extend({
  date: DS.attr('date'),
  title: DS.attr('string'),
  body: DS.attr('string'),
  country: DS.belongsTo('country',{ async: true }),
  author: DS.belongsTo('manager',{ async: true }),
  lastViewed: DS.attr('date'),
  isNewToUser: Ember.computed('lastViewed', function() {
    return this.get('lastViewed') && this.get('lastViewed') < this.get('date');
  }),
});
