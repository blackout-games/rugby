import Ember from 'ember';

export default Ember.Component.extend({
  locale: Ember.inject.service(),
  
  /**
   * The amount of money
   */
  value: 0,
  
  /**
   * Set to true to round millions like $10m
   * @type {Boolean}
   */
  roundMillions: false,
  
  
  formatedMoney: Ember.computed('value','roundMillions','locale.currentLocale',function(){
    
    let val = this.get('value');
    
    let roundMillions = this.get('roundMillions');
    
    if( roundMillions ){
      if(val>=1000000){
        val = (Math.round(val/500000)*0.5) + 'm';
      }
    } else {
      val = Number(val).toFixed(0);
    }
    
    // TODO Get currency symbol from preferences
    let symbol = '$';
    
    let locale = this.get('locale.currentLocale');
    let symbolIsAfter = locale==='es' || locale==='es-ar';
    let symbolBefore = symbolIsAfter ? '' : symbol;
    let symbolAfter = symbolIsAfter ? symbol : '';
    
    return symbolBefore + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + symbolAfter;
    
  }),
  
});
