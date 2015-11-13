import Ember from 'ember';

export default Ember.Route.extend({
  
  sortProps: ['activeTeams'],
  
  removeBackground: Ember.on('activate', function(){
    this.get('EventBus').publish('removeBackground');
  }),
  
  model() {
    return Ember.RSVP.hash({
      
      countries: this.store.findAll('country'),
      
      stats: this.store.findAll('statistic').then(function(all) {
        var Stats = Ember.Object.create();
        all.forEach(function(item) {
          Stats.set(item.get('id'), item.get('value'));
        });
        return Stats;
      })
      
    }).then(function(data){
      
      // Add country stats to countries model
      data.countries.forEach(function(country){
        
        // notifyPropertyChange bug happens here
        country.set('activeTeams',parseInt(data.stats.get('countrySize' + country.id)));
        
      });
      
      
      
      
      /**
       * Ember.computed.sort looks for the two provided string arguments within it's parent.
       * In this case, the data variable in this very scope
       */
      
      data.countrySortProps = ['activeTeams:desc'];
      
      data.countriesSorted = Ember.computed.sort('countries','countrySortProps');
      
      
      
      return data;
      
    });
  },
 
});
