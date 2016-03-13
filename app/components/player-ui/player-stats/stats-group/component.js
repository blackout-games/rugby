import Ember from 'ember';

export default Ember.Component.extend({
  
  caps: Ember.computed( 'stats.@each', function(){
    return [
      parseInt(this.get('stats.leaguecaps')),
      parseInt(this.get('stats.cupcaps')),
      parseInt(this.get('stats.friendlycaps')),
      parseInt(this.get('stats.undertwentycaps')),
      parseInt(this.get('stats.nationalcaps')),
      parseInt(this.get('stats.othercaps')),
      parseInt(this.get('stats.worldcupcaps')),
      parseInt(this.get('stats.undertwentyworldcupcaps')),
    ];
  }),
  
  matchesPlayed: Ember.computed.sum('caps'),
  
});
