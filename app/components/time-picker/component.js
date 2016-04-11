import Ember from 'ember';

export default Ember.Component.extend({
  
  onInit: Ember.on('init',function(){
    this.set('uniqueid',Ember.Blackout.generateId());
    
    let date = this.get('time');
    if(!(date instanceof Date)){
      date = new Date(date);
      this.set('time',date);
    }
    this.set('startHour',date.getHours());
    this.set('startMinute',date.getMinutes());
    this.set('hour',date.getHours());
    this.set('minute',date.getMinutes());
    
  }),
  
  hourName: Ember.computed(function(){
    return "time-picker-hour-" + this.get('uniqueid');
  }),
  
  minuteName: Ember.computed(function(){
    return "time-picker-minute-" + this.get('uniqueid');
  }),
  
  amPm: Ember.computed('hour',function(){
    return this.get('hour')>=12 ? 'pm' : 'am';
  }),
  
  displayHour: Ember.computed('hour','12HourTime',function(){
    let hour = this.get('hour');
    if(this.get('12HourTime') && hour===0){
      return 12;
    } else if(this.get('12HourTime') && hour>12){
      return hour-12;
    } else {
      return hour;
    }
  }),
  
  actions: {
    onHourChange(val){
      this.set('hour',val);
      this.send('onChange');
    },
    onMinuteChange(val){
      this.set('minute',val);
      this.send('onChange');
    },
    onChange(){
      let hour = this.get('hour');
      let minute = this.get('minute');
      let date = this.get('time');
      if(hour!==undefined && minute!==undefined && this.attrs.onChange){
        date.setHours(hour);
        date.setMinutes(minute);
        this.attrs.onChange(date);
      }
    },
  }
  
});
