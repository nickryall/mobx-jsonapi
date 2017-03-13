import _camelCase from 'lodash.camelcase';
import _last from 'lodash.last';
import _isEmpty from 'lodash.isempty';
import _difference from 'lodash.difference';
import { observable, asMap,  action } from 'mobx';
import request from 'axios';

import Model from './Model';

class Collection {
  @observable fetching;
  @observable saving;

  constructor(data, options = { related: {} }) {
    this.meta = observable(asMap({}));
    this.links = observable(asMap({}));
    this.models = observable([]);
    
    this.fetching = false;
    this.saving = false;

    // Assign any related stores
    if (!_isEmpty(options.related)) {
      Object.keys(options.related).forEach((key) => {
        if (options.related[key]) {
          // Store reference to child
          this[key] = options.related[key];
          // Store reference to this on child as 'parent' property
          options.related[key][_camelCase(this.constructor.name)] = this;
        }
      });
    }
    
    if (!_isEmpty(data)) {
      this.set(data);
    }
  }

  /**
   * The collection URL
   */
  url() {
    return '/';
  }

  /**
   * Specifies the model class for that collection
   */
  model() {
    return Model;
  }

  /**
   * Gets the unique ids of all the items in the collection
   */
  modelIds() {
    return this.models.map((model) => model.uniqueId);
  }

  /**
   * Getter for the collection length
   */
  get length() {
    return this.models.length;
  }

  /**
   * Get a model at a given position
   */
  getModelAt(index) {
    return this.models[index];
  }

  /**
   * Get a model with the given id or uuid
   */
  getModel(uniqueId) {
    return this.models.find((model) => model.uniqueId === uniqueId);
  }

  /**
   * Get a meta value with the given key
   */
  getMeta(key) {
    return this.meta.get(key);
  }

  /**
   * Get a link with the given key
   */
  getLink(key) {
    return this.links.get(key);
  }

  /**
   * Controls boolean value of request label
   */
  @action setRequestLabel(label, state = false) {
    this[label] = state;
  }

  /**
   * Handles full JSON payload and sets data accordingly.
   */
  @action set(response, options = { add: true, merge: true, remove: true }) {
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
  @action setLinks(links = {}) {
    this.links.merge(links);
  }

  /**
   * Sets the metadata into the collection.
   *
   */
  @action setMeta(meta = {}) {
    this.meta.merge(meta);
  }

  /**
   * Sets the models into the collection.
   *
   * You can disable adding, merging or removing.
   */
  @action setModels(models = [], options) {
    // Merge in the any options with the default
    options = Object.assign({ 
      add: true, 
      merge: true, 
      remove: true 
    }, options );

    if (options.remove) {
      const ids = models.map((d) => d.id);

      this.removeModels(_difference(this.modelIds(), ids));
    }

    models.forEach((data) => {
      let model = this.getModel(data.id);

      if (model && options.merge) model.set(data);

      if (!model && options.add) this.addModels(data);
    })
  }
  
  /**
   * Sets the included into any related collections.
   * Override this in the extending class
   */
  @action setIncluded(included = []) {
    return true;
  }

  /**
   * Add a model (or an array of models) to the collection
   */
  @action add(models) {
    // Handle single model
    if (!Array.isArray(models)) models = [models];

    this.setModels(models, { add: true, merge: false, remove: false })

    return this.models;
  }

  /**
   * Adds a collection of models.
   * Returns the added models.
   */
  @action addModels (models) {
    // Handle single model
    if (!Array.isArray(models)) models = [models];

    // Get the type of Model
    const CollectionModel = this.model();

    const instances = models.map((model) => {
      if (model instanceof Model) {
        if (!(model instanceof CollectionModel)) {
          throw new Error(`Collection can only hold ${CollectionModel.type} models.`);
        } else {
          if (!model.collection) {
            model.collection = this;
          }

          return model;
        }
      } else {
        return new CollectionModel(model, {
          collection: this
        });
      }
    });

    this.models = this.models.concat(instances);

    return instances;
  }

  /**
   * Remove a model (or an array of models) from the collection
   */
  @action remove(models) {
    // Handle single model
    if (!Array.isArray(models)) models = [models];

    const ids = models.map((model) => {
      if (model instanceof this.model()) {
        return model.uniqueId;
      }

      return model.id;
    });

    this.removeModels(ids);
  }

  /**
   * Removes the models with the given ids or uuids
   */
  @action removeModels(ids = []) {
    ids.forEach((id) => {
      const model = this.getModel(id);
      if (!model) return;

      this.models.splice(this.models.indexOf(model), 1);
    })
  }

  /**
   * Fetches the collection data from the backend.
   *
   * It uses `set` internally so you can
   * use the options to disable adding, changing
   * or removing.
   */
  @action fetch(options) {
    // Merge in the any options with the default
    options = Object.assign({ 
      url: this.url(),
      params: {},
      add: true, 
      merge: true, 
      remove: true 
    }, options );

    this.setRequestLabel('fetching', true);

    const url = options.url ? options.url : this.url();

    return new Promise((resolve, reject) => {
      // Optionally the request above could also be done as
      request.get(options.url, {
        params: options.params
      })
      .then((response) => {
        this.set(response.data, { add: options.add, merge: options.merge, remove: options.remove });
        this.setRequestLabel('fetching', false);
        resolve(this, response);
      })
      .catch((error) => {
        this.setRequestLabel('fetching', false);
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
  @action create(data = {}, options = { wait: false }) {
    // Don't add/create existing models
    if (data.id && this.getModelAt(data.id)) return false;

    const ModelClass = this.model();

    const model = new ModelClass(data);

    return new Promise((resolve, reject) => {
      if (!options.wait) {
        this.add(model);
        resolve(model);
      } else {
        this.setRequestLabel('saving', true);
      }

      // Model can create itself
      model.create(
        null,
        {
          url: this.url()
        }
      )
      .then((model, response) => {
        if (options.wait) {
          this.add(model);
        }

        this.setRequestLabel('saving', false);

        resolve(model, response);
      })
      .catch((error) => {
        this.setRequestLabel('saving', false);

        // Remove the model if unsuccessful
        this.remove(model);

        reject(error);
      });
    });
  }
}

export default Collection;