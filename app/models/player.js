import DS from 'ember-data';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  nickname: [
    validator('length', {
      allowBlank: true,
      max: 18
    }),
  ],
  blurb: [
    validator('length', {
      allowBlank: true,
      max: 180
    }),
  ],
});

export default DS.Model.extend(Validations,{
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
  nickname: DS.attr(),
  blurb: DS.attr(),
  club: DS.belongsTo('club'),
  nationality: DS.belongsTo('country',{ async: false}),
  dualNationality: DS.belongsTo('country',{ async: false}),
  transfer: DS.belongsTo('transfer'),
  name: Ember.computed('firstName','lastName',function(){
    return `${this.get('firstName')} ${this.get('lastName')}`;
  }),
  shortName: Ember.computed('firstName','lastName',function(){
    let initial = this.get('firstName').substr(0,1);
    return `${initial} ${this.get('lastName')}`;
  }),
  wage: Ember.computed('salary',function(){
    //return (this.get('salary')/16).toFixed(2);
    return this.get('salary')/16;
  }),
  csrChange: DS.attr(),
});
