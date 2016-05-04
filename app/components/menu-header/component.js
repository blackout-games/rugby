import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userImages: Ember.inject.service(),

  classNames: ['menu-header'],
  
  settingsPanelIsShowing: false,

  setup: Ember.on('didInsertElement', function() {
    
    // Listen for settings toggle events
    this.get('eventBus').subscribe('showSettings', this, this.showSettings);
    this.get('eventBus').subscribe('toggleSettings', this, this.toggleSettings);
    
  }),

  cleanup: Ember.on('willDestroyElement', function(){
    
    this.get('eventBus').unsubscribe('showSettings', this, this.showSettings);
    this.get('eventBus').unsubscribe('toggleSettings', this, this.toggleSettings);
    
  }),
  
  showSettings(){
    this.send('toggleSettings','show');
  },
  
  toggleSettings(){
    this.send('toggleSettings');
  },

  currentClub: Ember.computed('session.sessionBuilt', function() {
    if (this.get('session.isAuthenticated') && this.get('session.data.manager.currentClub')) {
      return this.get('store').findRecord('club', this.get('session.data.manager.currentClub'));
    }
  }),

  logoutAction: 'invalidateSession',
  fbLoginAction: 'loginWithFacebook',
  
  deselectSettingsCog: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'settingsPanelIsShowing') && !this.get('settingsPanelIsShowing')){
      this.$('.settings-cog > .btn-a').removeClass('active');
    }
  }),

  actions: {
    invalidateSession() {
      this.sendAction('logoutAction');
    },
    loginWithFacebook(button) {
      this.sendAction('fbLoginAction', button);
    },
    goAction(){
      // Used for testing some random action
    },
    toggleSettings(force){
      
      let lastToggled = this.get('settingsLastToggled');
      if(Ember.isEmpty(lastToggled)){
        lastToggled = 0;
      }
      
      // Enforce a minimum time between taps
      if(Date.now()-lastToggled>=222){
        
        let $item = this.$('.settings-cog > .btn-a');
        
        if(force==='show'){
          $item.addClass('active');
        } else if(force==='hide'){
          $item.removeClass('active');
        } else {
          $item.toggleClass('active');
        }
        
        // For sending action up
        if(this.attrs.onToggle){
          this.attrs.onToggle($item.hasClass('active'));
        }
        
        // For staying up to date with actions coming down
        if($item.hasClass('active')){
          this.set('settingsPanelIsShowing',true);
        } else {
          this.set('settingsPanelIsShowing',false);
        }
        
        this.set('settingsLastToggled',Date.now());
        
        
      }
    },
  }

});
