import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: [],
  divisions: [],
  
  onInit: Ember.on('init',function(){
    this.checkFromLeague();
  }),
  
  onDestroy: Ember.on('willDestroyElement',function(){
    this.set('divisions',[]);
  }),
  
  onUpdate: Ember.on('didUpdateAttrs',function(/*attrs*/){
    Ember.run.next(()=>{
      this.scrollToLeague();
    });
  }),
  
  onInsert: Ember.on('didInsertElement',function(){
    this.scrollToLeague();
  }),
  
  checkFromLeague(){
    let fromLeague = Number(this.get('cache.fromLeague'));
    this.set('fromLeague',fromLeague);
    this.set('cache.fromLeague',false);
  },
  
  scrollToLeague(){
    if(this.get('fromLeague')){
      
      let leagueId = this.get('fromLeague');
      let league;
      
      // Find out which division this league exists
      let divisions = this.get('divisions');
      let scrollToDivision=0;
      divisions.forEach(division=>{
        let foundLeague = division.ls.findBy('i',leagueId);
        if(foundLeague){
          league = foundLeague;
          scrollToDivision = division.d;
        }
      });
      
      if(league){
        
        let leagueNumber = league.l;
        
        // ------------------------- Scroll to division
        
        let $scroller = this.get('scrollable');
        let $division = this.$('#standings-division-'+scrollToDivision);
        
        let divisionPosition = $division.positionRelativeTo($scroller);
        let divisionHeight = $division.outerHeight();
        let windowHeight = Ember.$(window).innerHeight();
        
        let scrollTop = divisionPosition.top - (windowHeight*0.5 - divisionHeight*0.5);
        scrollTop = Math.round(Math.max(0,Math.min(scrollTop,$scroller[0].scrollHeight)));
        
        $scroller.animate({
          scrollTop: scrollTop + 'px'
        }, 1500, 'easeOutExpo');
        
        // ------------------------- Scroll to league
        
        let $divisionScroller = Ember.$('#country-standings-div-'+scrollToDivision);
        let $league = Ember.$('#country-standings-league-'+leagueNumber);
        
        let leaguePosition = $league.positionRelativeTo($divisionScroller);
        let leagueWidth = $league.outerWidth();
        let windowWidth = $divisionScroller.innerWidth();
        
        let scrollLeft = leaguePosition.left - (windowWidth*0.5 - leagueWidth*0.5);
        scrollLeft = Math.round(Math.max(0,Math.min(scrollLeft,$divisionScroller[0].scrollWidth)));
        
        $divisionScroller.animate({
          scrollLeft: scrollLeft + 'px'
        }, 1500, 'easeOutExpo');
        
      }
      
    }
  },
  
  actions: {
    goToClub(id){
      window.location='https://www.blackoutrugby.com/game/club.lobby.php?id=' + id;
    },
    goBack(){
      let fromLeague = this.get('fromLeague');
      if(fromLeague){
        Ember.Blackout.transitionTo('leagues.league',fromLeague);
      } else {
        Ember.Blackout.transitionTo('leagues.league','me');
      }
    },
  },

  scrollable: Ember.computed('window.features.lockBody', function() {
    if(window.features.lockBody){
      return Ember.$('#nav-body');
    } else {
      return Ember.$('html, body');
    }
  }),
  
});
