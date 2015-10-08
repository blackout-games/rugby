import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'span',
  classNames: 'date-ui',
  mode: 'relativeDate',
  
  displayDate: Ember.computed('mode',function(){
    return this.get(this.get('mode'));
  }),

  uiEvents: {
    //'mouseenter': 'showHover',
    //'mouseout': 'hideHover',
  },

  fullDate: Ember.computed('date', function() {
    return moment(this.get('date')).format('dddd Do MMM YYYY, h:mm a'); // Monday 14th Aug 2015, 11:33 am

  }),

  setTitle: Ember.on('didInsertElement', function() {

    this.$().findClosest('.relative-date').attr('title', this.get('fullDate'));
    this.$().findClosest('.full-date').attr('title', this.get('relativeDate')).hide();
    

  }),

  relativeDate: Ember.computed('date', function() {
    return moment(this.get('date')).fromNow();
  }),

  toggleFullDate: Ember.on('click', function() {
    
    var self = this;
    
    if (self.get('mode') === 'relativeDate') {
      self.$().findClosest('.relative-date').stop().fadeOut(111,function(){
        self.$().findClosest('.full-date').stop().fadeIn(111);
      });
      self.set('mode','fullDate');
    } else {
      self.$().findClosest('.full-date').stop().fadeOut(111,function(){
        self.$().findClosest('.relative-date').stop().fadeIn(111);
      });
      self.set('mode','relativeDate');
    }

  }),

});
