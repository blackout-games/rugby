import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Route.extend(NewsMixin,{
  
  model( params ){
    
    var self = this;
    
    return this.store.findRecord('national-news',params.id).then(function(data){
      self.processArticle(data);
      return data;
    });
    
  },
});
