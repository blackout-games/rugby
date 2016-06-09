import Ember from 'ember';

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  
  initInfo(){
    
    // Get user
    if(this.get('session.isAuthenticated')){
      
      return this.get('store').findRecord('club', this.get('session.data.manager.currentClub')).then((club)=>{
        
        let query = {
          'country': club.get('country.id'),
        };
        
        return this.get('store').queryRecord('info',query).then((data)=>{
          this.setNewInfo(data);
          return data;
        }).catch((err)=>{
          Ember.Logger.warn('Failed to get environment info');
          print(err);
        });
        
      });
      
    } else {
      
      return this.get('store').queryRecord('info',{}).then((data)=>{
        this.setNewInfo(data);
        return data;
      }).catch((err)=>{
        Ember.Logger.warn('Failed to get environment info');
        print(err);
      });
      
    }
    
  },
  
  refresh(){
    this.initInfo();
  },
  
  setNewInfo(data){
    
    // Set current Blackout time
    this.set('currentTime',data.get('currentTime'));
    
    // Set weather
    let weather = data.get('country.currentWeather');
    this.set('weather',weather.get('id'));
    this.set('weatherLabel',weather.get('label'));
    
    // Set local time
    let localTime = new Date(data.get('country.localTime'));
    this.set('localTime',localTime);
    
    // Set day or night
    let hour = localTime.getHours();
    this.set('dayOrNight',hour>=19 || hour<6 ? 'night' : 'day');
    
    // Set time diffs list
    this.set('timeDiffs',data.get('timeDiffs'));
    
    // Set game date
    this.set('gameDate',Ember.Object.extend(data.get('gameDate')).create());
    
  },
  
});
