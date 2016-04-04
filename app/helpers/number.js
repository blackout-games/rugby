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
  
  
  if( params.percent ){
    if( params.round ){
      val = Number(val*100).toFixed(params.round) + '%';
    } else {
      val = (val*100) + '%';
    }
  } else {
    if( params.round ){
      val = Number(val).toFixed(params.round);
    } else {
      val = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
  
  return val;
}

export default Ember.Helper.helper(number);
