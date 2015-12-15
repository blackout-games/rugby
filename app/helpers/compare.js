import Ember from 'ember';

/**
 * 
 * HTMLBars comparison helper
 * 
 * --------------------------
 * 
 * Inline if:
 *   
 *   <div class="{{compare index ">" 5 "hidden"}}">
 * 
 * --------------------------
 * 
 * Inline if/else:
 *   
 *   <div class="{{compare index ">" 5 "hidden" "visible"}}">
 * 
 * --------------------------
 * 
 * Block:
 *   
 *   {{#if (compare index ">" 5)}}
 * 
 */

export function compare(options/*, hash*/) {
  
  let trueVal = true, falseVal = false;
  
  if (options.length === 5){ // Inline if/else
    
    trueVal = options[3];
    falseVal = options[4];
    
  } else if (options.length === 4){ // Inline if
    
    trueVal = options[3];
    
  } else if (options.length < 3){
    throw new Error("HTMLBars Helper 'compare' needs 3 parameters");
  }
  
  let operators = {
    '==':   function(l,r) { return l === r; },
    '===':  function(l,r) { return l === r; },
    '!=':   function(l,r) { return l !== r; },
    '<':    function(l,r) { return l < r; },
    '>':    function(l,r) { return l > r; },
    '<=':   function(l,r) { return l <= r; },
    '>=':   function(l,r) { return l >= r; },
    'typeof': function(l,r) { return typeof l === r; }
  };

  if (!operators[options[1]]){
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+options[1]);
  }

  var result = operators[options[1]](options[0],options[2]);

  if( result ) {
    return trueVal;
  } else {
    return falseVal;
  }
  
}

export default Ember.Helper.helper(compare);
