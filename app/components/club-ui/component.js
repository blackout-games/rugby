import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  classNames: ['inline-block','club-ui'],
  imageSize: 'medium',
  tagName: 'span',
  hasInit: false,
  defaultColor: 'light',
  placeholder: '/assets/images/user/club.png',
  
  /**
   * Get national or U20 clubs
   * @type {Boolean}
   */
  nat: false,
  u20: false,
  
  setupAttrs: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      
      if(!this.get('club') && !this.get('clubId') && this.get('session.isAuthenticated')){
        
        // Use current user club
        this.set('club',this.get('session.club'));
        
      }
      
      if(this.get('clubId') && !this.get('club')){
        
        let clubId = this.get('clubId');
        let type = '';
        
        if(this.get('nat')){
          type = 'national-';
        } else if(this.get('u20')){
          type = 'u20-';
        }
        
        this.get('store').findRecord(type+'club',clubId).then((data)=>{
          this.set('club',data);
          
          if(this.attrs.getClub){
            this.attrs.getClub(data);
          }
          
          return data;
        });
        
      }
      
      this.set('hasInit',true);
      
    }
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('inline')){
      this.$().css('margin-right','3px');
    }
    
  }),
  
});
