import DS from 'ember-data';
import config from '../config/environment';
import Ember from 'ember';

export default DS.JSONAPIAdapter.extend({
  host: config.APP.apiProtocol + '://' + config.APP.apiHost + config.APP.apiBase,
  
  /**
   * Allow ember data to send requests for multiple items at once
   * Use the default URL method ids[]= etc. as PHP automatically decodes this.
   */
  coalesceFindRequests: true,
  
  /**
   * 2015-06-18
   * Had to add this to remove deprecation notice: 
   * The default behavior of shouldBackgroundReloadAll will change in Ember Data 2.0 to always return false when there is at least one "statistics" record in the store. If you would like to preserve the current behavior please override shouldReloadAll in your adapter:application and return true.
   */
  
  shouldReloadAll: function(){
  	return true;
  },
  shouldBackgroundReloadAll: function(){
    return true;
  },
  
});

var inflector = Ember.Inflector.inflector;
//inflector.uncountable('statistics');

// Irregular plurals
inflector.irregular('country', 'countries');