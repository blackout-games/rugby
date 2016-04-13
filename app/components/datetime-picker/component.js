import Ember from 'ember';

export default Ember.Component.extend({
  
  initDate: Ember.on('didReceiveAttrs',function(opts){
    if(opts.newAttrs.date){
      
      let date = this.get('date');
      
      if(!date){
        date = new Date();
      } else {
        date = this.assertDate(date);
      }
      
      this.set('timeDate',date);
      this.set('dateDate',date);
      
    } else if(!this.get('timeDate')){
      
      let date = new Date();
      this.set('timeDate',date);
      this.set('dateDate',date);
      
    }
  }),
  
  date: Ember.computed('timeDate','dateDate',{
    get() {
      let date = this.get('dateDate');
      let time = this.get('timeDate');
      
      if(!date.setHours){
        Ember.Logger.warn('An invalid date has been passed to datetime-picker');
        return new Date();
      }
      
      date.setHours(time.getHours());
      date.setMinutes(time.getMinutes());
      
      return new Date(date.getTime());
    },
    set(key, value) {
      value = this.assertDate(value);
      
      this.set('timeDate',  value);
      this.set('dateDate',  value);
      
      return value;
    }
  }),
  
  actions: {
    onChangeDate(date){
      this.set('dateDate',date);
      this.sendChange();
    },
    onChangeTime(date){
      this.set('timeDate',date);
      this.sendChange();
    },
  },
  
  sendChange(){
    if( this.attrs.onChange ){
      this.attrs.onChange(this.get('date'));
    }
  },
  
  assertDate(date){
    if(!(date instanceof Date)){
      if(date){
        date = new Date(date);
      } else {
        date = new Date();
      }
    } else {
      // We must copy any date objects to ensure dates passed in are readonly
      date = new Date(date.getTime());
    }
    return date;
  },
  
});
