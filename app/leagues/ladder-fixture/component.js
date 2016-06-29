import Ember from 'ember';

export default Ember.Component.extend({
  
  tagName: 'a',
  classNames: ['btn-a','secondary','go-primary'],
  attributeBindings: ['href'],
  
  href: Ember.computed('dependent',function(){
    if(this.get('fixture.id')){
      return 'https://www.blackoutrugby.com/game/tools.live.scoring.php#fixture=' + this.get('fixture.id');
    } else {
      return null;
    }
  }),
  
  onInsert: Ember.on('didInsertElement',function(){
    this.$().on('click',(e)=>{
      e.preventDefault();
      
      if(this.get('fixture.id')){
        window.location = this.get('href');
      } else {
        return false;
      }
    });
    
    this.updateDOM();
  }),
  
  onReceive: Ember.on('didReceiveAttrs',function(){
    if(this.$()&&this.$().length){
      this.updateDOM();
    }
  }),
  
  updateDOM(){
    if(!this.get('fixture.id')){
      this.$().css('cursor','default');
    } else {
      this.$().css('cursor','');
    }
  },
  
});
