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
  
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Ember.Helper.helper(number);
