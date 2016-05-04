import Ember from 'ember';

export default Ember.Route.extend({
  
  sortProps: ['activeTeams'],
  
  model() {
    return Ember.RSVP.hash({
      
      /**
       * We must reload countries here, otherwise if a country has already loaded via the info service, only that country will be returned.
       */
      countries: this.get('store').findAll('country', { reload: true }),
      
      stats: this.get('store').findAll('statistic').then(function(all) {
        var Stats = Ember.Object.create();
        all.forEach(function(item) {
          Stats.set(item.get('id'), item.get('value'));
        });
        return Stats;
      })
      
    }).then(function(data){
      
      // Add country stats to countries model
      data.countries.forEach(country => {
        
        // notifyPropertyChange bug happens here
        country.set('activeTeams',parseInt(data.stats.get('countrySize' + country.id)));
        
      });
      
      // To use sorts properly, notifyPropertyChange must exist, which means this must be an ember object.
      if(!data.notifyPropertyChange){
        data = Ember.Object.extend(data).create();
      }
      
      /**
       * Ember.computed.sort looks for the two provided string arguments within it's parent.
       * In this case, the data variable in this very scope
       */
      
      data.set('countrySortProps',['activeTeams:desc']);
      
      data.set('countriesSorted',Ember.computed.sort('countries','countrySortProps'));
      
      return data;
      
    });
  },
 
});
