import Ember from 'ember';

export default Ember.Component.extend({
  
  weatherId: 1,
  dayOrNight: 'day',
  
  weatherIndex: {
    1: {
      day: 'sunFill',
      night: 'moonFill',
    },
    2: {
      day: 'cloudSun',
      night: 'cloudMoon',
    },
    3: {
      day: 'cloud',
      night: 'cloud',
    },
    4: {
      day: 'cloudFill',
      night: 'cloudFill',
    },
    5: {
      day: 'cloudDrizzleAlt',
      night: 'cloudDrizzleAlt',
    },
    6: {
      day: 'wind',
      night: 'wind',
    },
    7: {
      day: 'cloudRainFill',
      night: 'cloudRainFill',
    },
    8: {
      day: 'cloudLightning',
      night: 'cloudLightning',
    },
    9: {
      day: 'tornado',
      night: 'tornado',
    },
    10: {
      day: 'cloudSnowAlt',
      night: 'cloudSnowAlt',
    },
    11: {
      day: 'cloudDrizzleSunAlt',
      night: 'cloudDrizzleMoonAlt',
    },
    12: {
      day: 'cloudHailAlt',
      night: 'cloudHailAlt',
    },
  },
  
  weather: Ember.computed('weatherId','dayOrNight',function(){
    
    let id = this.get('weatherId');
    let dayOrNight = this.get('dayOrNight');
    return this.get(`weatherIndex.${id}.${dayOrNight}`);
    
  }),
  
  /**
   * Needed as a fix for clipPaths not working due to use of <base> tag in ember.
   * See: https://github.com/emberjs/ember.js/issues/13032#issuecomment-191880672
   */
  clipPathBase: Ember.computed('window.location.href',function(){
    return window.location.href;
  }),
  
});
