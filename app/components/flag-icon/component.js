import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['flag-icon'],
  attributeBindings: ['title'],
  
  title: Ember.computed('country',function(){
    return this.get('country.name');
  }),
  
  setup: Ember.on('didRender',function(){
    
    let country = this.get('country');
    
    if(country){
      let iso = country.get('id').toLowerCase();
      this.$().css({
        'background-image': 'url(assets/images/flags/4x3/' + iso + '.svg)',
      });
      this.$().show();
    } else {
      this.$().hide();
    }
    
    if(this.get('size')==='big'){
      this.$().addClass('flag-icon-big');
    }
    if(this.get('size')==='medium'){
      this.$().addClass('flag-icon-medium');
    }
    
  }),
  
});
