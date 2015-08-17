import Ember from 'ember';
import Manager from '../manager/model';
import NewsMixin from '../mixins/news';

var $ = Ember.$;

export default Ember.Route.extend(NewsMixin,{
  prefs: Ember.inject.service('preferences'),
  
  rememberRouteScroll: function(){
    this._super();
    this.rememberScroll();
  }.on('init'),
  
  model: function(){
    
    var newsQuery = {
      sort: '-date',
      page: {
        size: 3,
        number: 1
      },
    };
    
    var nationalNewsQuery = {
      page: {
        size: 3,
        number: 1
      },
      sort: '-date',
      include: 'author,country',
    };
    
    var follows = this.session.get('managerMeta.news-follows');
    
    if(follows){
      nationalNewsQuery['filter'] = {
        'country.id': follows
      };
    }
    
    return Ember.RSVP.hash({
      
      news: this.store.query('news',newsQuery),
      
      nationalNews: this.store.query('national-news',nationalNewsQuery),
      
    });
  },
  
  afterModel: function(data){
    
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
