import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
//import t from "../../utils/translation-macro";

export default Ember.Component.extend({

  tagName: 'span',
  classNames: 'date-ui',
  
  /**
   * Set these via component attrs
   */
  initial: 'relativeDate', // relativeDate | fullDate | gameDate
  alt: 'fullDate', // relativeDate | fullDate | gameDate
  
  displayDate: Ember.computed('mode',function(){
    return this.get(this.get('mode'));
  }),

  fullDate: Ember.computed('date','i18n.locale', function() {
    let m = moment(this.get('date'));
    if(this.get('timeZone')){
      m = m.tz(this.get('timeZone'));
    }
    return m.format('dddd Do MMM YYYY, h:mm a'); // Monday 14th Aug 2015, 11:33 am
  }),
  
  dayDate: Ember.computed('date','i18n.locale', function() {
    let m = moment(this.get('date'));
    if(this.get('timeZone')){
      m = m.tz(this.get('timeZone'));
    }
    return m.format('ddd D MMM YYYY'); // Mon 14 Aug 2015
  }),
  
  timeDate: Ember.computed('date','i18n.locale', function() {
    let m = moment(this.get('date'));
    if(this.get('timeZone')){
      m = m.tz(this.get('timeZone'));
    }
    return m.format('LT'); // 8:30 PM
  }),

  relativeDate: Ember.computed('date','i18n.locale', function() {
    let m = moment(this.get('date'));
    if(this.get('timeZone')){
      m = m.tz(this.get('timeZone'));
    }
    return m.fromNow();
  }),
  
  gameSeason: Ember.computed('date',function(){
    return Ember.Blackout.getSeasonRoundDay(this.get('date'))['season'];
  }),
  
  gameRound: Ember.computed('date',function(){
    return Ember.Blackout.getSeasonRoundDay(this.get('date'))['round'];
  }),
  
  gameDay: Ember.computed('date',function(){
    return Ember.Blackout.getSeasonRoundDay(this.get('date'))['day'];
  }),

  gameDate: t('date.season-round-day',{
    season:'gameSeason',
    round:'gameRound',
    day:'gameDay'
  }),

  gameDateShort: t('date.season-round-day-short',{
    season:'gameSeason',
    round:'gameRound',
    day:'gameDay'
  }),
  
  initialDate: Ember.computed(function(){
    return this.get(this.get('initial'));
  }),
  
  altDate: Ember.computed(function(){
    return this.get(this.get('alt'));
  }),

  setTitle: Ember.on('didInsertElement', function() {

    this.$().findClosest('.initial-date').attr('title', this.get(this.get('initial')));
    this.$().findClosest('.alt-date').attr('title', this.get(this.get('alt'))).hide();

  }),
  
  current: 'initial',

  toggleFullDate: Ember.on('click', function() {
    
    if(!this.get('alt')){
      return;
    }
    
    if (this.get('current') === 'initial') {
      this.$().findClosest('.initial-date').stop().fadeOut(111,()=>{
        this.$().findClosest('.alt-date').stop().fadeIn(111);
      });
      this.set('current','alt');
    } else {
      this.$().findClosest('.alt-date').stop().fadeOut(111,()=>{
        this.$().findClosest('.initial-date').stop().fadeIn(111);
      });
      this.set('current','initial');
    }

  }),

});
