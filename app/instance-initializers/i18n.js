import Ember from 'ember';

/**
 * For now, ember validations expects I18n to be a global Ember object
 * New versions of i18n are presented as a service, so we link here to bridge the gap.
 * This can be removed once ember-validations updates to expect the i18n service.
 */

export function initialize( application ) {
  Ember.I18n = application.lookup('service:i18n');
}

export default {
  name: 'i81n',
  initialize: initialize
};
