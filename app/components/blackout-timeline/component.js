import Ember from 'ember';
const { toZonedTime, toUTCTime } = Ember.Blackout;

export default Ember.Component.extend({
  text: Ember.inject.service(),
  
  classNames: ['blackout-timeline'],
  defaultItemHeight: 150,
  days: Ember.A(),
  
  /**
   * Set this to true when using our own format within a loop
   * @type {Boolean}
   */
  isCustom: false,
  
  /**
   * Start building a new days array
   */
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    if(this.attrChanged(attrs,'data') && this.get('data')){
      let days = Ember.A();
      days.pushObjects(this.makeDays(this.get('data')));
      this.set('days',days);
    }
  }),
  
  /**
   * Add to days array
   */
  onUpdate: Ember.on('didUpdateAttrs',function(attrs){
    if(this.attrChanged(attrs,'addToData') && this.get('addToData')){
      let days = this.get('days');
      days.pushObjects(this.makeDays(this.get('addToData')));
      this.set('days',days);
    }
  }),
  
  makeDays(data){
    
    let days = [];
    let currentDay = null;
    let currentIndex = null;
    let currentMin = null;
    let currentMindex = null;
    
    if(data){
      data.forEach(event => {
        
        let msPerDay = 24*60*60*1000;
        let msPerMin = 60*1000;
        let date = new Date(event.get('date'));
        date = date.getTime();
        
        // Normalise UTC to be equal to the country local time
        let utcTime = toUTCTime(date,this.get('country.timeZone'));
        
        // Now we can use this to group by day
        let day = Math.floor(utcTime/msPerDay)*msPerDay;
        
        // Now we can use this to group by minute
        let minute = Math.floor(utcTime/msPerMin)*msPerMin;
        
        // Restore to zoned time for display
        day = toZonedTime( day, this.get('country.timeZone'));
        
        // Restore to zoned time for display
        minute = toZonedTime( minute, this.get('country.timeZone'));
        
        if(day!==currentDay){
          days.push({
            date: day,
            minutes: [],
          });
          currentDay = day;
          currentIndex = days.length-1;
        }
        
        if(minute!==currentMin){
          days[currentIndex].minutes.push({
            date: minute,
            events: [],
          });
          currentMin = minute;
          currentMindex = days[currentIndex].minutes.length-1;
        }
        
        let finalEvent = {
          date: event.get('date'),
        };
        
        if(event.get('event') && !this.get('isCustom')){
          //finalEvent.event = this.get('text').parse(event.get('event'));
          finalEvent.event = event.get('event');
        } else {
          finalEvent.item = event;
        }
        
        days[currentIndex].minutes[currentMindex].events.push(finalEvent);
        
      });
      
      return days;
      
    } else {
      
      return null;
      
    }
    
  },
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('no-bumper')){
      this.$('.blackout-timeline-bumper').hide();
    }
    
  }),
  
});
