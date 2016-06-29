import Model from 'ember-data/model';
import { hasMany } from 'ember-data/relationships';
import attr from 'ember-data/attr';
import t from "rugby-ember/utils/translation-macro";
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

export default Model.extend(Validations,{
  numberId: attr(),
  username: attr(),
  password: attr(),
  newPassword: attr(),
  email: attr(),
  dateRegistered: attr(),
  lastActive: attr(),
  mainClub: attr(),
  currentClub: attr(),
  imageUrl: attr(),
  gravatarImageUrl: attr(),
  facebookImageUrl: attr(),
  facebookId: attr(),
  isPremium: attr(),
  clubs: hasMany('club'),
});