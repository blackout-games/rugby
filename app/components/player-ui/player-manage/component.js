import Ember from 'ember';

export default Ember.Component.extend({
  
  detectPlayerChange: Ember.on('didUpdateAttrs',function(opts){
    
    if(this.attrChanged(opts,'player')){
      let was = this.get('isOnScreen');
      this.set('isOnScreen',false);
      Ember.run.next(()=>{
        this.set('isOnScreen',was);
      });
    }
    
  }),
  
  actions: {
    firePlayer(button){
      
      this.set('actionsError',null);
      
      let player = this.get('player');
      //let clubId = this.get('player.club.id');
      
      player.deleteRecord();
      player.save().then(()=>{
        
        // Stop button loading
        button.succeeded();
        
        // Go to squad route
        Ember.Blackout.transitionTo('squad.club','me');
        
        // TODO
        //Ember.Blackout.transitionTo('squad.club',clubId);
        
      },(err)=>{
        if(err && err.errors && err.errors.title){
          this.set('actionsError',err.errors.title);
        }
        button.reset();
      });
      
    }
  }
  
});
