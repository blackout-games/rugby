import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Route.extend(NewsMixin,{
  prefs: Ember.inject.service('preferences'),
    
  query: {
    me: true,
    sort: '-date',
    page: {
      size: 10,
      number: 1
    },
  },
  
  model() {
    
    var query = this.get('query');
    
    return this.store.query('national-news',query).then((data)=>{
      this.processNews(data,null,true);
      return data;
    });
    
  },
  
  afterModel() {
    
    var prefs = this.get('prefs');
    
    // Update last viewed
    prefs.setPref('lastViewedNationalNews',moment().format());
    
  },
});
