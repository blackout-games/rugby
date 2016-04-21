import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  price: DS.attr(),
  deadline: DS.attr(),
  views: DS.attr(),
  watchers: DS.attr(),
  listPrice: DS.attr(),
  listed: DS.attr(),
  fireIfUnsold: DS.attr(),
  linked: DS.attr(),
  minimumNextBid: DS.attr(),
  increment: DS.attr(),
  deadlinePassed: Ember.computed('deadline',function(){
    return Date.now() > new Date(this.get('deadline')).getTime();
  }),
  player: DS.belongsTo('player',{ async: false}),
  club: DS.belongsTo('club',{ async: false}),
  biddingClub: DS.belongsTo('club',{ async: false}),
});