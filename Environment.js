/*
 * Environment
 */

class Environment {
  /*
   * Creates an environment with the given recod
   * takes main (record) env and a parent env to construct the object / class instance
   */
  constructor(record = {}, parent = null) {
    this.record = record;
    this.parent = parent;
  }
  /*
   * Creates a variable with the given name and value.
   */
  define(name, value) {
    this.record[name] = value;
    return value;
  }
  lookup(name) {
    // OLD WAY BEFORE IMPLEMENTING RESOLVE
    // if (this.record.hasOwnProperty(name)) return this.record[name];
    // throw new ReferenceError(`Variable ${name} is not defined`);
    // NEW WAY
    return this.resolve(name).record[name];
  }
  /*
   * Returns specific environment in which a variable is defined, or throws if a variable is not defined
   */
  resolve(name) {
    // check if the variable exists in the current scope
    if (this.record.hasOwnProperty(name)) {
      return this;
    }
    // throw error if there is no further environment to check
    if (this.parent == null) {
      throw new ReferenceError(`Variable "${name} is not defined`);
    }
    // check the parent environment by recursivly calling resolving it
    return this.parent.resolve(name);
  }
}

module.exports = Environment;
