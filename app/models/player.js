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
  age: DS.attr('number'),
  birthdate: DS.attr('number'),
  salary: DS.attr('number'),
  height: DS.attr('number'),
  weight: DS.attr('number'),
  form: DS.attr('number'),
  aggression: DS.attr('number'),
  discipline: DS.attr('number'),
  leadership: DS.attr('number'),
  experience: DS.attr('number'),
  joined: DS.attr('date'),
  injury: DS.attr('date'),
  birthRound: DS.attr('number'),
  birthDay: DS.attr('number'),
  stamina: DS.attr('number'),
  handling: DS.attr('number'),
  attack: DS.attr('number'),
  technique: DS.attr('number'),
  strength: DS.attr('number'),
  jumping: DS.attr('number'),
  speed: DS.attr('number'),
  agility: DS.attr('number'),
  kicking: DS.attr('number'),
  firstName: DS.attr(),
  lastName: DS.attr(),
  csr: DS.attr('number'),
  handed: DS.attr(),
  footed: DS.attr(),
  energy: DS.attr('number'),
  defence: DS.attr('number'),
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
  isInjured: Ember.computed('injury',function(){
    if(this.get('injury')){
      return this.get('injury').getTime() > Date.now();
    } else {
      return false;
    }
  }),
  birthdayRaw: Ember.computed('birthRound','birthDay',function(){
    return (parseInt(this.get('birthRound'))-1)*7 + parseInt(this.get('birthDay'));
  }),
  csrChange: DS.attr(),
});
