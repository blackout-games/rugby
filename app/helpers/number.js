import Ember from 'ember';

function pad(num, size) {
    var s = num+"";
    while (s.length < size){
      s = "0" + s;
    }
    return s;
}

export function number(val, params={}/*, hash*/) {
  
  let ogVal = val;
  
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
      val = Number(val*100).toFixed(params.round);
    } else {
      val = (val*100);
    }
    if(params.pad){
      val = pad(val, params.pad);
    }
    val += '%';
  } else {
    if( params.round ){
      val = Number(val).toFixed(params.round);
    }
    if(params.pad){
      val = pad(val, params.pad);
    }
    val = val.toLocaleString();
  }
  
  // Ordinal suffix
  if(params.ordinalSuffix){
    val += this.get('text').getOrdinalSuffix(ogVal);
  }
  
  return val;
}

export default Ember.Helper.extend({
  text: Ember.inject.service(),
  compute: number
});
