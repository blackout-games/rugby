import Ember from 'ember';

export default Ember.Component.extend({
  
  /**
   * We can disable any blocking with this
   * @type {Boolean}
   */
  active: true,
  
  /**
   * Pass a club here to cause the premium check to be run on the club rather than the current manager
   * @type {Boolean}
   */
  club: false,
  
  classNameBindings: ['classNamesIfHidden'],
  
  classNamesIfHidden: Ember.computed('classIfHidden','hideFeature',function(){
    if(this.get('hideFeature') && this.get('classIfHidden')){
      return this.get('classIfHidden');
    } else {
      return false;
    }
  }),
  
  hideFeature: Ember.computed('active','club',function(){
    if(this.get('club')){
      return this.get('active') && !this.get('session').clubIsPremium(this.get('club.id'));
    } else {
      return this.get('active') && !this.get('session.isPremium');
    }
  }),
  
  message: Ember.computed('messageT','featureName',function(){
    
    let featureName = this.get('featureName');
    let messageT = this.get('messageT');
    let i18n = this.get('i18n');
    let star = Ember.String.htmlSafe('<i class="icon-star"></i>');
    
    if(featureName){
      if(messageT){
        return i18n.t(messageT,{
          star: star,
          feature: i18n.t('featureName'),
        });
      } else {
        return i18n.t('premium.premium-feature',{
          star: star,
        });
      }
    } else {
      if(messageT){
        return i18n.t(messageT,{
          star: star,
        });
      } else {
        return i18n.t('premium.premium-feature',{
          star: star,
        });
      }
    }
    
  }),
  
});
