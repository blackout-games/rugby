import Ember from 'ember';
import EmberChartComponent from 'ember-cli-chart/components/ember-chart';

export default EmberChartComponent.extend({
  
  /**
   * Update options properly to workaround shortcmoing in ember-chart component
   */
  updateOpts: Ember.on('didReceiveAttrs',function(){
    //if(this.attrChanged(opts,'options') && this.get('element')){
    if(this.get('element')){
      //log('options changed');
      var context = this.get('element').getContext('2d');
      var data = this.get('data');
      var type = Ember.String.classify(this.get('type'));
      var chart = new Chart(context)[type](data, this.get('options'));
      this.set('chart', chart);
    }
  }),
  
  
});
