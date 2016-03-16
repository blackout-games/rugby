import DS from 'ember-data';
import t from "../utils/translation-macro";
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  username: validator('presence', {
    presence: true,
    description: t('login.username'),
  }),
  email: [
    validator('presence', {
      presence: true,
      description: t('account.email'),
    }),
    validator('format', { type: 'email' })
  ],
});

export default DS.Model.extend(Validations,{
  numberId: DS.attr(),
  username: DS.attr(),
  password: DS.attr(),
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