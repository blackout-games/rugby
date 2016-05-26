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
});

export default DS.Model.extend(Validations,{
  firstName: DS.attr(),
  lastName: DS.attr(),
  name: Ember.computed('firstName','lastName',function(){
    return `${this.get('firstName')} ${this.get('lastName')}`;
  }),
  nickname: DS.attr(),
  jersey: DS.attr('number'),
  club: DS.belongsTo('club'),
});