import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "button",
  myContext: { name: "loadingButtonState" },
  spinnerColor: "primary",
  classNames: ['loader-button'],
  
  setAction: function(){
    this.set('clickAction',this.get('action'));
    this.set('action',null);
  }.on('init'),
  
  click: function(){
    var self = this;
    
    // Save button content
    this.set('originalContent',this.$().html());
    
    // Save widths
    this.set('outerWidth',this.$().outerWidth());
    this.set('originalWidth',this.$().css('width'));
    
    // Remove padding
    this.$().addClass('loading');
    this.$().css('width',this.get('outerWidth'));
    
    // Show button spinner
    this.$().find('.content').hide();
    this.$().find('.spinner').removeClass('hidden');
    
    // Hide keyboard
    this.$().focus();
    Ember.run.debounce(Ember.FormContext,function(){
      self.$().blur();
    },1);
    
    // Disable button
    this.$().attr('disabled',true);
    
    // Send action
    this.sendAction('clickAction',this);
    
    // Don't bubble
    return false;
    
  },
  
  reset: function(allowFocus = true){
    this.$().html(this.get('originalContent'));
    this.$().attr('disabled',false);
    this.$().removeClass('loading');
    this.$().css('width',this.get('originalWidth'));
    
    if(allowFocus){
      var self = this;
      Ember.run.debounce(Ember.FormContext,function(){
        self.$().focus();
      },1);
    }
  },
  
});
