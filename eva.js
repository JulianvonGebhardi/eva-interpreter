const assert = require("assert");
/*
 * Eva interpreter
 */

class Eva {
  eval(exp) {
    // self evalutlating expressing. Not action needed
    if (isNumber(exp)) {
      return exp;
    }

    if (isString(exp)) {
      // it needs to have quotes at the beginning and the end
      // But we can just use typeof since js already has the same type but we have to make sure its in double quotes
      // edgecase might be linebrekas /n ?
      // exp = '"hello"'
      return exp.slice(1, -1); // from second to last index which is not included.
    }
    if (exp[0] === "+") {
      // since we use a external function we forward the this keyword to be able to use the recurseive eval function
      return addition.apply(this, [exp]);
    }
    throw "unimplemented";
  }
}

// ----------------------------------------------
// Tests:

const eva = new Eva();
// self evalutlating expression
assert.strictEqual(eva.eval(1), 1);
// evalutlating a string; The argument is a string including its quotes
assert.strictEqual(eva.eval('"hello"'), "hello");
// evalutlating the + operator
assert.strictEqual(eva.eval(["+", 1, 5]), 6);
// more complex addition
assert.strictEqual(eva.eval(["+", ["+", 3, 2], 5]), 10);

console.log("all assertions passed!");

function isNumber(exp) {
  return typeof exp === "number";
}

function isString(exp) {
  // exp = "hello" // true
  // exp = 'hello' || hello // false
  // slice(-1) indicates: Start at the last index and to the end (since no value). But since its the end it will only return the last letter of a string
  return typeof exp === "string" && exp[0] === '"' && exp.slice(-1) === '"';
}

function addition(exp) {
  // the recursive calling makes sure, that all the expressions of expressions are evalulated before.
  // This way we go from complex to simple expressions which in the end will be interpreted.
  return this.eval(exp[1]) + this.eval(exp[2]);
  // This was my own first approach. Problem here, the recursive logic would only work for addition
  // The ideal solution integrates this concept in the main logic
  // if the operants are not a number, evalutlate them as well by calling the same function recursive
  // if (typeof exp[1] !== "number") {
  //   exp[1] = addition(exp[1]);
  // }
  //
  // if (typeof exp[2] !== "number") {
  //   exp[2] = addition(exp[2]);
  // }
  // but how to get the update values in the final expression and make it work for a unknown number of arugments
  // by updating the actual array (exp) which holds the values
  return exp[1] + exp[2];
}
