import Ember from 'ember';
const { toZonedTime, toUTCTime } = Ember.Blackout;

export default Ember.Component.extend({
  
  classNames: ['blackout-timeline'],
  
  text: Ember.inject.service(),
  
  days: Ember.computed('data',function(){
    
    let events = [];
    let currentDay = null;
    let currentIndex = null;
    let currentMin = null;
    let currentMindex = null;
    
    
    this.get('data').forEach((event)=>{
      
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
        events.push({
          date: day,
          minutes: [],
        });
        currentDay = day;
        currentIndex = events.length-1;
      }
      
      if(minute!==currentMin){
        events[currentIndex].minutes.push({
          date: minute,
          events: [],
        });
        currentMin = minute;
        currentMindex = events[currentIndex].minutes.length-1;
      }
      
      let finalEvent = {
        date: event.get('date'),
      };
      
      if(event.get('event')){
        finalEvent.event = this.get('text').parse(event.get('event'));
      } else {
        finalEvent.item = event;
      }
      
      events[currentIndex].minutes[currentMindex].events.push(finalEvent);
      
    });
    
    
    return events;
    
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('no-bumper')){
      this.$('.blackout-timeline-bumper').hide();
    }
    
  }),
  
});
