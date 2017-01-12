'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class, _descriptor, _descriptor2;

var _lodash = require('lodash.camelcase');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.last');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.isempty');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.difference');

var _lodash8 = _interopRequireDefault(_lodash7);

var _mobx = require('mobx');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _Model = require('./Model');

var _Model2 = _interopRequireDefault(_Model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Collection = (_class = function () {
  function Collection() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { parent: null, initialState: {}, children: {} };

    _classCallCheck(this, Collection);

    this.id = null;

    _initDefineProp(this, 'fetching', _descriptor, this);

    _initDefineProp(this, 'saving', _descriptor2, this);

    this.parent = options.parent;
    this.meta = (0, _mobx.observable)((0, _mobx.asMap)({}));
    this.links = (0, _mobx.observable)((0, _mobx.asMap)({}));
    this.models = (0, _mobx.observable)([]);

    this.fetching = false;
    this.saving = false;

    // Assign any related stores
    if (!(0, _lodash6.default)(options.related)) {
      Object.keys(options.related).forEach(function (key) {
        if (options.related[key]) {
          // Store reference to child
          _this[key] = options.related[key];
          // Store reference to this on child as 'parent' property
          options.related[key][(0, _lodash2.default)(_this.constructor.name)] = _this;
        }
      });
    }

    if (!(0, _lodash6.default)(options.initialState)) {
      this.set(options.initialState);
    }
  }

  /**
   * The collection URL
   */

  /**
   * unique id of this model, immutable.
   */


  _createClass(Collection, [{
    key: 'url',
    value: function url() {
      return '/';
    }

    /**
     * Specifies the model class for that collection
     */

  }, {
    key: 'model',
    value: function model() {
      return _Model2.default;
    }

    /**
     * Gets the unique ids of all the items in the collection
     */

  }, {
    key: 'modelIds',
    value: function modelIds() {
      return this.models.map(function (model) {
        return model.uniqueId;
      });
    }

    /**
     * Getter for the collection length
     */

  }, {
    key: 'getModelAt',


    /**
     * Get a model at a given position
     */
    value: function getModelAt(index) {
      return this.models[index];
    }

    /**
     * Get a model with the given id or uuid
     */

  }, {
    key: 'getModel',
    value: function getModel(uniqueId) {
      return this.models.find(function (model) {
        return model.uniqueId === uniqueId;
      });
    }

    /**
     * Get a meta value with the given key
     */

  }, {
    key: 'getMeta',
    value: function getMeta(key) {
      return this.meta.get(key);
    }

    /**
     * Get a link with the given key
     */

  }, {
    key: 'getLink',
    value: function getLink(key) {
      return this.links.get(key);
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
     * Handles full JSON payload and sets data accordingly.
     */

  }, {
    key: 'set',
    value: function set(response) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { add: true, merge: true, remove: true };

      if (response.meta) {
        this.setMeta(response.meta);
      }

      if (response.links) {
        this.setLinks(response.links);
      }

      if (response.data) {
        this.setModels(response.data, options);
      }

      if (response.included && response.included.length) {
        this.setIncluded(response.included);
      }
    }

    /**
     * Sets the links data into the collection.
     */

  }, {
    key: 'setLinks',
    value: function setLinks() {
      var links = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.links.merge(links);
    }

    /**
     * Sets the metadata into the collection.
     *
     */

  }, {
    key: 'setMeta',
    value: function setMeta() {
      var meta = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.meta.merge(meta);
    }

    /**
     * Sets the models into the collection.
     *
     * You can disable adding, merging or removing.
     */

  }, {
    key: 'setModels',
    value: function setModels() {
      var _this2 = this;

      var models = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var options = arguments[1];

      // Merge in the any options with the default
      options = Object.assign({
        add: true,
        merge: true,
        remove: true
      }, options);

      if (options.remove) {
        var ids = models.map(function (d) {
          return d.id;
        });

        this.removeModels((0, _lodash8.default)(this.modelIds(), ids));
      }

      models.forEach(function (data) {
        var model = _this2.getModel(data.id);

        if (model && options.merge) model.set(data);

        if (!model && options.add) _this2.addModels(data);
      });
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
     * Add a model (or an array of models) to the collection
     */

  }, {
    key: 'add',
    value: function add(models) {
      // Handle single model
      if (!Array.isArray(models)) models = [models];

      this.setModels(models, { add: true, merge: false, remove: false });

      return this.models;
    }

    /**
     * Adds a collection of models.
     * Returns the added models.
     */

  }, {
    key: 'addModels',
    value: function addModels(models) {
      var _this3 = this;

      // Handle single model
      if (!Array.isArray(models)) models = [models];

      // Get the type of Model
      var CollectionModel = this.model();

      var instances = models.map(function (model) {
        if (model instanceof _Model2.default) {
          if (!(model instanceof CollectionModel)) {
            throw new Error('Collection can only hold ' + CollectionModel.type + ' models.');
          } else {
            if (!model.collection) {
              model.collection = _this3;
            }

            return model;
          }
        } else {
          return new CollectionModel({
            collection: _this3,
            initialState: model
          });
        }
      });

      this.models = this.models.concat(instances);

      return instances;
    }

    /**
     * Remove a model (or an array of models) from the collection
     */

  }, {
    key: 'remove',
    value: function remove(models) {
      var _this4 = this;

      // Handle single model
      if (!Array.isArray(models)) models = [models];

      var ids = models.map(function (model) {
        if (model instanceof _this4.model()) {
          return model.uniqueId;
        }

        return model.id;
      });

      this.removeModels(ids);
    }

    /**
     * Removes the models with the given ids or uuids
     */

  }, {
    key: 'removeModels',
    value: function removeModels() {
      var _this5 = this;

      var ids = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      ids.forEach(function (id) {
        var model = _this5.getModel(id);
        if (!model) return;

        _this5.models.splice(_this5.models.indexOf(model), 1);
      });
    }

    /**
     * Fetches the collection data from the backend.
     *
     * It uses `set` internally so you can
     * use the options to disable adding, changing
     * or removing.
     */

  }, {
    key: 'fetch',
    value: function fetch(options) {
      var _this6 = this;

      // Merge in the any options with the default
      options = Object.assign({
        url: this.url(),
        params: {},
        add: true,
        merge: true,
        remove: true
      }, options);

      this.setRequestLabel('fetching', true);

      var url = options.url ? options.url : this.url();

      return new Promise(function (resolve, reject) {
        // Optionally the request above could also be done as
        _axios2.default.get(options.url, {
          params: options.params
        }).then(function (response) {
          _this6.set(response.data, { add: options.add, merge: options.merge, remove: options.remove });
          _this6.setRequestLabel('fetching', false);
          resolve(_this6, response);
        }).catch(function (error) {
          _this6.setRequestLabel('fetching', false);
          reject(error);
        });
      });
    }

    /**
     * Creates the model and saves it on the backend
     *
     * The default behaviour is optimistic but this
     * can be tuned.
     */

  }, {
    key: 'create',
    value: function create() {
      var _this7 = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { wait: false };

      // Don't add/create existing models
      if (data.id && this.getModelAt(data.id)) return false;

      var ModelClass = this.model();

      var model = new ModelClass({
        initialState: data
      });

      return new Promise(function (resolve, reject) {
        if (!options.wait) {
          _this7.add(model);
          resolve(model);
        } else {
          _this7.setRequestLabel('saving', true);
        }

        // Model can create itself
        model.create(null, {
          url: _this7.url()
        }).then(function (model, response) {
          if (options.wait) {
            _this7.add(model);
          }

          _this7.setRequestLabel('saving', false);

          resolve(model, response);
        }).catch(function (error) {
          _this7.setRequestLabel('saving', false);

          // Remove the model if unsuccessful
          _this7.remove(model);

          reject(error);
        });
      });
    }
  }, {
    key: 'length',
    get: function get() {
      return this.models.length;
    }
  }]);

  return Collection;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'fetching', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'saving', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class.prototype, 'setRequestLabel', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setRequestLabel'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'set', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'set'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setLinks', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setLinks'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setMeta', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setMeta'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setModels', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setModels'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setIncluded', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'setIncluded'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'add', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'add'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'addModels', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'addModels'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'remove', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'remove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'removeModels', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'removeModels'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'fetch', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'fetch'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'create', [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, 'create'), _class.prototype)), _class);
exports.default = Collection;