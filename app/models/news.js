import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  date: DS.attr('date'),
  title: DS.attr('string'),
  body: DS.attr('string'),
  lastViewed: DS.attr('date'),
  author: DS.belongsTo('manager',{ async: false }), 
  isNewToUser: Ember.computed('lastViewed', function() {
    return this.get('lastViewed') && this.get('lastViewed') < this.get('date');
  }),
});
