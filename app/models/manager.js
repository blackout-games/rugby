import DS from 'ember-data';
import t from "../utils/translation-macro";
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  username: validator('presence', {
    presence: true,
    description: t('login.username'),
  }),
  password: validator('presence', {
    presence: true,
    description: t('login.password'),
  }),
  email: [
    validator('presence', {
      presence: true,
      description: t('account.email'),
    }),
    validator('format', { type: 'email' })
  ],
  newPassword: [
    validator('length', {
      allowBlank: true,
      min: 5
    }),
  ],
});

export default DS.Model.extend(Validations,{
  numberId: DS.attr(),
  username: DS.attr(),
  password: DS.attr(),
  newPassword: DS.attr(),
  email: DS.attr(),
  dateRegistered: DS.attr(),
  lastActive: DS.attr(),
  mainClub: DS.attr(),
  currentClub: DS.attr(),
  imageUrl: DS.attr(),
  gravatarImageUrl: DS.attr(),
  facebookImageUrl: DS.attr(),
  facebookId: DS.attr(),
  clubs: DS.hasMany('club'),
});