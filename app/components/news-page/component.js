import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Component.extend(NewsMixin, {
  store: Ember.inject.service(),
  
  classNames: ['page-container-md','page-container-left'],
  articleRoute: 'news.article',
  
  title: Ember.computed('storeType','i18n.locale',function(){
    if (this.get('storeType') === 'news') {
      return this.get('i18n').t('dashboard.news.game-news');
    } else {
      return this.get('i18n').t('dashboard.news.national-news');
    }
  }),

  meta: Ember.computed('model', function() {
    return this.get('model.meta');
  }),

  setScrollSelector: Ember.on('didReceiveAttrs', function() {
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
  
  /**
   * We should use ember array
   * @type {[type]}
   */
  items: [],
  
  newItems: Ember.on('didReceiveAttrs',function(opts){
    if(this.attrChanged(opts,'model')){
      let items = [];
      items.pushObjects(this.get('model').toArray());
      this.set('items',items);
    }
  }),
  
  isLoadingData: true,

  fetchMoreItems() {

    var page = this.get('page');
    var query = this.get('query');
    var isNational = this.get('storeType') === "national-news";
    query.page.number = Number(page) + 1;

    if (isNational) {
      
      query.me = true;
      query['include'] = 'author,country';

    }
    
    this.set('isLoadingData',true);
    this.get('store').query(this.get('storeType'), query).then((data)=>{
      
      this.set('page', data.get('meta.page'));
      this.set('pages', data.get('meta.num-pages'));
      
      this.processNews(data, null, isNational);
      this.get('items').pushObjects(data.toArray());
      
      this.set('isLoadingData',false);
      
      return data;
    }, function(error) {
      print('Failed', error);
    });

  },

  actions: {
    fetchMore(/*opts*/){
      this.fetchMoreItems();
    },
  },

});
