import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  
  getDefaults: function(){
    
    var App = this.container.lookup('application:main');
    
    var session = this.container.lookup('session:blackout');
    this.set('session',session);
    
    if(!session.get('isRestoring')){
      this.get('store').findAll('preference').then(function(data){
        App.advanceReadiness();
      });
    } else {
      App.advanceReadiness();
    }
    
    
  }.on('init'),
  
  getPref: function( id,options ){
    var pref = this.getPrefRecord(id);
    if(pref){
      var val = pref.get('value');
      if(options && options.type === 'date'){
        if(val){
          val = new Date(val);
        }
      }
      return val;
    } else {
      Ember.Logger.warn('Invalid preference (' + id + ')');
    }
  },
  
  getPrefRecord: function( id ){
    var pref =  this.get('store').peekRecord('preference',id);
    if(pref){
      return pref;
    } else {
      Ember.Logger.warn('Invalid preference (' + id + ')');
    }
  },
  
  setPref: function( id, value ){
    if( this.get('session').isAuthenticated){
      var pref = this.getPrefRecord(id);
      if(pref){
        pref.set('value',value);
        pref.save();
      }
    }
  },
  
  pref: function( id, options ){
    return this.getPref(id,options);
  },
  
});
