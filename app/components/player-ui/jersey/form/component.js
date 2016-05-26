import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";

export default Ember.Component.extend({
  
  jerseyOptions: [],
  
  onInit: Ember.on('init',function(){
    this.buildForm();
  }),
  
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    if(this.attrChanged(attrs,'player')){
      this.updateJerseyOptions();
    }
  }),
  
  actions: {
    updateJersey(jersey){
      
      let player = this.get('player');
      let squad = this.get('squad');
      let otherPlayer;
      
      if(jersey.value!==255){
        // Check other players who may have had this jersey
        otherPlayer = squad.findBy('jersey',jersey.value);
      }
      
      player.set('jersey',jersey.value);
      Ember.Blackout.startLoading();
      player.patch({ jersey: true }).then((data)=>{
        
        if(otherPlayer){
          otherPlayer.set('jersey',255);
          //otherPlayer.reload();
        }
        
        this.updateJerseyOptions();
        
        // Close the action box
        if(this.attrs.onUpdate){
          this.attrs.onUpdate();
        }
        
        return data;
      },()=>{
        player.rollbackAttributes();
      }).finally(()=>{
        Ember.Blackout.stopLoading();
      });
    },
  },
  
  updateJerseyOptions(){
    
    let jerseys = [{
      label: t('misc.none'),
      value: 255,
    }];
    
    let takenJerseys = {};
    this.get('squad').forEach(player => {
      if(player.get('jersey')!==255){
        takenJerseys['j'+player.get('jersey')] = player.get('name');
      }
    });
    
    
    for(let i=1; i<=99; i++){
      let playerLabel = '';
      if(takenJerseys['j'+i]){
        playerLabel = ' ' + takenJerseys['j'+i];
      }
      jerseys.pushObject({
        label: i + playerLabel,
        value: i,
      });
    }
    
    this.set('jerseyOptions',jerseys);
    
    let form = this.get('form');
    if(form && form.get('length')){
      form.set('firstObject.options',jerseys);
      form.set('firstObject.value',this.get('currentJersey'));
    }
    
  },
  
  buildForm(){
    
    // Must rebuild on every init, otherwise we keep adding to the form, rather than recreating it.
    let form = Ember.A();
    
    form.pushObject({
      id: 'jersey',
      type: 'select',
      label: t('player.jersey'),
      options: this.get('jerseyOptions'),
      value: this.get('currentJersey'),
      onChanged: Ember.run.bind(this,this.actions.updateJersey),
      gap: 'none',
    });
    
    this.set('form',form);
    
  },
  
  currentJersey: Ember.computed('player.jersey',function(){
    let jerseys = this.get('jerseyOptions');
    if(this.get('player.jersey')===255){
      return jerseys.objectAt(0);
    } else {
      return jerseys.objectAt(this.get('player.jersey'));
    }
  }),
  
});
