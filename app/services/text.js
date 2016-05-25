import Ember from 'ember';
//import t from "rugby-ember/utils/translation-macro";

export default Ember.Service.extend({
  
  userImages: Ember.inject.service(),
  store: Ember.inject.service(),
  locale: Ember.inject.service(),
  i18n: Ember.inject.service(),
  
  parse(str){
    
    
    // Space out comma'd events like team training, now that we have space.
    str = str.replace(/>,</g,'>, <');
    
    // Store components here
    let components = Ember.Object.create();
    
    
    // -------------------------------------------- Member
    
    
    str = str.replace(/<member id=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'manager_'+id;
      
      components.set(componentId,{
        name: 'manager-link',
        hash: {
          managerId: id,
          inline: true,
          defaultColor: 'light',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- Club
    
    
    str = str.replace(/<(?:team|club) id=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'club_'+id;
      
      components.set(componentId,{
        name: 'club-link',
        hash: {
          clubId: id,
          inline: true,
          defaultColor: 'light',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- National Team
    
    
    str = str.replace(/<natteam id=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'nat_club_'+id;
      
      components.set(componentId,{
        name: 'club-link',
        hash: {
          clubId: id,
          inline: true,
          nat: true,
          defaultColor: 'light',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- U20 Team
    
    
    str = str.replace(/<u20team id=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'u20_club_'+id;
      
      components.set(componentId,{
        name: 'club-link',
        hash: {
          clubId: id,
          inline: true,
          u20: true,
          defaultColor: 'light',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- Player
    
    
    str = str.replace(/<player id=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'player_'+id;
      
      components.set(componentId,{
        name: 'item-link',
        hash: {
          itemId: id,
          type: 'player',
          iconClass: 'icon-logo icon-md',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- Youth Player
    
    
    str = str.replace(/<youthplayer id=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'player_'+id;
      
      components.set(componentId,{
        name: 'item-link',
        hash: {
          itemId: id,
          type: 'youth-player',
          iconClass: 'icon-logo icon-md',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- Country
    
    
    str = str.replace(/<country iso=([A-Z][A-Z]) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'country_'+id;
      
      components.set(componentId,{
        name: 'item-link',
        hash: {
          itemId: id,
          type: 'country',
          iconClass: 'icon-flag-filled icon-md',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- Country Label
    
    
    str = str.replace(/<countrylabel iso=([A-Z][A-Z]) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'country_label_'+id;
      
      components.set(componentId,{
        name: 'item-ui',
        hash: {
          itemId: id,
          type: 'country',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- Competition
    
    
    str = str.replace(/<comp type=(\w+) ?\/>/gi,(fullMatch, id)=>{
      
      id = id.toLowerCase();
      
      // Abnormal competition i18n keys
      // (differing from competition name used in fixtures tables)
      let index = {
        bronzefinal: 'bronze-final',
        semifinal: 'semi-final',
        thursdayfriendly: 'thursday-friendly',
        u20international: 'u20-international',
        u20qualifier: 'u20-qualifier',
        u20worldcup: 'u20-world-cup',
        worldcup: 'world-cup',
      };
      
      if(index[id]){
        id = index[id];
      }
      
      return this.get('locale').htmlT('competitions.'+id);
      
    });
    
    
    // -------------------------------------------- Skill
    
    
    str = str.replace(/<skill type=(\w+) ?\/>/gi,(fullMatch, id)=>{
      
      id = id.toLowerCase();
      
      // Abnormal i18n keys
      let index = {
        defense: 'defence',
      };
      
      if(index[id]){
        id = index[id];
      }
      
      return this.get('locale').htmlT('player.'+id);
      
    });
    
    
    // -------------------------------------------- Content
    
    
    str = str.replace(/<content id=(.+?)(?: abbr=([0-9]))? ?\/>/gi,(fullMatch, id/*,abbr*/)=>{
      
      id = id.toLowerCase();
      
      // Abnormal i18n keys
      let index = {
        'skill - stamina': 'player.attack',
        'skill - handling': 'player.handling',
        'skill - attack': 'player.attack',
        'skill - defense': 'player.defence',
        'skill - technique': 'player.technique',
        'skill - strength': 'player.strength',
        'skill - jumping': 'player.jumping',
        'skill - speed': 'player.speed',
        'skill - agility': 'player.agility',
        'skill - kicking': 'player.kicking',
        'stamina': 'player.attack',
        'handling': 'player.handling',
        'attack': 'player.attack',
        'defense': 'player.defence',
        'technique': 'player.technique',
        'strength': 'player.strength',
        'jumping': 'player.jumping',
        'speed': 'player.speed',
        'agility': 'player.agility',
        'kicking': 'player.kicking',
        'fitness': 'player.fitness',
        'national': 'competitions.national',
        'u20': 'competitions.u20',
        'coach': 'staff.coach',
        'youth coach': 'staff.youth-coach',
        'youth scout': 'staff.youth-scout',
        'youth manager': 'staff.youth-manager',
        'training': 'facilities.training',
        'youth training': 'facilities.youth-training',
        'reporting - abuse': 'reporting.abuse',
        'reporting - tm abuse': 'reporting.transfer-market-abuse',
        'standing': 'stadium.standing',
        'uncovered': 'stadium.uncovered',
        'covered': 'stadium.covered',
        'corporate': 'stadium.corporate',
        'cleaning': 'stadium.cleaning',
        'maintenance': 'stadium.maintenance',
        'security': 'stadium.security',
        'hospitality': 'stadium.hospitality',
        'entertainment': 'stadium.entertainment',
        'under 20': 'selections.under-20',
        'journalist': 'elections.journalist',
        'Plural Character': 'language.plural-character',
        'have (e.g. 5 members have left the club)': 'language.have-(we-have-won)',
        'has (e.g. 1 member has left the club)': 'language.has-(he-has-won)',
        'week': 'language.plurals.week',
        'weeks': 'language.plurals.weeks',
        'day': 'language.plurals.day',
        'days': 'language.plurals.days',
        'star': 'language.plurals.star',
        'stars': 'language.plurals.stars',
        'employee': 'language.plurals.employee',
        'employees': 'language.plurals.employees',
        'member': 'language.plurals.member',
        'members': 'language.plurals.members',
        'profit (e.g. a profit of $10)': 'language.profit-(of-$1)',
        'loss (e.g. a loss of -$10)': 'language.loss-(of-$1)',
      };
      
      if(index[id]){
        id = index[id];
      }
      
      return this.get('locale').htmlT(id);
      
    });
    
    
    // -------------------------------------------- Election
    
    
    str = str.replace(/<election id=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      let componentId = 'election_'+id;
      
      components.set(componentId,{
        name: 'item-link',
        hash: {
          itemId: id,
          type: 'election',
          iconClass: 'icon-flag-filled icon-md',
        }
      });
      
      return `{{${componentId}}}`;
      
    });
    
    
    // -------------------------------------------- Rank
    
    
    str = str.replace(/<rank value=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      return id;
      
    });
    
    
    // -------------------------------------------- Ordinal suffix
    
    
    str = str.replace(/<number value=([0-9]+) ?\/>/gi,(fullMatch, id)=>{
      
      return String(id) + this.getOrdinalSuffix(id);
      
    });
    
    
    // -------------------------------------------- Date
    
    
    str = str.replace(/<date ts=([\w \-]+?)(?: format=([\w :-]+?))? ?\/>/gi,(fullMatch, ts, format)=>{
      
      // Convert php date format to moment
      format = this.convertPHPToMomentFormat(format);
      return moment(ts*1000).format(format);
      
    });
    
    
    // -------------------------------------------- i18n keys
    
    
    str = str.replace(/<date ts=([\w \-]+?)(?: format=([\w :-]+?))? ?\/>/gi,(fullMatch, ts, format)=>{
      
      // Convert php date format to moment
      format = this.convertPHPToMomentFormat(format);
      return moment(ts*1000).format(format);
      
    });
    
    
    // -------------------------------------------- End
    
    
    
    
    return { str: str, components: components };
    
  },
  
  suffixes: Ember.computed('locale.currentLocale',function(){
    return {
      th: this.get('i18n').t('number.suffix-(th)'),
      st: this.get('i18n').t('number.suffix-(st)'),
      nd: this.get('i18n').t('number.suffix-(nd)'),
      rd: this.get('i18n').t('number.suffix-(rd)'),
    };
  }),
  
  getOrdinalSuffix(num){
    
    // Special rules for french orginal numbers
    if(this.get('locale').getCurrent() === 'fr'){
      
      return num === 1 ? "er" : "e";
      
    } else {
      
      let str = String(num);
      if(str.length>=2){
        let sub = str.substr(str.length-2);
        if(sub === '11' || sub === '12' || sub === '13'){
          return this.get('suffixes.th');
        }
      }
      
      let lastNum = str.substr(str.length-1);
      if(lastNum === '1'){
        return this.get('suffixes.st');
      } else if(lastNum === '2'){
        return this.get('suffixes.nd');
      } else if(lastNum === '3'){
        return this.get('suffixes.rd');
      } else {
        return this.get('suffixes.th');
      }
      
    }
    
  },
  
  
  convertPHPToMomentFormat(format){
    
    let replacements = {
        d: 'DD',
        D: 'ddd',
        j: 'D',
        l: 'dddd',
        N: 'E',
        S: 'o',
        w: 'e',
        z: 'DDD',
        W: 'W',
        F: 'MMMM',
        m: 'MM',
        M: 'MMM',
        n: 'M',
        t: '', // no equivalent
        L: '', // no equivalent
        o: 'YYYY',
        Y: 'YYYY',
        y: 'YY',
        a: 'a',
        A: 'A',
        B: '', // no equivalent
        g: 'h',
        G: 'H',
        h: 'hh',
        H: 'HH',
        i: 'mm',
        s: 'ss',
        u: 'SSS',
        e: 'zz', // deprecated since version 1.6.0 of moment.js
        I: '', // no equivalent
        O: '', // no equivalent
        P: '', // no equivalent
        T: '', // no equivalent
        Z: '', // no equivalent
        c: '', // no equivalent
        r: '', // no equivalent
        U: 'X',
    };
    
    return format.strtr(replacements);
    
  },
  
  
});
