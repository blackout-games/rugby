import Ember from 'ember';

/**
 * Taken from ember-i18n source
 * https://github.com/jamesarosen/ember-i18n/blob/master/addon/utils/macro.js
 * 
 * Probably really bad to do this, but the benefits of usability outweigh what I don't even know ;)
 */

const keys = Object.keys;
const get = Ember.get;

export default function translationMacro(key, interpolations = {}) {
  const dependencies = [ 'i18n.locale' ].concat(values(interpolations));
  return Ember.computed(...dependencies, function() {
    if(!this.i18n){
      this.i18n = Ember.I18n;
    }
    return Ember.I18n.t(key, mapPropertiesByHash(this, interpolations));
  });
}

function values(object) {
  return keys(object).map((key) => object[key]);
}

function mapPropertiesByHash(object, hash) {
  const result = {};

  keys(hash).forEach(function(key) {
    result[key] = get(object, hash[key]);
  });

  return result;
}