import DS from 'ember-data';

export default DS.Model.extend({
  numberId: DS.attr(), // Used for username based requests
  username: DS.attr(),
  realname: DS.attr(),
  email: DS.attr(),
  facebookId: DS.attr(),
  imageUrl: DS.attr(),
  mainClub: DS.attr(),
  currentClub: DS.attr(),
  clubs: DS.hasMany('club'),
});
