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
   * We overwrite the standard eval function. We could also name it otherwise
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
    // since we use a external function we forward the this keyword to be able to use the recurseive eval function
    if (exp[0] === "+") {
      return handleOperator.apply(this, [exp, env, "+"]);
    }
    if (exp[0] === "-") {
      return handleOperator.apply(this, [exp, env, "-"]);
    }
    if (exp[0] === "*") {
      return handleOperator.apply(this, [exp, env, "*"]);
    }
    if (exp[0] === "/") {
      return handleOperator.apply(this, [exp, env, "/"]);
    }
    // Block: sequence of expression
    if (exp[0] === "begin") {
      // create environment depending on where we run the code.
      // If run in the global scope, env (parent) will be global scope
      // and if run in nested scope, env will be nested scope
      const blockEnv = new Environment({}, env);
      return this._evalBlock(exp, blockEnv);
    }
    // variable declaration (var foo 8)
    if (exp[0] === "var") {
      return handleVariables.apply(this, [exp, env, "expression"]);
    }
    if (isVariableName(exp)) {
      return handleVariables.apply(this, [exp, env, "access"]);
    }
    throw `Unimplemented: ${JSON.stringify(exp)}`;
  }

  _evalBlock(blockExpression, blockEnv) {
    let result;
    // Example: block (statement) = ['begin', ['+', '2', '2'], ['*', '4', '2']]
    // _tag === 'begin' // true
    // expressions === [['+', '2', '2'], ['*', '4', '2']]
    const [_tag, ...expressions] = blockExpression;
    expressions.forEach((exp) => {
      result = this.eval(exp, blockEnv);
    });
    // by this, will always return the last result in a function
    return result;
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

// BLOCKS:
assert.strictEqual(
  // create x and y within a blick and make a calculation
  eva.eval(
    ["begin", ["var", "x", 10], ["var", "y", 20], ["+", ["*", "x", "y"], 30]],
  ),
  230,
);

assert.strictEqual(
  // check differensation if inner and outer scope. X should not be overwritten
  eva.eval(
    ["begin", ["var", "x", 10], ["begin", ["var", "x", 20], "x"], "x"],
  ),
  10,
);

assert.strictEqual(
  // access to outer scope
  eva.eval(
    ["begin", ["var", "value", 10], ["var", "result", ["begin", ["var", "x", [
      "+",
      "value",
      10,
    ]], "x"]], "result"],
  ),
  20,
);

console.log("all assertions passed!");

function isVariableName(exp) {
  // regular expression: Should start with letter followed also end ($) only by any letter or number or underscore
  return typeof exp === "string" && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}

function handleOperator(exp, env, operator) {
  switch (operator) {
    case "+":
      return this.eval(exp[1], env) + this.eval(exp[2], env); // break not needed since we return directly
    case "-":
      return this.eval(exp[1], env) - this.eval(exp[2], env); // break not needed since we return directly
    case "*":
      return this.eval(exp[1], env) * this.eval(exp[2], env); // break not needed since we return directly
    case "/":
      return this.eval(exp[1], env) / this.eval(exp[2], env); // break not needed since we return directly
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
      return env.define(name, this.eval(value, env));
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
