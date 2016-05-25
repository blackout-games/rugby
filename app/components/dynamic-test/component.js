import Ember from 'ember';

export default Ember.Component.extend({

  layout: Ember.computed(function() {
    return Ember.HTMLBars.compile(
      '{{jeremyBell}} <span>' + 'hello' + '</span>'
    );
  }),
  
  jeremyBell: Ember.computed(function(){
    return 'Jeremy R Bell';
  }),
  onInsert: Ember.on('didInsertElement',function(){
    Ember.run.later(()=>{
      this.set('jeremyBell','Finn and Jake');
    },3000);
  }),
  
});
