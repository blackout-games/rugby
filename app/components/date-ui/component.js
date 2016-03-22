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

  fullDate: Ember.computed('date','i18n.locale', function() {
    return moment(this.get('date')).format('dddd Do MMM YYYY, h:mm a'); // Monday 14th Aug 2015, 11:33 am

  }),

  relativeDate: Ember.computed('date','i18n.locale', function() {
    return moment(this.get('date')).fromNow();
  }),

  setTitle: Ember.on('didInsertElement', function() {

    this.$().findClosest('.relative-date').attr('title', this.get('fullDate'));
    this.$().findClosest('.full-date').attr('title', this.get('relativeDate')).hide();
    

  }),

  toggleFullDate: Ember.on('click', function() {
    
    if (this.get('mode') === 'relativeDate') {
      this.$().findClosest('.relative-date').stop().fadeOut(111,()=>{
        this.$().findClosest('.full-date').stop().fadeIn(111);
      });
      this.set('mode','fullDate');
    } else {
      this.$().findClosest('.full-date').stop().fadeOut(111,()=>{
        this.$().findClosest('.relative-date').stop().fadeIn(111);
      });
      this.set('mode','relativeDate');
    }

  }),

});
