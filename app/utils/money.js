//import Ember from 'ember';

export default function(val,locale,roundMillions){
  
  if( roundMillions ){
    if(val>=1000000){
      val = (Math.round(val/500000)*0.5) + 'm';
    }
  } else {
    val = Number(val).toFixed(0);
  }
  
  // TODO Get currency symbol from preferences
  let symbol = '$';
  
  let symbolIsAfter = locale==='es' || locale==='es-ar';
  let symbolBefore = symbolIsAfter ? '' : symbol;
  let symbolAfter = symbolIsAfter ? symbol : '';
  
  return symbolBefore + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + symbolAfter;
  
}
