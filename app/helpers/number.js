import Ember from 'ember';

export function number(val, params/*, hash*/) {
  
  if( params.roundMillions ){
    if(val>=1000000){
      val = (Math.round(val/500000)*0.5) + 'm';
    }
  } 
  
  if( params.prefix ){
    val = val>=0 ? '+' + val : val;
  }
  
  if( params.round ){
    val = Math.round(val * Math.pow(10,params.round)) / Math.pow(10,params.round);
  }
  
  if( params.percent ){
    val = (val*100) + '%';
  } else {
    val = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  return val;
}

export default Ember.Helper.helper(number);
