import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  age: DS.attr(),
  birthdate: DS.attr(),
  salary: DS.attr(),
  height: DS.attr(),
  weight: DS.attr(),
  form: DS.attr(),
  aggression: DS.attr(),
  discipline: DS.attr(),
  leadership: DS.attr(),
  experience: DS.attr(),
  birthRound: DS.attr(),
  birthDay: DS.attr(),
  stamina: DS.attr(),
  handling: DS.attr(),
  joined: DS.attr(),
  attack: DS.attr(),
  technique: DS.attr(),
  strength: DS.attr(),
  jumping: DS.attr(),
  speed: DS.attr(),
  agility: DS.attr(),
  kicking: DS.attr(),
  firstName: DS.attr(),
  lastName: DS.attr(),
  csr: DS.attr(),
  handed: DS.attr(),
  footed: DS.attr(),
  energy: DS.attr(),
  defence: DS.attr(),
  club: DS.belongsTo('club'),
  nationality: DS.belongsTo('country',{ async: false}),
  secondNationality: DS.belongsTo('country',{ async: false}),
  name: Ember.computed('firstName','lastName',function(){
    return `${this.get('firstName')} ${this.get('lastName')}`;
  }),
  wage: Ember.computed('salary',function(){
    //return (this.get('salary')/16).toFixed(2);
    return this.get('salary')/16;
  }),
  csrChange: DS.attr(),
});
