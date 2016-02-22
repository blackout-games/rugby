import DS from 'ember-data';
import config from '../config/environment';
import Ember from 'ember';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

const { getOwner } = Ember;

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:application',
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
  
  /*shouldReloadAll() {
  	return true;
  },
  shouldBackgroundReloadRecord() {
    return true;
  },
  shouldBackgroundReloadAll() {
    return true;
  },*/
  
  /*
  buildURL: function(){
    var url = this._super.apply(this, arguments);
    //print(url);
    return url;
  },
  */
  
  /**
   * Override query so we can support /me
   * Add me: true to the query object
   */
  query(store, type, query) {
    var url = this.buildURL(type.modelName, null, null, 'query', query);
    
    if( query.me === true ){
      
      var session = getOwner(this).lookup('service:session');
      
      if(session.get('isAuthenticated')){
        url += '/me';
      }
      delete query.me;
      
    }

    if (this.sortQueryParams) {
      query = this.sortQueryParams(query);
    }

    return this.ajax(url, 'GET', { data: query });
  },
  
});

var inflector = Ember.Inflector.inflector;
//inflector.uncountable('statistics');

// Irregular plurals
inflector.irregular('country', 'countries');
inflector.irregular('category', 'categories');