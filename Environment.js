/*
 * Environment
 */

class Environment {
  /*
   * Creates an environment with the given recod
   */
  constructor(record = {}) {
    this.record = record;
  }
  /*
   * Creates a variabke with the given name and value.
   */
  define(name, value) {
    this.record[name] = value;
    return value;
  }
  lookup(name) {
    if (this.record.hasOwnProperty(name)) return this.record[name];
    throw new ReferenceError(`Variable ${name} is not defined`);
  }
}

module.exports = Environment;
