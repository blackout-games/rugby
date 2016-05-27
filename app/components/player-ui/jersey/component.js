import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";

export default Ember.Component.extend({
  
  jerseyOptions: [],
  
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    if(this.attrChanged(attrs,'player')){
      this.updateJerseyOptions();
    }
  }),
  
  onHover(){
    Ember.$('.player-ui-jersey.player i.icon-jersey').addClass('hover');
  },
  onEndHover(){
    Ember.$('.player-ui-jersey.player i.icon-jersey').removeClass('hover');
  },
  
  onInsert: Ember.on('didInsertElement',function(){
    this.$('.player-ui-jersey-number').on('mouseenter touchstart',this.onHover);
    this.$('.player-ui-jersey-number').on('mouseleave touchend',this.onEndHover);
  }),
  
  onDestroy: Ember.on('willDestroyElement',function(){
    this.$('.player-ui-jersey-number').off('mouseenter touchstart',this.onHover);
    this.$('.player-ui-jersey-number').off('mouseleave touchend',this.onEndHover);
  }),
  
  actions: {
    onOpen(){
      Ember.$('.player-ui-jersey.player').addClass('active');
      this.onEndHover();
    },
    onClose(){
      Ember.$('.player-ui-jersey.player').removeClass('active');
      this.onEndHover();
    },
    getPlaceholder(item){
      if(item.value===255){
        return '<i class="icon-pencil"></i>';
      } else {
        return item.value;
      }
    },
    updateJersey(jersey){
      
      let player = this.get('player');
      let squad = this.get('squad');
      let otherPlayer;
      
      if(player.get('jersey')!==jersey.value){
          
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
          
          // De-focus select element
          this.$('select').blur();
          
          return data;
        },()=>{
          player.rollbackAttributes();
        }).finally(()=>{
          Ember.Blackout.stopLoading();
        });
      
      }
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
        label: '<span class="player-ui-jersey-option">' + i + '</span>' + playerLabel,
        value: i,
      });
    }
    
    this.set('jerseyOptions',jerseys);
    
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
