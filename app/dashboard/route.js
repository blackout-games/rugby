import Ember from 'ember';
import NewsMixin from '../mixins/news';

export default Ember.Route.extend(NewsMixin,{
  prefs: Ember.inject.service('preferences'),
  
  rememberRouteScroll: Ember.on('init', function(){
    this._super();
    this.rememberScroll();
  }),
  
  model() {
    
    var newsQuery = {
      sort: '-date',
      page: {
        size: 3,
        number: 1
      },
    };
    
    var nationalNewsQuery = {
      me: true,
      page: {
        size: 3,
        number: 1
      },
      sort: '-date',
      include: 'author,country',
    };
    
    return Ember.RSVP.hash({
      
      news: this.store.query('news',newsQuery),
      
      nationalNews: this.store.query('national-news',nationalNewsQuery),
      
    });
  },
  
  afterModel(data) {
    
    var prefs = this.get('prefs');
    var lastViewedNews = prefs.pref('lastViewedNews',{ type:'date' });
    var lastViewedNationalNews = prefs.pref('lastViewedNationalNews',{ type:'date' });
    
    this.processNews(data.news,lastViewedNews);
    this.processNews(data.nationalNews,lastViewedNationalNews,true);
    
    // Update last viewed
    prefs.setPref('lastViewedNews',moment().format());
    prefs.setPref('lastViewedNationalNews',moment().format());
    
  },
});
