import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Route.extend(NewsMixin,{
  
  query: {
    include: 'author,country',
  },
  
  model( params ){
    
    var self = this;
    
    return this.store.findRecord('national-news',params.id).then(function(data){
      self.processArticle(data);
      return data;
    });
    
  },
});
