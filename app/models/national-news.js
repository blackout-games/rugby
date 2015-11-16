import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  date: DS.attr('date'),
  title: DS.attr('string'),
  body: DS.attr('string'),
  country: DS.belongsTo('country',{ async: true }),
  author: DS.belongsTo('manager',{ async: false }), // Get straight away so we can decorate users
  lastViewed: DS.attr('date'),
  isNewToUser: Ember.computed('lastViewed', function() {
    return this.get('lastViewed') && this.get('lastViewed') < this.get('date');
  }),
});
