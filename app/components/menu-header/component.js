import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userImages: Ember.inject.service(),

  classNames: ['menu-header'],
  
  settingsPanelIsShowing: false,
  clubSwitcherPanelIsShowing: false,

  setup: Ember.on('didInsertElement', function() {
    
    // Listen for settings toggle events
    this.get('eventBus').subscribe('showSettings', this, this.showSettings);
    this.get('eventBus').subscribe('toggleSettings', this, this.toggleSettings);
    this.get('eventBus').subscribe('hideClubSwitcher', this, this.hideClubSwitcher);
    
  }),

  cleanup: Ember.on('willDestroyElement', function(){
    
    this.get('eventBus').unsubscribe('showSettings', this, this.showSettings);
    this.get('eventBus').unsubscribe('toggleSettings', this, this.toggleSettings);
    this.get('eventBus').unsubscribe('hideClubSwitcher', this, this.hideClubSwitcher);
    
  }),
  
  showSettings(){
    this.send('togglePanel','settings','show');
  },
  
  toggleSettings(){
    this.send('togglePanel','settings');
  },
  
  hideClubSwitcher(){
    this.send('togglePanel','clubSwitcher','hide');
  },

  currentClub: Ember.computed('session.currentClub', function() {
    return this.get('session.currentClub');
  }),

  logoutAction: 'invalidateSession',
  fbLoginAction: 'loginWithFacebook',
  
  deselectMiscPanels: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'settingsPanelIsShowing') && !this.get('settingsPanelIsShowing')){
      this.$('.settings-cog > .btn-a').removeClass('active');
    }
    if(this.attrChanged(opts,'clubSwitcherPanelIsShowing') && !this.get('clubSwitcherPanelIsShowing')){
      this.$('.menu-club').removeClass('active');
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
    togglePanel(panelName,force){
      
      let $item;
      if(panelName==='settings'){
        $item = this.$('.settings-cog > .btn-a');
      } else if(panelName==='clubSwitcher'){
        $item = this.$('.menu-club');
      } else {
        return;
      }
      
      let lastToggled = this.get(panelName+'LastToggled');
      if(Ember.isEmpty(lastToggled)){
        lastToggled = 0;
      }
      
      // Enforce a minimum time between taps
      if(Date.now()-lastToggled>=222){
        
        if(force==='show'){
          $item.addClass('active');
        } else if(force==='hide'){
          $item.removeClass('active');
        } else {
          $item.toggleClass('active');
        }
        
        // For sending action up
        if(this.attrs.onPanelToggle){
          this.attrs.onPanelToggle(panelName,$item.hasClass('active'));
        }
        
        // For staying up to date with actions coming down
        if($item.hasClass('active')){
          this.set(panelName+'PanelIsShowing',true);
        } else {
          this.set(panelName+'PanelIsShowing',false);
        }
        
        this.set(panelName+'LastToggled',Date.now());
        
      }
    },
  }

});
