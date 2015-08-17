import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Route.extend(NewsMixin,{
  prefs: Ember.inject.service('preferences'),
    
  query: {
    sort: '-date',
    page: {
      size: 10,
      number: 1
    },
    include: 'author,country',
  },
  
  model: function(){
    
    var self = this;
    var follows = this.session.get('managerMeta.news-follows');
    var query = this.get('query');
    
    if(follows){
      query['filter'] = {
        'country.id': follows
      };
    }
    
    return this.store.query('national-news',query).then(function(data){
      self.processNews(data,null,true);
      return data;
    });
    
  },
  
  afterModel: function(data){
    
    var prefs = this.get('prefs');
    
    // Update last viewed
    prefs.setPref('lastViewedNationalNews',moment().format());
    
  },
});
