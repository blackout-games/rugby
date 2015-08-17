import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  isNewSerializerAPI: true, // Otherwise we see a deprecation
  
  // Removed: JSON API expects primary key to be 'id' always.
  //primaryKey: 'id'
});
