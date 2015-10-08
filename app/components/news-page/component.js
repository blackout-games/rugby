import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Component.extend(NewsMixin, {
  store: Ember.inject.service(),
  scrollerSelector: null,
  articleRoute: 'news.article',

  setTitle: Ember.on('didInitAttrs', function() {
    if (this.get('storeType') === 'news') {
      this.set('title', 'News');
    } else {
      this.set('title', 'National News');
    }
  }),

  meta: Ember.computed('model', function() {
    return this.get('model.meta');
  }),

  setScrollSelector: Ember.on('didReceiveAttrs', function() {
    if (typeof window.features.lockBodyScroller !== 'undefined') {
      this.set('scrollerSelector', window.features.lockBodyScroller);
    }
    this.set('query', {
      sort: '-date',
      page: {
        size: 10,
      },
    });
    this.set('articleRoute', this.get('storeType') + '.article');
  }),

  setup: Ember.on('didReceiveAttrs', function() {
    this.set('page', this.get('meta.page'));
    this.set('pages', this.get('meta.num-pages'));
  }),

  hasMore: Ember.computed('page', 'pages', function() {

    var page = this.get('page');
    var pages = this.get('pages');
    //print('hasMore',page+' of '+pages,page < pages);
    return page < pages;

  }),

  fetchMoreItems() {

    var self = this;
    var page = this.get('page');
    var query = this.get('query');
    var isNational = self.get('storeType') === "national-news";
    query.page.number = page + 1;

    if (isNational) {
      
      query.me = true;
      query['include'] = 'author,country';

    }

    return this.get('store').query(self.get('storeType'), query).then(function(data) {
      self.set('page', data.get('meta.page'));
      self.set('pages', data.get('meta.num-pages'));
      self.processNews(data, null, isNational);
      return data;
    }, function(error) {
      print('Failed', error);
    });

  },

  actions: {
    fetchMore(callback) {
      var promise = this.fetchMoreItems();
      callback(promise);
    }
  },

});
