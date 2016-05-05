import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";

export default Ember.Component.extend({
  preferences: Ember.inject.service(),
  
  onInit: Ember.on('init',function(){
    
    // Check session
    let sort = this.get('cache.squadSort');
    if(sort){
      this.updateSort(sort,true);
    } else {
      let sortBy = this.get('preferences').getPref('squadSortBy', {camelize:true});
      this.updateSort(this.get('sorts').findBy('value',sortBy),true);
    }
    
    // Check session
    let sortOrder = this.get('cache.squadSortOrder');
    if(sortOrder){
      this.updateSortOrder(sortOrder,true);
    } else {
      let order = this.get('preferences').getPref('squadSortOrder', {lowercase:true});
      this.updateSortOrder(order,true);
    }
    
  }),
  
  sortOrderIcon: Ember.computed('currentSortOrder',function(){
    return this.get('currentSortOrder')==='asc' ? 'up' : 'down';
  }),
  
  sorts: [
    
    /**
     * General attributes
     */
    
    {
      label: t('player.first-name'),
      value: 'firstName',
    },
    {
      label: t('player.last-name'),
      value: 'lastName',
    },
    {
      label: t('player.csr'),
      value: 'csr',
    },
    {
      label: t('player.age'),
      value: 'birthdate',
    },
    {
      label: t('player.birthday'),
      value: 'birthdayRaw',
    },
    {
      label: t('player.salary'),
      value: 'salary',
    },
    {
      label: t('player.weight'),
      value: 'weight',
    },
    {
      label: t('player.height'),
      value: 'height',
    },
    
    /**
     * Changeables
     */
    
    {
      label: t('player.form'),
      value: 'form',
    },
    {
      label: t('player.energy'),
      value: 'energy',
    },
    
    /**
     * Traits
     */
    
    {
      label: t('player.aggression'),
      value: 'aggression',
    },
    {
      label: t('player.discipline'),
      value: 'discipline',
    },
    {
      label: t('player.leadership'),
      value: 'leadership',
    },
    {
      label: t('player.experience'),
      value: 'experience',
    },
    
    /**
     * Skills
     */
    
    {
      label: t('player.stamina'),
      value: 'stamina',
    },
    {
      label: t('player.handling'),
      value: 'handling',
    },
    {
      label: t('player.attack'),
      value: 'attack',
    },
    {
      label: t('player.defence'),
      value: 'defence',
    },
    {
      label: t('player.technique'),
      value: 'technique',
    },
    {
      label: t('player.strength'),
      value: 'strength',
    },
    {
      label: t('player.jumping'),
      value: 'jumping',
    },
    {
      label: t('player.speed'),
      value: 'speed',
    },
    {
      label: t('player.agility'),
      value: 'agility',
    },
    {
      label: t('player.kicking'),
      value: 'kicking',
    },
    
    /**
     * Devs
     */
    
    {
      label: t('player.player-id'),
      value: 'id',
    },
    
  ],
  
  squadSorting: Ember.computed('currentSort','currentSortOrder',function(){
    
    let sorting;
    let sort = this.get('currentSort.value');
    
    if(sort === 'birthdate'){
      
      let order = this.get('currentSortOrder');
      order = order === 'asc' ? 'desc' : 'asc';
      sorting = [`${sort}:${order}`];
      
    } else {
      sorting = [`${sort}:${this.get('currentSortOrder')}`];
    }
    
    // Store in session for use in squad route
    this.set('cache.squadSorting',sorting);
    return sorting;
    
  }),
  
  playersSorted: Ember.computed.sort('players','squadSorting'),
  
  actions: {
    changeSort(sort){
      this.updateSort(sort);
    },
    toggleSortOrder(){
      if(this.get('currentSortOrder')==='asc'){
        this.updateSortOrder('desc');
      } else {
        this.updateSortOrder('asc');
      }
    },
  },
  
  updateSortOrder(order,initting){
    
    // If initting, or on player page
    if(initting){
    
      this.set('currentSortOrder',order);
      
      // Store in session for retrieval later
      this.set('cache.squadSortOrder',order);
      
    } else {
      
      Ember.Blackout.startLoading();
      
      Ember.run.later(()=>{
        
        this.set('currentSortOrder',order);
        
        // Store in session for retrieval later
        this.set('cache.squadSortOrder',order);
        
        Ember.Blackout.stopLoading(true);
        
      },111);
      
    }
    
  },
  
  updateSort(sort,initting){
    
    // If initting, or on player page
    if(initting || this.get('currentPlayer')){
      
      this.set('currentSort',sort);
      
      // Store in session for retrieval later
      this.set('cache.squadSort',sort);
      
    } else {
      
      Ember.Blackout.startLoading();
      
      Ember.run.later(()=>{
        
        this.set('currentSort',sort);
        
        // Store in session for retrieval later
        this.set('cache.squadSort',sort);
        
        Ember.Blackout.stopLoading(true);
        
      },111);
      
    }
    
  },
  
});
