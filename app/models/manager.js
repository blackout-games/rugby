import DS from 'ember-data';

export default DS.Model.extend({
  numberId: DS.attr(),
  username: DS.attr(),
  email: DS.attr(),
  dateRegistered: DS.attr(),
  lastActive: DS.attr(),
  mainClub: DS.attr(),
  currentClub: DS.attr(),
  imageUrl: DS.attr(),
  facebookId: DS.attr(),
  clubs: DS.hasMany('club'),
});