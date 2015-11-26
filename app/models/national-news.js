import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  date: DS.attr(),
  title: DS.attr(),
  body: DS.attr(),
  country: DS.belongsTo('country',{ async: false }), // async tells ember data what to expect. It doesn't tell ember data how to make requests. true: ember will not expect data to be included, and will send a separate aync request. false: ember will expect data to be included in primary response.
  author: DS.belongsTo('manager',{ async: false }), 
  lastViewed: DS.attr(),
  isNewToUser: Ember.computed('lastViewed', function() {
    return this.get('lastViewed') && this.get('lastViewed') < this.get('date');
  }),
});