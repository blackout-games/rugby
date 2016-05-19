import Ember from 'ember';
import formatMoney from 'rugby-ember/utils/money';

/**
 * We made this a component so that we can move the symbol when the language is changed.
 * This is not possible with helpers.
 */
export default Ember.Component.extend({
  locale: Ember.inject.service(),
  tagName: 'span',
  
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
    
    return formatMoney(this.get('value'),this.get('locale.currentLocale'),this.get('roundMillions'));
    
  }),
  
});
