import Ember from 'ember';

export function math(params/*, hash*/) {
  
  let result;
  let operand1 = params[0],
      operator = params[1],
      operand2 = params[2];

  switch (operator) {
      case '+':
          result = operand1 + operand2;
          break;
      case '-':
          result = operand1 - operand2;
          break;
      case '*':
          result = operand1 * operand2;
          break;
      case '/':
          result = parseInt(operand2)===0 ? 0 : operand1 / operand2;
          break;
  }

  return result;
}

export default Ember.Helper.helper(math);
