import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  eventBus: Ember.inject.service(),
  
  refreshSessionManager(){
    
    let managerId = this.get('session.data.managerId');
    log('managerId',managerId);
    let manager = this.get('store').findRecord('manager',managerId,{reload: true});
    
    return manager.then((data)=>{
      
      this.rebuildSession(data);
      return data;
      
    });
    
  },
  
  rebuildSession(manager){
    
    let session = this.get('session');
    
    if(!manager.get){
      manager = Ember.Object.create(manager);
    }
    
    let managerId = manager.get('id');
    
    // Set manager in session
    session.set('data.managerId', manager.get('id'));
    manager = JSON.parse(JSON.stringify(manager));
    manager.id = managerId;
    
    session.set('data.manager', manager);
    
    // Signify that the session has been rebuilt
    session.set('sessionRebuilt', true);
    
    // Specify data. here so that it lasts beyond a reload
    session.set('data.sessionManagerLatest',manager);
    
    // Let the world know user has logged in and session is complete, again
    this.get('eventBus').publish('sessionBuilt');
    
  },
  
});
