import Ember from 'ember';
import EmberChartComponent from 'ember-cli-chart/components/ember-chart';

export default EmberChartComponent.reopen({

  didInsertElement: function(){
      
    var context = this.get('element').getContext('2d');
    var data = this.get('data');
    
    data = this.buildColors(data,context);
    this.set('data',data);
    
    this._super.apply(this, arguments);
    
  },

  updateChart: function(){
      
    var context = this.get('element').getContext('2d');
    var data = this.get('data');
    
    data = this.buildColors(data,context);
    this.set('data',data);
    
    this._super.apply(this, arguments);
    
  },
  
  /**
   * Update options properly to workaround shortcmoing in ember-chart component
   */
  updateOpts: Ember.on('didReceiveAttrs',function(){
    
    if(this.get('element')){
      
      var context = this.get('element').getContext('2d');
      var data = this.get('data');
      var type = Ember.String.classify(this.get('type'));
      
      // Get previous chart
      var chart = this.get('chart');
      if(chart){
        chart.destroy();
      }
      
      data = this.buildColors(data,context);
      
      // Make new with new options
      chart = new Chart(context)[type](data, this.get('options'));
      this.set('chart', chart);
      
    }
  }),
  
  buildColors(data,context){
    
    data.forEach((item)=>{
      if(typeof item.color === 'function'){
        item.color = item.color(context);
      }
    });
    
    return data;
  },
  
});
