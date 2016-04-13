import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  
  /**
   * This should be called during app initialisation
   */
  loadSettings() {
    
    // Load settings into store, return promise if we need to wait
    // Must catch, so that user-blocking works (anything loaded during initialization)
    return this.get('store').findAll('setting').then((data)=>{
      
      // Allow retrieving of settings via this.get('settings.[setting]');
      for(let i=0; i<data.get('length'); i++){
        let record = data.objectAt(i);
        this.set(record.get('id'),record.get('value'));
      }
      
      return data;
      
    }).catch((err)=>{
      Ember.Logger.warn('Failed to get settings');
      print(err);
    });
    
  },
  
  getSetting(id, options) {
    var item = this.getSettingRecord(id);
    if(item){
      var val = item.get('value');
      if(options && options.type === 'date'){
        if(val){
          val = new Date(val);
        }
      }
      return val;
    } else {
      Ember.Logger.warn('Invalid setting (' + id + ')');
    }
  },
  
  getSettingRecord(id) {
    var item =  this.get('store').peekRecord('setting',id);
    if(item){
      return item;
    } else {
      Ember.Logger.warn('Invalid setting (' + id + ')');
    }
  },
  
  setting(id, options) {
    return this.getSetting(id,options);
  },
  
});
