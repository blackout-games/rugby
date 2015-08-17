import DS from 'ember-data';

export default DS.Model.extend({
  username: DS.attr(),
  realname: DS.attr(),
  email: DS.attr(),
  facebookId: DS.attr(),
  mainClub: DS.attr(),
  currentClub: DS.attr(),
  clubs: DS.hasMany('club'),
});
