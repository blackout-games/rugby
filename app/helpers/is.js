import Ember from 'ember';

const is = (params) => params[0] === params[1];

export default Ember.Helper.helper(is);

/**
 *
 *  Usage example
 * 
 *  {{#if (is item.status "complete")}}
 *    <span>OK</span>
 *  {{/if}}
 *  
 */