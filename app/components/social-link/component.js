import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'a',
  classNames: ['btn-a'],
  attributeBindings: ['href'],
  allowAppLink: false,
  canAppLink: null,

  setup: Ember.on('didInsertElement', function() {
    
    var isFirefox = /firefox/i.test(navigator.userAgent);
    /firefox/i.test(navigator.userAgent);
    var isIE = /msie/i.test(navigator.userAgent) || /rv:/i.test(navigator.userAgent);
    this.set('allowAppLink', !isFirefox&&!isIE );
    
    // Detect events so social links can communicate with each other
    this.get('EventBus').subscribe('appLinksAbilityChange', this, this.handleAbilityChange );
    
  }),
  
  cleanup: Ember.on('willDestroyElement', function(){
    
    this.get('EventBus').unsubscribe('appLinksAbilityChange', this, this.handleAbilityChange );
    
  }),
  
  handleAbilityChange( ability ){
    this.set('canAppLink',ability);
  },

  click(event) {
    if( this.get('canAppLink') !== null ){
      if( this.get('canAppLink') ){
        document.location = this.get('uri');
        event.preventDefault();
      }
    } else {
      if (this.get('allowAppLink') && this.goToUri(this.get('uri'))) {
        this.get('EventBus').publish('appLinksAbilityChange',true);
        event.preventDefault();
      } else {
        this.get('EventBus').publish('appLinksAbilityChange',false);
      }
    }

  },

  goToUri(uri) {
    var start, end, elapsed;

    // start a timer
    start = new Date().getTime();

    // attempt to redirect to the uri:scheme
    // the lovely thing about javascript is that it's single threadded.
    // if this WORKS, it'll stutter for a split second, causing the timer to be off
    document.location = uri;

    // end timer
    end = new Date().getTime();

    elapsed = (end - start);

    // if there's no elapsed time, then the scheme didn't fire, and we head to the url.
    //alert(elapsed);
    return elapsed >= 1;
  },

});
