import Ember from 'ember';
import NewsMixin from '../../mixins/news';

export default Ember.Route.extend(NewsMixin,{
  
  model( params ){
    
    return this.store.findRecord('national-news',params.id).then((data)=>{
      this.processArticle(data);
      return data;
    });
    
  },
});
