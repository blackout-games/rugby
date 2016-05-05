import Ember from 'ember';
const { Blackout } = Ember;
import t from "rugby-ember/utils/translation-macro";
//import DS from 'ember-data';

export default Ember.Component.extend({
  
  store: Ember.inject.service(),
  
  seasons: [
    {
      label: t('player.statistics.all-time'),
      value: 0,
    },
  ],
  
  setupSeasonsList: Ember.on('init',function(){
    
    let currentSeason = Blackout.getSeasonRoundDay();
    currentSeason = Blackout.getSeasonRoundDay();
    let dateJoined = Blackout.getSeasonRoundDay(this.get('player.joined'));
    let seasons = this.get('seasons');
    
    for(let s=currentSeason.season; s>=dateJoined.season; s--){
      
      seasons.push({
        label: t('player.statistics.league-season',{ season: 'value' }),
        value: s,
      });
      
    }
    
  }),
  
  actions: {
    changeSeason(season){
      this.set('currentSeason',season);
    },
  },
  
  isLoadingSeasonStats: false,
  
  seasonStats: Ember.computed( 'currentSeason', 'stats', function(){
    let stats = this.seasonStatsProxy();
    if(stats && stats.then){
      return this.get('previousSeasonStats');
    } else if(!stats){
      return Ember.Object.create();
    }
    this.set('previousSeasonStats',stats);
    return stats;
  }),
  
  seasonStatsProxy(){
    
    let season = this.get('currentSeason');
    let stats = this.get('stats');
    let playerid = this.get('stats.id');
    let cache = this.get('cache');
    
    // Caching
    let key = 'platerStats_' + playerid + '_' + season.value;
    if(cache.keyExists(key)){
      return cache.get(key);
    }
    
    if(season.value === 0){
      cache.set(key,stats);
      return stats;
    } else {
      
      let seasonStats = stats.get('leagueStatistics.season-'+season.value);
      
      if(typeof(seasonStats)==='undefined'){
        
        let statsQuery = {
          filter: {
            'id': playerid,
          },
          'league-season': season.value,
        };
        
        Blackout.startLoading();
        
        return this.get('store').queryRecord('player-statistics',statsQuery).then((data)=>{
          
          Blackout.stopLoading();
          
          seasonStats = data.get('firstObject.leagueStatistics.season-'+season.value);
          if(!seasonStats){
            seasonStats = Ember.Object.create();
          }
          cache.set(key,Blackout.camelKeys(seasonStats));
          
          this.set('stats',data.get('firstObject'));
          //return data.get('firstObject.leagueStatistics.season-'+season.value);
          
        }).finally(()=>{
          // Force refresh of currentSeason stats
          this.notifyPropertyChange('currentSeason');
        });
        
        /*return DS.PromiseObject.create({
          promise: promise
        });*/
        
      } else {
        seasonStats = Blackout.camelKeys(seasonStats);
        cache.set(key,seasonStats);
        return seasonStats;
      }
      
    }
    
  },
  
  setupCurrentSeason: Ember.on('init',function(){
    this.set('currentSeason',this.get('seasons')[0]);
  }),
  
  isOnScreen: Ember.computed('selectedTab',function(){
    
    return this.get('selectedTab') === this.get('waitForTab');
    
  }),
  
  miscGroup: [
    {
      label: t('player.statistics.matches-played'),
      key: 'matchesplayed'
    },
    {
      label: t('player.statistics.injuries'),
      key: 'injuries'
    },
  ],
  
  capsGroup: [
    {
      label: t('player.statistics.league'),
      key: 'leaguecaps'
    },
    {
      label: t('player.statistics.cup'),
      key: 'cupcaps'
    },
    {
      label: t('player.statistics.friendly'),
      key: 'friendlycaps'
    },
    {
      label: t('player.statistics.national'),
      key: 'nationalcaps'
    },
    {
      label: t('player.statistics.u20'),
      key: 'undertwentycaps'
    },
    {
      label: t('player.statistics.world-cup'),
      key: 'worldcupcaps'
    },
    {
      label: t('player.statistics.u20-world-cup'),
      key: 'undertwentyworldcupcaps'
    },
  ],
  
  pointsGroup: [
    {
      label: t('player.statistics.tries'),
      key: 'tries'
    },
    {
      label: t('player.statistics.conversions'),
      key: 'conversions'
    },
    {
      label: t('player.statistics.drop-goals'),
      key: 'dropgoals'
    },
    {
      label: t('player.statistics.penalty-kicks'),
      key: 'penalties'
    },
    {
      label: t('player.statistics.points-scored'),
      key: 'totalpoints'
    }
  ],
  
  attackGroup: [
    {
      label: t('player.statistics.metres-gained'),
      key: 'metresgained'
    },
    {
      label: t('player.statistics.line-breaks'),
      key: 'linebreaks'
    },
    {
      label: t('player.statistics.intercepts'),
      key: 'intercepts'
    },
    {
      label: t('player.statistics.try-assists'),
      key: 'tryassists'
    },
    {
      label: t('player.statistics.beaten-defenders'),
      key: 'beatendefenders'
    }
  ],
  
  defenceGroup: [
    {
      label: t('player.statistics.tackles'),
      key: 'tackles'
    },
    {
      label: t('player.statistics.missed-tackles'),
      key: 'missedtackles'
    },
  ],
  
  kickingGroup: [
    {
      label: t('player.statistics.kicks'),
      key: 'kicks'
    },
    {
      label: t('player.statistics.metres-kicked'),
      key: 'kickingmetres'
    },
    {
      label: t('player.statistics.kicks-out-on-the-full'),
      key: 'kicksoutonthefull'
    },
    {
      label: t('player.statistics.conversions'),
      key: 'conversions'
    },
    {
      label: t('player.statistics.missed-conversions'),
      key: 'missedconversions'
    },
    {
      label: t('player.statistics.drop-goals'),
      key: 'dropgoals'
    },
    {
      label: t('player.statistics.missed-drop-goals'),
      key: 'misseddropgoals'
    },
    {
      label: t('player.statistics.penalties'),
      key: 'penalties'
    },
    {
      label: t('player.statistics.missed-penalties'),
      key: 'missedpenalties'
    },
    {
      label: t('player.statistics.good-up-and-unders'),
      key: 'goodupandunders'
    },
    {
      label: t('player.statistics.bad-up-and-unders'),
      key: 'badupandunders'
    },
    {
      label: t('player.statistics.up-and-unders'),
      key: 'upandunders'
    },
    {
      label: t('player.statistics.good-kicks'),
      key: 'goodkicks'
    },
    {
      label: t('player.statistics.bad-kicks'),
      key: 'badkicks'
    },
  ],
  
  handlingGroup: [
    {
      label: t('player.statistics.knock-ons'),
      key: 'knockons'
    },
    {
      label: t('player.statistics.handling-errors'),
      key: 'handlingerrors'
    },
    {
      label: t('player.statistics.forward-passes'),
      key: 'forwardpasses'
    },
    {
      label: t('player.statistics.ball-carries'),
      key: 'ballCarries'
    },
  ],
  
  disciplineGroup: [
    {
      label: t('player.statistics.fights'),
      key: 'fights'
    },
    {
      label: t('player.statistics.penalties-conceded'),
      key: 'penaltiesconceded'
    },
    {
      label: t('player.statistics.turnovers-won'),
      key: 'turnoverswon'
    },
  ],
  
  lineoutGroup: [
    {
      label: t('player.statistics.lineouts-secured'),
      key: 'lineoutssecured'
    },
    {
      label: t('player.statistics.lineouts-conceded'),
      key: 'lineoutsconceded'
    },
    {
      label: t('player.statistics.lineouts-stolen'),
      key: 'lineoutsstolen'
    },
    {
      label: t('player.statistics.successful-lineout-throws'),
      key: 'successfullineoutthrows'
    },
    {
      label: t('player.statistics.failed-lineout-throws'),
      key: 'unsuccessfullineoutthrows'
    },
  ],
  
});
