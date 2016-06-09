import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['row','row-nowrap'],
  
  homeWinner: Ember.computed('fixture',function(){
    return this.get('fixture.isDraw') || this.get('fixture.winnerId') === Number(this.get('fixture.homeClub.id'));
  }),
  
  guestWinner: Ember.computed('fixture',function(){
    return this.get('fixture.isDraw') || this.get('fixture.winnerId') === Number(this.get('fixture.guestClub.id'));
  }),
  
});
