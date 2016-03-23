import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['flag-icon'],
  
  setup: Ember.on('didRender',function(){
    
    let iso = this.get('country');
    
    if(iso){
      iso = iso.toLowerCase();
      this.$().css({
        'background-image': 'url(assets/images/flags/4x3/' + iso + '.svg)',
      });
    }
    
    if(this.get('size')==='big'){
      this.$().addClass('flag-icon-big');
    }
    
  }),
  
});
