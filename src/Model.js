import uuid from 'uuid-v4';
import _isFunction from 'lodash.isfunction';
import _isEmpty from 'lodash.isempty';
import _result from 'lodash.result';
import { observable, asMap, action, toJS } from 'mobx';
import request from 'axios';

// Throw an error when a URL is needed, and none is supplied.
const urlError = () => {
  throw new Error('A url" property or function must be specified');
};

class Model {
  /**
   * unique id of this model, immutable.
   */
  id = null;
  type = '';

  @observable fetching;
  @observable saving;
  @observable deleting;

  constructor(options = { parent: null, initialState: {}, children: {} }) {
    this.uuid = uuid();
    this.parent = options.parent;
    this.attributes = observable(asMap({}));
    this.relationships = observable(asMap({}));
    this.fetching = true;
    this.saving = false;
    this.deleting = false;

    // Assign any child stores
    if (!_isEmpty(options.children)) {
      Object.keys(options.children).forEach((key) => {
        if (options.children[key]) {
          // Store reference to child
          this[key] = options.children[key];
          // Store reference to this on child as 'parent' property
          options.children[key].parent = this;
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
  url() {
    // Get the base URL specified as urlRoot or in the parent:
    const base = this.urlRoot || 
    _result(this.parent, 'url') || 
    urlError();

    if (this.isNew) {
      return base;
    }

    return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
  }

  /**
   * Returns the unique identifier of the model.
   * Returns either the server id or fall back to client uuid.
   */
  get uniqueId() {
    return this.id ? this.id : this.uuid
  }

  /**
   * Getter to check if a model is yet to be saved to the server
   */
  get isNew() {
    return this.id == null;
  }

  /**
   * Get an attribute value with the given key
   */
  getAttribute(key) {
    return this.attributes.get(key)
  }

  /**
   * Get an relationship object with the given key
   */
  getRelationship(key) {
    return this.relationships.get(key);
  }

  /**
   * Controls boolean value of request label
   */
  @action setRequestLabel(label, state = false) {
    this[label] = state
  }

  /**
   * Sets the attributes data via merge
   */
  @action setAttributes(data = {}) {
    this.attributes.merge(data);
  }

  /**
   * Sets a single attribute via merge
   */
  @action setAttribute(key, value) {
    this.attributes.merge({
      [key]: value
    });
  }

  /**
   * Clears the models attributes
   */
  @action clearAttributes() {
    this.attributes.clear();
  }

  /**
   * Sets the relationships data via merge
   */
  @action setRelationships(data = {}) {
    this.relationships.merge(data);
  }

  /**
   * Updates the ID on a to-one relationship
   */
  @action setToOneRelationship(key, id, type) {
    // No op on to-many relationship
    if (this.relationships.get(key) && Array.isArray(toJS(this.relationships.get(key).data))) return;

    // If realtionship exists update it. Otherwise create it.
    if (this.relationships.get(key)) {
      this.relationships.merge({
        [key] : Object.assign({}, {
          data: {
            type: type ? type : this.relationships.get(key).data.type,
            id: id
          }
        })
      });
    } else {
      this.setRelationships({
        [key]: {
          data: {
            id: id,
            type: type
          }
        }
      });
    }
  }

  /**
   * Clears the models relationships
   */
  @action clearRelationships() {
    this.relationships.clear();
  }

  /**
   * Handles full JSON payload and sets data accordingly.
   */
  @action set(response) {
    let newData;

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
  @action setIncluded(included = []) {
    return true;
  }

  /**
   * Fetch the model from the server.
   */
  @action fetch(options = {}) {
    this.setRequestLabel('fetching', true);

    const url = options.url ? options.url : this.url();

    return new Promise((resolve, reject) => {
      request.get(url, {
        params: options.params ? options.params : {}
      })
      .then((response) => {
        this.set(response.data);
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
   * Save the model to the server via a PATCH request.
   * If the model is new delegates to the create action.
   * If the `wait` option is false it will optimistically 
   * update the atributes and relationships passed
   */
  @action save(data = null, options = { wait: false }) {
    let originalAttributes = this.attributes.toJS();
    let originalRelationships = toJS(this.relationships);
    let resourceObject = {};

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
      resourceObject.data.attributes = Object.assign(
        {}, 
        originalAttributes
      );
      resourceObject.data.relationships = Object.assign(
        {}, 
        originalRelationships
      );
    } else {
      if (data.attributes) {
        resourceObject.data.attributes = Object.assign(
          {}, 
          data.attributes
        );
      }

      if (data.relationships) {
        resourceObject.data.relationships = Object.assign(
          {}, 
          data.relationships
        );
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

    return new Promise((resolve, reject) => {
      request.patch(
        this.url(), 
        resourceObject
      )
      .then((response) => {
        this.set(response.data);
        this.setRequestLabel('saving', false);
        resolve(this, response);
      })
      .catch((error) => {
        if (!options.wait) {
          this.setAttributes(originalAttributes);
          this.setRelationships(originalRelationships);
        }

        this.setRequestLabel('saving', false);

        reject(error);
      });
    });
  }

  /**
   * Allows for attributes to not have to be wrapped when saving.
   */
  @action saveAttributes(attributes, options) {
    return this.save({
      attributes: attributes
    }, options);
  }

  /**
   * Create a new model to the server with  a POST request.
   * If the `wait` option is false it will optimistically 
   * update the attributes and relationships passed in.
   */
  @action create(data = null, options = { wait: false }) {
    let originalAttributes = this.attributes.toJS();
    let originalRelationships = toJS(this.relationships);
    let resourceObject = {
      data: {
        type: this.type
      }
    };

    if (data && data.attributes) {
      resourceObject.data.attributes = Object.assign(
        {},
        originalAttributes,
        data.attributes
      );
    } else {
      resourceObject.data.attributes = Object.assign(
        {}, 
        originalAttributes
      );
    }

    if (data && data.relationships) {
      resourceObject.data.relationships = Object.assign(
        {},
        originalRelationships,
        data.relationships
      );
    } else {
      resourceObject.data.relationships = Object.assign(
        {}, 
        originalRelationships
      );
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

    return new Promise((resolve, reject) => {
      request.post(
        options.url ? options.url : this.url(), 
        resourceObject
      )
      .then((response) => {
        this.set(response.data);
        this.setRequestLabel('saving', false);
        resolve(this, response);
      })
      .catch((error) => {
        if (!options.wait) {
          this.setAttributes(originalAttributes);
          this.setRelationships(originalRelationships);
        }
        
        this.setRequestLabel('saving', false);
        reject(error);
      });
    });
  }

  /**
   * Destroy this model on the server if it was already persisted.
   * Optimistically removes the model from its collection, if it has one.
   * If `wait: true` is passed, waits for the server to respond before removal.
   */
  @action destroy (options = { wait: false }) {
    if (this.isNew && _isFunction(this.parent.remove)) {
      this.parent.remove(this);

      return true;
    }

    if (!options.wait && _isFunction(this.parent.remove)) {
      this.parent.remove(this);
    } else {
      this.setRequestLabel('deleting', true);
    }

    return new Promise((resolve, reject) => {
      request.delete(
        this.url()
      )
      .then((response) => {
        if (options.wait && _isFunction(this.parent.remove)) {
          this.parent.remove(this);
        }

        this.setRequestLabel('deleting', false);

        resolve(this, response);
      })
      .catch((error) => {
        // Put it back if delete request fails
        if (!options.wait && _isFunction(this.parent.add)) {
          this.parent.add(this);
        }

        this.setRequestLabel('deleting', false);

        reject(error);
      });
    });
  }
}

export default Model;