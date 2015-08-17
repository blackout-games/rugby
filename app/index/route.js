import Ember from 'ember';

export default Ember.Route.extend({
  
  model: function() {
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
        
        country.set('activeTeams',parseInt(data.stats.get('countrySize' + country.id)));
        
      });
      
      // Finally sort countries biggest first
      var sortedCountries = Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
        content: data.countries,
        sortProperties: ['activeTeams'],
        sortAscending: false
      });
      
      data.countries = sortedCountries;
      
      return data;
      
    });
  },
 
});
