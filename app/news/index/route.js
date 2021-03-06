import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Route.extend(NewsMixin,{
  prefs: Ember.inject.service('preferences'),
    
  query: {
    sort: '-date',
    page: {
      size: 10,
      number: 1
    }
  },
  
  model() {
    
    return this.store.query('news',this.query).then((data)=>{
      this.processNews(data);
      return data;
    });
    
  },
  
  afterModel() {
    
    var prefs = this.get('prefs');
    
    // Update last viewed
    prefs.setPref('lastViewedNews',moment().format());
    
  },
});
