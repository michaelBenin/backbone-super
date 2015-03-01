(function (root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone'], function (_, Backbone) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      factory(_, Backbone);
    });

    // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined' && typeof require === 'function') {
    var _ = require('underscore'),
      Backbone = require('backbone');
    factory(_, Backbone);

    // Finally, as a browser global.
  } else {
    factory(root._, root.Backbone);
  }

}(this, function factory(_, Backbone) {

  // Borrowed from https://www.npmjs.com/package/extend-with-super
  function makeSuper(sourceProp, objProp) {
    return function () {
      this._super = objProp;
      return sourceProp.apply(this, Array.prototype.slice.call(arguments));
    };
  }

  // Borrowed from https://www.npmjs.com/package/extend-with-super
  function extendWithSuper() {

    var obj = arguments[0];

    if (!obj) {
      return false;
    }

    if (!_.isObject(obj)) {
      return obj;
    }

    var source;
    var prop;
    var length = arguments.length;

    // Do we want X browser compatibility here?
    // Would rather use Object.keys
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    for (var i = 1; i < length; i++) {

      source = arguments[i];

      if (_.isObject(source)) {

        for (prop in source) {

          if (Object.hasOwnProperty.call(source, prop)) {

            if (_.isFunction(source[prop]) && _.isFunction(obj[prop])) {
              obj[prop] = makeSuper(source[prop], obj[prop]);
              obj[prop].prototype = source[prop].prototype;
            } else {
              obj[prop] = source[prop];
            }
          }
        }
      }
    }
    return obj;
  }

  // Backbone's original extend method except swapped out extend
  // for extend-with-super

  // class properties to be extended.
  function extend(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function () {
        return parent.apply(this, arguments);
      };
    }

    // Add static properties to the constructor function, if supplied.
    extendWithSuper(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function () {
      this.constructor = child;
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) extendWithSuper(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    child.extend = extend;

    return child;
  }

  // Set up inheritance for the model, collection, router, view and history.
  Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = Backbone.History.extend = extend;

  return extend;

}));
