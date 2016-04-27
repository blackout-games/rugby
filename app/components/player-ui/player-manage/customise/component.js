import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  actions: {
    savePersonalisations(succeed,fail,final){
      
      let id = this.get('player.id');
      let model = this.get('store').peekRecord('player',id);
      
      model.patch({ nickname: true, blurb: true }).then(()=>{
        
        succeed();
        
      },fail).finally(final);
      
    },
  },
  
  personalisationsForm: Ember.computed(function(){
    
    return [
      {
        id: 'nickname',
        label: t('player.manage.nickname'),
        placeholder: t('player.manage.nickname'),
        valuePath: 'nickname',
        isPremium: true,
        bigLabel: true,
      },
      {
        id: 'blurb',
        type: 'textarea',
        label: t('player.manage.blurb'),
        placeholder: t('player.manage.blurb'),
        valuePath: 'blurb',
        isPremium: true,
        bigLabel: true,
      },
    ];
    
  }),
  
});
