'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3;

var _uuidV = require('uuid-v4');

var _uuidV2 = _interopRequireDefault(_uuidV);

var _lodash = require('lodash.camelcase');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.isfunction');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.isempty');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.result');

var _lodash8 = _interopRequireDefault(_lodash7);

var _mobx = require('mobx');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

// Throw an error when a URL is needed, and none is supplied.
var urlError = function urlError() {
  throw new Error('A url" property or function must be specified');
};

var Model = (_class = function () {
  function Model() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { collection: null, initialState: {}, children: {} };

    _classCallCheck(this, Model);

    this.id = null;
    this.type = '';

    _initDefineProp(this, 'fetching', _descriptor, this);

    _initDefineProp(this, 'saving', _descriptor2, this);

    _initDefineProp(this, 'deleting', _descriptor3, this);

    this.uuid = (0, _uuidV2.default)();
    this.collection = options.collection;
    this.attributes = (0, _mobx.observable)((0, _mobx.asMap)({}));
    this.relationships = (0, _mobx.observable)((0, _mobx.asMap)({}));
    this.fetching = true;
    this.saving = false;
    this.deleting = false;

    // Assign any related stores
    if (!(0, _lodash6.default)(options.related)) {
      Object.keys(options.related).forEach(function (key) {
        if (options.related[key]) {
          // Store reference to child
          _this[key] = options.related[key];
          // Store reference back to this on child
          options.related[key][(0, _lodash2.default)(_this.constructor.name)] = _this;
        }
      });
    }

    if (options.initialState) {
      this.set(options.initialState);
    }
  }

  /**
   * The model URL
   */

  /**
   * unique id of this model, immutable.
   */


  _createClass(Model, [{
    key: 'url',
    value: function url() {
      // Get the base URL specified as urlRoot or in the collection:
      var base = this.urlRoot || (0, _lodash8.default)(this.collection, 'url') || urlError();

      if (this.isNew) {
        return base;
      }

      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    }

    /**
     * Returns the unique identifier of the model.
     * Returns either the server id or fall back to client uuid.
     */

  }, {
    key: 'getAttribute',


    /**
     * Get an attribute value with the given key
     */
    value: function getAttribute(key) {
      return this.attributes.get(key);
    }

    /**
     * Get an relationship object with the given key
     */

  }, {
    key: 'getRelationship',
    value: function getRelationship(key) {
      return this.relationships.get(key);
    }

    /**
     * Controls boolean value of request label
     */

  }, {
    key: 'setRequestLabel',
    value: function setRequestLabel(label) {
      var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this[label] = state;
    }

    /**
     * Sets the attributes data via merge
     */

  }, {
    key: 'setAttributes',
    value: function setAttributes() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.attributes.merge(data);
    }

    /**
     * Sets a single attribute via merge
     */

  }, {
    key: 'setAttribute',
    value: function setAttribute(key, value) {
      this.attributes.merge(_defineProperty({}, key, value));
    }

    /**
     * Clears the models attributes
     */

  }, {
    key: 'clearAttributes',
    value: function clearAttributes() {
      this.attributes.clear();
    }

    /**
     * Sets the relationships data via merge
     */

  }, {
    key: 'setRelationships',
    value: function setRelationships() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.relationships.merge(data);
    }

    /**
     * Updates the ID on a to-one relationship
     */

  }, {
    key: 'setToOneRelationship',
    value: function setToOneRelationship(key, id, type) {
      // No op on to-many relationship
      if (this.relationships.get(key) && Array.isArray((0, _mobx.toJS)(this.relationships.get(key).data))) return;

      // If realtionship exists update it. Otherwise create it.
      if (this.relationships.get(key)) {
        this.relationships.merge(_defineProperty({}, key, Object.assign({}, {
          data: {
            type: type ? type : this.relationships.get(key).data.type,
            id: id
          }
        })));
      } else {
        this.setRelationships(_defineProperty({}, key, {
          data: {
            id: id,
            type: type
          }
        }));
      }
    }

    /**
     * Clears the models relationships
     */

  }, {
    key: 'clearRelationships',
    value: function clearRelationships() {
      this.relationships.clear();
    }

    /**
     * Handles full JSON payload and sets data accordingly.
     */

  }, {
    key: 'set',
    value: function set(response) {
      var newData = void 0;

      // Handle both wrapped and unwrapped response.
      if (response.data) {
        newData = response.data;
      } else {
        newData = response;
      }

      if (this.isNew) {
        this.id = newData.id || null;
      }

      if (newData.attributes) this.setAttributes(newData.attributes);
      if (newData.relationships) this.setRelationships(newData.relationships);

      if (response.included && response.included.length) {
        this.setIncluded(response.included);
      }
    }

    /**
     * Sets the included into any related collections.
     * Override this in the extending class
     */

  }, {
    key: 'setIncluded',
    value: function setIncluded() {
      var included = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return true;
    }

    /**
     * Fetch the model from the server.
     */

  }, {
    key: 'fetch',
    value: function fetch() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.setRequestLabel('fetching', true);

      var url = options.url ? options.url : this.url();

      return new Promise(function (resolve, reject) {
        _axios2.default.get(url, {
          params: options.params ? options.params : {}
        }).then(function (response) {
          _this2.set(response.data);
          _this2.setRequestLabel('fetching', false);
          resolve(_this2, response);
        }).catch(function (error) {
          _this2.setRequestLabel('fetching', false);
          reject(error);
        });
      });
    }

    /**
     * Save the model to the server via a PATCH request.
     * If the model is new delegates to the create action.
     * If the `wait` option is false it will optimistically 
     * update the atributes and relationships passed
     */

  }, {
    key: 'save',
    value: function save() {
      var _this3 = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { wait: false };

      var originalAttributes = this.attributes.toJS();
      var originalRelationships = (0, _mobx.toJS)(this.relationships);
      var resourceObject = {};

      // If the model does not have an ID. Send a POST request
      if (this.isNew) {
        return this.create(data, options);
      } else {
        resourceObject.data = {
          id: this.id,
          type: this.type
        };
      }

      if (data === null) {
        resourceObject.data.attributes = Object.assign({}, originalAttributes);
        resourceObject.data.relationships = Object.assign({}, originalRelationships);
      } else {
        if (data.attributes) {
          resourceObject.data.attributes = Object.assign({}, data.attributes);
        }

        if (data.relationships) {
          resourceObject.data.relationships = Object.assign({}, data.relationships);
        }
      }

      if (options.wait) {
        this.setRequestLabel('saving', true);
      } else {
        if (data && data.attributes) {
          this.setAttributes(data.attributes);
        }

        if (data && data.relationships) {
          this.setRelationships(data.relationships);
        }
      }

      return new Promise(function (resolve, reject) {
        _axios2.default.patch(_this3.url(), resourceObject).then(function (response) {
          _this3.set(response.data);
          _this3.setRequestLabel('saving', false);
          resolve(_this3, response);
        }).catch(function (error) {
          if (!options.wait) {
            _this3.setAttributes(originalAttributes);
            _this3.setRelationships(originalRelationships);
          }

          _this3.setRequestLabel('saving', false);

          reject(error);
        });
      });
    }

    /**
     * Allows for attributes to not have to be wrapped when saving.
     */

  }, {
    key: 'saveAttributes',
    value: function saveAttributes(attributes, options) {
      return this.save({
        attributes: attributes
      }, options);
    }

    /**
     * Create a new model to the server with  a POST request.
     * If the `wait` option is false it will optimistically 
     * update the attributes and relationships passed in.
     */

  }, {
    key: 'create',
    value: function create() {
      var _this4 = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { wait: false };

      var originalAttributes = this.attributes.toJS();
      var originalRelationships = (0, _mobx.toJS)(this.relationships);
      var resourceObject = {
        data: {
          type: this.type
        }
      };

      if (data && data.attributes) {
        resourceObject.data.attributes = Object.assign({}, originalAttributes, data.attributes);
      } else {
        resourceObject.data.attributes = Object.assign({}, originalAttributes);
      }

      if (data && data.relationships) {
        resourceObject.data.relationships = Object.assign({}, originalRelationships, data.relationships);
      } else {
        resourceObject.data.relationships = Object.assign({}, originalRelationships);
      }

      if (!options.wait) {
        if (data && data.attributes) {
          this.setAttributes(data.attributes);
        }

        if (data && data.relationships) {
          this.setRelationships(data.relationships);
        }
      } else {
        this.setRequestLabel('saving', true);
      }

      return new Promise(function (resolve, reject) {
        _axios2.default.post(options.url ? options.url : _this4.url(), resourceObject).then(function (response) {
          _this4.set(response.data);
          _this4.setRequestLabel('saving', false);
          resolve(_this4, response);
        }).catch(function (error) {
          if (!options.wait) {
            _this4.setAttributes(originalAttributes);
            _this4.setRelationships(originalRelationships);
          }

          _this4.setRequestLabel('saving', false);
          reject(error);
        });
      });
    }

    /**
     * Destroy this model on the server if it was already persisted.
     * Optimistically removes the model from its collection, if it has one.
     * If `wait: true` is passed, waits for the server to respond before removal.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      var _this5 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { wait: false };

      if (this.isNew && this.collection) {
        this.collection.remove(this);

        return true;
      }

      if (!options.wait && this.collection) {
        this.collection.remove(this);
      } else {
        this.setRequestLabel('deleting', true);
      }

      return new Promise(function (resolve, reject) {
        _axios2.default.delete(_this5.url()).then(function (response) {
          if (options.wait && _this5.collection) {
            _this5.collection.remove(_this5);
          }

          _this5.setRequestLabel('deleting', false);

          resolve(_this5, response);
        }).catch(function (error) {
          // Put it back if delete request fails
          if (!options.wait && _this5.collection) {
            _this5.collection.add(_this5);
          }

          _this5.setRequestLabel('deleting', false);

          reject(error);
        });
      });
    }
  }, {
    key: 'uniqueId',
    get: function get() {
      return this.id ? this.id : this.uuid;
    }

    /**
     * Getter to check if a model is yet to be saved to the server
     */

  }, {
    key: 'isNew',
    get: function get() {
      return this.id == null;
    }
  }]);

  return Model;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'fetching', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'saving', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'deleting', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class.prototype, 'setRequestLabel', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setRequestLabel'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setAttributes', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setAttributes'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setAttribute', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setAttribute'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'clearAttributes', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'clearAttributes'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setRelationships', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setRelationships'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setToOneRelationship', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setToOneRelationship'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'clearRelationships', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'clearRelationships'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'set', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'set'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setIncluded', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setIncluded'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'fetch', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'fetch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'save', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'save'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'saveAttributes', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'saveAttributes'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'create', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'create'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'destroy', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'destroy'), _class.prototype)), _class);
exports.default = Model;