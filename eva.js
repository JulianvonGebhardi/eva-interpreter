const assert = require("assert");
const Environment = require("./Environment.js");
/*
 * Eva interpreter
 */

class Eva {
  /*
   * Creates an Eva instance woth the global environment
   */
  constructor(global = new Environment()) {
    this.global = global;
  }
  /*
   * Evaluates an expression in an given environment. If env not passed, use the global scope
   */
  eval(exp, env = this.global) {
    // self evalutlating expressing. Not action needed
    if (typeof exp === "number") {
      return exp;
    }

    if (typeof exp === "string" && exp[0] === '"' && exp.slice(-1) === '"') {
      // it needs to have quotes at the beginning and the end
      // But we can just use typeof since js already has the same type but we have to make sure its in double quotes
      // edgecase might be linebrekas /n ?
      // exp = '"hello"'
      return exp.slice(1, -1); // from second to last index which is not included.
    }
    if (exp[0] === "+") {
      // since we use a external function we forward the this keyword to be able to use the recurseive eval function
      return handleOperator.apply(this, [exp, "+"]);
    }
    if (exp[0] === "-") {
      return handleOperator.apply(this, [exp, "-"]);
    }
    if (exp[0] === "*") {
      return handleOperator.apply(this, [exp, "*"]);
    }
    if (exp[0] === "/") {
      return handleOperator.apply(this, [exp, "/"]);
    }
    if (exp[0] === "var") {
      return handleVariables.apply(this, [exp, env, "expression"]);
    }
    if (isVariableName(exp)) {
      return handleVariables.apply(this, [exp, env, "access"]);
    }
    throw `Unimplemented: ${JSON.stringify(exp)}`;
  }
}

const globalVariables = new Environment({
  null: null,
  true: true,
  false: false,
  VERSION: "0.1",
});

const eva = new Eva(globalVariables);
// ----------------------------------------------
// TESTS TESTS TESTS TESTS

// MATH

// self evalutlating expression
assert.strictEqual(eva.eval(1), 1);
// evalutlating a string; The argument is a string including its quotes
assert.strictEqual(eva.eval('"hello"'), "hello");
// evalutlating the + operator
assert.strictEqual(eva.eval(["+", 1, 5]), 6);
// more complex addition
assert.strictEqual(eva.eval(["+", ["+", 3, 2], 5]), 10);
// substract
assert.strictEqual(eva.eval(["-", ["-", 3, 2], 10]), -9);
// multiplication
assert.strictEqual(eva.eval(["*", ["*", 3, 2], 7]), 42);
// division
assert.strictEqual(eva.eval(["/", ["/", 10, 2], 2]), 2.5);

// VARIABLES
assert.strictEqual(eva.eval(["var", "x", 10]), 10);
assert.strictEqual(eva.eval(["var", "checked", "true"]), true);
assert.strictEqual(eva.eval("x"), 10);

console.log("all assertions passed!");

function isVariableName(exp) {
  // regular expression: Should start with letter followed also end ($) only by any letter or number or underscore
  return typeof exp === "string" && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}

function handleOperator(exp, operator) {
  switch (operator) {
    case "+":
      return this.eval(exp[1]) + this.eval(exp[2]); // break not needed since we return directly
    case "-":
      return this.eval(exp[1]) - this.eval(exp[2]); // break not needed since we return directly
    case "*":
      return this.eval(exp[1]) * this.eval(exp[2]); // break not needed since we return directly
    case "/":
      return this.eval(exp[1]) / this.eval(exp[2]); // break not needed since we return directly
    default:
      break;
  }
}

function handleVariables(exp, env, type) {
  const [_, name, value] = exp;
  switch (type) {
    case "expression":
      // as with the operator we have to recursivly access the value
      // this is because the value could be an expression itsself which has to be interpreted before.
      return env.define(name, this.eval(value));
    case "access":
      // in case of expression the exp will be just the name of the variable we are trying to access
      return env.lookup(exp);
    default:
      break;
  }
}

// old functions
// function addition(exp) {
// the recursive calling makes sure, that all the expressions of expressions are evalulated before.
// This way we go from complex to simple expressions which in the end will be interpreted.
// return this.eval(exp[1]) + this.eval(exp[2]);
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
//   return exp[1] + exp[2];
// }
