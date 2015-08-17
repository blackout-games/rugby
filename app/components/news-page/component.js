import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Component.extend(NewsMixin,{
  store: Ember.inject.service(),
  scrollerSelector: null,
  articleRoute: 'news.article',
  
  setTitle: function(){
    if( this.get('storeType') == 'news' ){
      this.set('title','News');
    } else {
      this.set('title','National News');
    }
  }.on('didInitAttrs'),
  
  meta: Ember.computed( 'model', function(){
    return this.get('model.meta');
  }),
  
  setScrollSelector: function(){
    if(typeof window.features.lockBodyScroller !== 'undefined' ){
      this.set('scrollerSelector',window.features.lockBodyScroller);
    }
    this.set('query',{
      sort: '-date',
      page: {
        size: 10,
      },
    });
    this.set('articleRoute',this.get('storeType') + '.article' )
  }.on('didReceiveAttrs'),
  
  setup: function(){
    this.set('page',this.get('meta.page'));
    this.set('pages',this.get('meta.num-pages'));
  }.on('didInsertElement'),
  
  hasMore: Ember.computed('page','pages',function(){
    
    var page = this.get('page');
    var pages = this.get('pages');
    //print('hasMore',page+' of '+pages,page < pages);
    return page < pages;
    
  }),
  
  fetchMoreItems: function(){
    
    var self = this;
    var page = this.get('page');
    var query = this.get('query');
    var isNational = self.get('storeType')=="national-news";
    query.page.number = page+1;
    
    if(isNational){
      
      var follows = this.session.get('managerMeta.news-follows');
      
      if(follows){
        query['filter'] = {
          'country.id': follows
        };
        query['include'] = 'author,country';
      }
      
    }
    
    return this.get('store').query(self.get('storeType'),query).then(function(data){
      self.set('page',data.get('meta.page'));
      self.set('pages',data.get('meta.num-pages'));
      self.processNews(data,null,isNational);
      return data;
    },function(error){
      print('Failed',error);
    });
    
  },
  
  actions: {
    fetchMore: function(callback) {
      var promise = this.fetchMoreItems();
      callback(promise);
    }
  },
  
});
