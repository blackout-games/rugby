import DS from 'ember-data';
import Ember from 'ember';

/**
 * True patch support for DS.JSONAPIAdapter
 * Good as of Ember Data 2.4.0
 */

/**
 * To always patch
 * ---------------
 * import DS from 'ember-data';
 * 
 * export default DS.Model.extend({
 *   colour: DS.attr('string'),
 *   wheels: DS.attr('number'),
 *   username: DS.attr({ alwaysPatch: true }),
 *   owner: DS.belongsTo('person', { async: true, alwaysPatch: true })
 * });
 * 
 */

export function initialize(/* application */) {
  // application.inject('route', 'foo', 'service:foo');

  DS.Model.reopen({
    
    _isPatch: false,
    
    /**
     * Provide an object of fields to force these
     * fields to be sent every time.
     * 
     * If left empty, changed fields will be sent,
     * or if there are no changed fields, not request will be sent.
     */
    patch: function( fields ) {
      this._isPatch = true;
      this._patchFields = fields;
      return this.save.apply(this, arguments);
    }
    
  });
  

  DS.JSONAPIAdapter.reopen({
    
    updateRecord: function (store, type, snapshot) {
      
      var data = {};
      var serializer = store.serializerFor(type.modelName);
      var isPatch = snapshot.record._isPatch;

      serializer.serializeIntoHash(data, type, snapshot, { includeId: true });
      
      var id = snapshot.id;
      var url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');
      
      if(isPatch){
        
        let changed;
        
        // Get force attrs
        if(snapshot.record._patchFields){
          
          changed = Ember.Blackout.dashKeys(snapshot.record._patchFields);
          
        } else {
          
          // Get changed attrs
          changed = snapshot.record.changedAttributes();
          
        }
        
        if(Ember.Blackout.isEmpty(changed)){
          
          // If there's nothing changed, don't waste a request
          return Ember.Blackout.assertPromise();
          
        }
        
        // ----------------------------- Attributes
        
        
        // Get attrs
        let attrs = data.data.attributes;
        
        if(attrs){
          
          // Get attrs that should always be included
          let alwaysPatchAttrs = [];
          snapshot.record.eachAttribute((name, attr)=>{
            if(attr.options.alwaysPatch){
              alwaysPatchAttrs.push(name);
            }
          });
          
          // Remove all keys except those that have changed
          Ember.$.each(attrs,(key)=>{
            if( !(key in changed) && alwaysPatchAttrs.indexOf(key)<0 ){
              delete attrs[key];
            }
          });
          
        }
        
        
        // ----------------------------- Relationships
        
        
        // Get relationships
        let relationships = data.data.relationships;
        
        if(relationships){
          
          // Get relationships that should always be included
          let alwaysPatchRelationships = [];
          snapshot.record.eachRelationship((name, relationship)=>{
            if(relationship.options.alwaysPatch){
              alwaysPatchRelationships.push(name);
            }
          });
          
          // Remove all keys except those that have changed
          Ember.$.each(relationships,(key)=>{
            if( !(key in changed) && alwaysPatchRelationships.indexOf(key)<0 ){
              delete relationships[key];
            }
          });
          
        }
        
        snapshot.record._isPatch = false;
        
      }
      
      return this.ajax(url, 'PATCH', { data: data });
      
    }
    
  });
  
}

export default {
  name: 'patch',
  initialize
};
