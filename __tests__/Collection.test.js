import request from 'axios';
import Collection from '../src/Collection';
import Model from '../src/Model';

import { users, businesses } from '../fixtures/collections';

describe('Collection', function() {
  describe('constructor with no initial state', function() {
    beforeEach(function() {
      spyOn(Collection.prototype, 'set');

      this.store = {};
      this.collection = new Collection();
    });

    it ('Creates a meta map', function() {
      expect(this.collection.meta).toBeDefined();
    });

    it ('Creates a links map', function() {
      expect(this.collection.links).toBeDefined();
    });

    it ('Creates a models observable array', function() {
      expect(this.collection.models).toBeDefined();
    });

    it ('Sets the request labels to falsey by default', function() {
      expect(this.collection.fetching).toBeFalsy();
      expect(this.collection.creating).toBeFalsy();
    });

    it ('Does not call set method as there is no initial state', function() {
      expect(this.collection.set).not.toHaveBeenCalled();
    });
  });

  describe('constructor with initial state', function() {
    beforeAll(function() {
      spyOn(Collection.prototype, 'set');
    });

    beforeEach(function() {
      this.store = {};
      this.collection = new Collection(users);
    });

    it ('Calls set method with the initial state', function() {
      expect(this.collection.set).toHaveBeenCalledWith(users);
    });
  });

  describe('constructor with related instances', function() {
    it('Sets up references to the instances (model or collection) passed in through options', function() {
      this.collection = new Collection(null, {
        related: {
          relatedStoreOne: {},
          relatedStoreTwo: {}
        }
      });

      expect(this.collection.relatedStoreOne).toBeDefined();
      expect(this.collection.relatedStoreTwo).toBeDefined();
    });

    it('Sets up reference to the "this" on the related store', function() {
      this.relatedStoreOne = {};
      this.relatedStoreTwo = {};

      class SubClassOne extends Collection {};

      this.collection = new SubClassOne(null, {
        related: {
          relatedStoreOne: this.childStoreOne,
          relatedStoreTwo: this.childStoreTwo
        }
      });

      expect(this.relatedStoreOne.subClassOne).toEqual(this.model);
      expect(this.relatedStoreTwo.subClassOne).toEqual(this.model);
    });
  });

  describe('url method', function() {
    it('Create the URL for the collection', function() {
      class subCollection extends Collection {
        url() {
          return `jsonapi/users`;
        };
      };

      this.collection = new subCollection();

      expect(this.collection.url()).toEqual('jsonapi/users');
    });
  });

  describe('model method', function() {
    it('returns the model class by default', function() {
      this.collection = new Collection();

      expect(this.collection.model()).toEqual(Model);
    });

    it('can be overridden to return a different model class', function() {
      class SubModel extends Model {};

      class subCollection extends Collection {
        model() {
          return SubModel;
        }
      }

      this.collection = new subCollection();

      expect(this.collection.model()).toEqual(SubModel);
    });
  });

  describe('"length" getter', function() {
    beforeEach(function() {
      this.collection = new Collection(users);
    });

    it('returns the length of collection.models', function() {
      expect(this.collection.length).toEqual(2);
    });
  });

  describe('modelIds method', function() {
    beforeEach(function() {
      this.collection = new Collection(users);
    });

    it('returns the unique ids for every model in the collection', function() {
      expect(this.collection.modelIds()).toEqual(['1', '2']);
    });
  });

  describe('getModel method', function() {
    beforeEach(function() {
      this.collection = new Collection(users);
    });

    it('returns the the model with the given unique id', function() {
      const model = this.collection.getModel('2');
      expect(model.getAttribute('first_name')).toEqual('John');
    });
  });

  describe('getModelAt method', function() {
    beforeEach(function() {
      this.collection = new Collection(users);
    });

    it('returns the the model at the give index', function() {
      const model = this.collection.getModelAt(0);
      expect(model.getAttribute('first_name')).toEqual('Nick');
    });
  });

  describe('getMeta method', function() {
    beforeEach(function() {
      this.collection = new Collection(users);
    });

    it('returns the meta item with the given key', function() {
      expect(this.collection.getMeta('totalPages')).toEqual(1);
    });
  });

  describe('getLink method', function() {
    beforeEach(function() {
      this.collection = new Collection(users);
    });

    it('returns the link item with the given key', function() {
      expect(this.collection.getLink('first')).toEqual('http://example.com/users?page[number]=1&page[size]=1');
    });
  });

  describe('setRequestLabel action', function() {
    beforeEach(function() {
      this.collection = new Collection();
    });

    it('Sets the give prop to the boolean value', function() {
      this.collection.setRequestLabel('creating', true);
      expect(this.collection.creating).toBeTruthy();
      this.collection.setRequestLabel('creating', false);
      expect(this.collection.creating).toBeFalsy();
    });
  });

  describe('set action', function() {
    beforeEach(function() {
      spyOn(Collection.prototype, 'setMeta');
      spyOn(Collection.prototype, 'setLinks');
      spyOn(Collection.prototype, 'setModels');
      spyOn(Collection.prototype, 'setIncluded');
    });

    it('Calls the correct set method for each data type', function() {
      this.collection = new Collection(users);

      expect(this.collection.setMeta).toHaveBeenCalledWith(users.meta);
      expect(this.collection.setLinks).toHaveBeenCalledWith(users.links);
      expect(this.collection.setModels).toHaveBeenCalledWith(users.data, { add: true, merge: true, remove: true });
      expect(this.collection.setIncluded).toHaveBeenCalledWith(users.included);
    });
  });

  describe('setMeta action', function() {
    it('Should merge in the given meta data', function() {
      this.collection = new Collection();
      this.collection.setMeta(Object.assign({}, users.meta));

      expect(this.collection.getMeta('totalPages')).toEqual(1);

      this.collection.setMeta({ 'totalPages' : 2 });

      expect(this.collection.getMeta('totalPages')).toEqual(2);
    }); 
  });

  describe('setLinks action', function() {
    it('Should merge in the given links data', function() {
      this.collection = new Collection();
      this.collection.setLinks(Object.assign({}, users.links));

      expect(this.collection.getLink('self')).toEqual('http://example.com/users?page[number]=1');

      this.collection.setLinks({
        self: 'http://rakenapp.com/api/users'
      });

      expect(this.collection.getLink('self')).toEqual('http://rakenapp.com/api/users');
      expect(this.collection.getLink('first')).toEqual('http://example.com/users?page[number]=1&page[size]=1');
    }); 
  });

  describe('setModels action with default options', function() {
    beforeEach(function() {
      this.collection = new Collection();

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "first_name": "James",
            "last_name": "Thomas",
            "email": "james.thomas@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "1"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "1"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/1"
          }
        },
        {
          "id": "2",
          "type": "users",
          "attributes": {
            "title": "Master",
            "first_name": "John",
            "last_name": "Jones",
            "email": "john.jones@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "2"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "2"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/2"
          }
        }
      ]);
    });

    it('Should add new models passed in', function() {
      expect(this.collection.getModel('3')).toBeDefined();
    });

    it('Should remove existing models that are not passed in', function() {
      expect(this.collection.getModel('1')).not.toBeDefined();
    });

    it('Should update existing models that are passed in', function() {
      expect(this.collection.getModel('2').getAttribute('title')).toEqual('Master');
    });
  });

  describe('setModels action with "add" option set to falsy', function() {
    beforeEach(function() {
      this.collection = new Collection(users);

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "first_name": "James",
            "last_name": "Thomas",
            "email": "james.thomas@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "1"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "1"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/1"
          }
        },
        {
          "id": "2",
          "type": "users",
          "attributes": {
            "title": "Master",
            "first_name": "John",
            "last_name": "Jones",
            "email": "john.jones@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "2"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "2"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/2"
          }
        }
      ], { add: false, merge: true, remove: true });
    });

    it('Should not add new models to the collection', function() {
      expect(this.collection.length).toEqual(1);
    });
  });

  describe('setModels action with "merge" option set to falsy', function() {
    beforeEach(function() {
      this.collection = new Collection(users);

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "first_name": "James",
            "last_name": "Thomas",
            "email": "james.thomas@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "1"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "1"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/1"
          }
        },
        {
          "id": "2",
          "type": "users",
          "attributes": {
            "title": "Master",
            "first_name": "John",
            "last_name": "Jones",
            "email": "john.jones@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "2"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "2"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/2"
          }
        }
      ], { add: true, merge: false, remove: true });
    });

    it('Should not update existing models', function() {
      expect(this.collection.getModel('2').getAttribute('title')).toEqual('Mr');
    });
  });

  describe('setModels action with "remove" options set to falsy', function() {
    beforeEach(function() {
      this.store = {};
      this.collection = new Collection(users);

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "first_name": "James",
            "last_name": "Thomas",
            "email": "james.thomas@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "1"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "1"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/1"
          }
        },
        {
          "id": "2",
          "type": "users",
          "attributes": {
            "title": "Master",
            "first_name": "John",
            "last_name": "Jones",
            "email": "john.jones@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "2"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "2"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/2"
          }
        }
      ], { add: true, merge: false, remove: false });
    });

    it('Should not remove models from the collection', function() {
      expect(this.collection.length).toEqual(3);
    });
  });

  describe('addModels action', function() {
    beforeEach(function() {
      spyOn(Collection.prototype, 'setModels').and.callThrough();
      this.collection = new Collection();
    });

    it('Calls set function with the passed in model(s) with only the "add" option set to truthy', function() {
      const modelJSONWrapped = {
        data: {
          "id": "1",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "first_name": "Nick",
            "last_name": "Ryall",
            "email": "nick.ryall@gmail.com",
            "phone": "021552497",
            "created_at": "2016-11-02T01:54:57.444Z",
            "modified_at": "2016-11-02T01:54:57.444Z"
          },
          "relationships": {
            "business": {
              "data": {
                "type": "businesses",
                "id": "1"
              }
            },
            "projects": {
              "data": [
                {
                  "type": "projects",
                  "id": "1"
                }
              ]
            }
          },
          "links": {
            "self": "http://localhost/api/users/1"
          }
        }
      };

      const modelJSON = {
        "id": "2",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "first_name": "Tim",
          "last_name": "Smith",
          "email": "tim.smith@gmail.com",
          "phone": "021552497",
          "created_at": "2016-11-02T01:54:57.444Z",
          "modified_at": "2016-11-02T01:54:57.444Z"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        },
        "links": {
          "self": "http://localhost/api/users/1"
        }
      };

      this.collection.addModels(modelJSONWrapped);

      expect(this.collection.setModels).toHaveBeenCalledWith([modelJSONWrapped], { add: true, remove: false, merge: false });

      expect(this.collection.getModelAt(0).getAttribute('first_name')).toEqual('Nick');

      this.collection.addModels(modelJSON);

      expect(this.collection.setModels).toHaveBeenCalledWith([modelJSON], { add: true, remove: false, merge: false });

      expect(this.collection.getModelAt(1).getAttribute('first_name')).toEqual('Tim');
    });

    it('Can receive a single JSON representation of a model', function() {
      this.collection.addModels({
        "id": "1",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497",
          "created_at": "2016-11-02T01:54:57.444Z",
          "modified_at": "2016-11-02T01:54:57.444Z"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        },
        "links": {
          "self": "http://localhost/api/users/1"
        }
      });

      expect(this.collection.getModel('1').getAttribute('email')).toEqual('nick.ryall@gmail.com');
    });

    it('Can receive a single model instance', function() {
      const newModel = new Model({
        "id": "2",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "first_name": "John",
          "last_name": "Jones",
          "email": "john.jones@gmail.com",
          "phone": "021552497",
          "created_at": "2016-11-02T01:54:57.444Z",
          "modified_at": "2016-11-02T01:54:57.444Z"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "2"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "2"
              }
            ]
          }
        },
        "links": {
          "self": "http://localhost/api/users/2"
        }
      });

      this.collection.addModels(newModel);

      expect(this.collection.getModel('2').getAttribute('email')).toEqual('john.jones@gmail.com');
    });

    it('Can receive an array of JSON representations', function() {
      this.collection.addModels(users.data);

      expect(this.collection.getModel('1').getAttribute('email')).toEqual('nick.ryall@gmail.com');
      expect(this.collection.getModel('2').getAttribute('email')).toEqual('john.jones@gmail.com');
    });

    it('Can receive an array of model instances', function() {
      const newModel1 = new Model(users.data[0]);

      const newModel2 = new Model(users.data[1]);

      this.collection.addModels([
        newModel1,
        newModel2
      ]);

      expect(this.collection.getModel('1').getAttribute('email')).toEqual('nick.ryall@gmail.com');
      expect(this.collection.getModel('2').getAttribute('email')).toEqual('john.jones@gmail.com');
    });
  });

  describe('pushModels action', function() {
    it('Instantiates models from JSON', function() {
      class SubModel extends Model {
        static type = 'users';
      }

      class SubCollection extends Collection{
        model() {
          return SubModel;
        }
      };

      this.collection = new SubCollection();

      this.collection.pushModels({
        "id": "1",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497",
          "created_at": "2016-11-02T01:54:57.444Z",
          "modified_at": "2016-11-02T01:54:57.444Z"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        },
        "links": {
          "self": "http://localhost/api/users/1"
        }
      });

      expect(this.collection.getModel('1').getAttribute('email')).toEqual('nick.ryall@gmail.com');
    });

    it('Accepts model instances', function() {
      class SubModel extends Model {
        static type = 'users';
      }

      class SubCollection extends Collection{
        model() {
          return SubModel;
        }
      };

      this.collection = new SubCollection();

      const newModel1 = new SubModel(users.data[0]);

      const newModel2 = new SubModel(users.data[1]);

      this.collection.pushModels([
        newModel1,
        newModel2
      ]);

      expect(this.collection.getModel('1').getAttribute('email')).toEqual('nick.ryall@gmail.com');
      expect(this.collection.getModel('2').getAttribute('email')).toEqual('john.jones@gmail.com');
    });

    it('Rejects model instances that are not dervied from the correct class', function() {
      class SubModel extends Model {
        static type = 'users';
      }

      class SubCollection extends Collection{
        model() {
          return SubModel;
        }
      };

      this.collection = new SubCollection();

      const model = new Model();

      expect(() => {
        this.collection.pushModels(model);
      }).toThrow(new Error('Collection can only hold users models.'));

    });
  });

  describe('removeModels action', function() {
    beforeAll(function() {
      spyOn(Collection.prototype, 'spliceModels').and.callThrough();
    });

    beforeEach(function() {
      this.store = {};
      this.collection = new Collection(users);
    });

    it('Finds the unique ids of the models(s) and passes them to the removeModels action', function() {
      this.collection.removeModels([
        this.collection.getModelAt(0)
      ]);

      expect(this.collection.spliceModels).toHaveBeenCalledWith(['1']);
      expect(this.collection.length).toEqual(1);

      const newModel = new Model();

      // Add a new model with no server Id.
      this.collection.addModels(newModel);

      this.collection.removeModels([
        this.collection.getModelAt(1)
      ]);

      expect(this.collection.spliceModels).toHaveBeenCalledWith([newModel.uniqueId]);
      expect(this.collection.length).toEqual(1);
    });
  });

  describe('spliceModels action', function() {
    beforeEach(function() {
      this.collection = new Collection(users);
    });

    it('Removes the models with the given ids (or uuid)', function() {
      const newModel = new Model();

      // Add a new model with no server Id.
      this.collection.addModels(newModel);

      expect(this.collection.length).toEqual(3);

      this.collection.spliceModels(['2']);

      expect(this.collection.length).toEqual(2);

      this.collection.spliceModels([newModel.uniqueId]);

      expect(this.collection.length).toEqual(1);
    });
  });

  describe('fetch action', function() {
    beforeEach(function() {
      class SubCollection extends Collection {
        url() {
          return '/api/v1/businesses';
        }
      };

      this.collection = new SubCollection();
    });

    it('Sets the "fetching" request label to truthy', function() {
      this.collection.fetch().then(() => {

      }).catch(() => {

      });

      expect(this.collection.fetching).toBeTruthy();
    });

    it('Calls a get request with the collections url by default', function() {
      spyOn(request, 'get');

      this.collection.fetch().then(() => {

      }).catch(() => {
        
      });

      expect(request.get).toHaveBeenCalledWith(this.collection.url(), { params: {} });
    });

    it('Calls a get request with the url passed in though options', function() {
      spyOn(request, 'get');

      this.collection.fetch({
        url: '/api/v1/users/1/businesses'
      }).then(() => {

      }).catch(() => {
        
      });

      expect(request.get).toHaveBeenCalledWith('/api/v1/users/1/businesses', { params: {} });
    });

    it('Sends any "params" included in the options argument', function() {
      spyOn(request, 'get');

      this.collection.fetch({
        params: {
          included: 'projects'
        }
      }).then(() => {

      }).catch(() => {
        
      });;

      expect(request.get).toHaveBeenCalledWith(this.collection.url(), { params: { included: 'projects'} });
    });

    it('Calls the set action if the request is successful', function() {
      spyOn(Collection.prototype, 'set');

      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            cb.call(null, {
              status: 200,
              data: businesses
            });

            return this;
          },
          catch: ()=> {}
         }
      });


      this.collection.fetch().then(() => {

      }).catch(() => {
        
      });;

      expect(this.collection.set).toHaveBeenCalledWith(businesses, { add: true, merge: true, remove: true });
      expect(this.collection.fetching).toBeFalsy();
    });

    it('Passes the set options through to the set action', function() {
      spyOn(Collection.prototype, 'set');

      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            cb.call(null, {
              status: 200,
              data: businesses
            });

            return this;
          },
          catch: ()=> {}
         }
      });


      this.collection.fetch({ add: true, merge: false, remove: false }).then(() => {

      }).catch(() => {
        
      });;

      expect(this.collection.set).toHaveBeenCalledWith(businesses, { add: true, merge: false, remove: false });
    });
    
    it('allows for the individual set options to be overriden', function() {
      spyOn(Collection.prototype, 'set');

      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            cb.call(null, {
              status: 200,
              data: businesses
            });

            return this;
          },
          catch: ()=> {}
         }
      });


      this.collection.fetch({ remove: false }).then(() => {

      }).catch(() => {
        
      });;

      expect(this.collection.set).toHaveBeenCalledWith(businesses, { add: true, merge: true, remove: false });
    });

    it('Sets the "fetching" request label to falsy if the request fails', function() {
      spyOn(Collection.prototype, 'set');

      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            return this;
          },
          catch: function(cb) {
            cb.call(null, {
              status: 500
            });

            return this;
          }
         }
      });

      this.collection.fetch().then(() => {

      }).catch(() => {
        
      });

      expect(this.collection.set).not.toHaveBeenCalled();
      expect(this.collection.fetching).toBeFalsy();
    });
  });

  describe('create action', function() {
    it('Exits if called with and model id that already exists in collection', function() {
      this.collection = new Collection();

      this.collection.addModels(users.data);

      // No op as model with id exists
      this.collection.create({
        "id": "1",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      });

      expect(this.collection.length).toEqual(2);
    });

    it('Creates a new model instance with the passed in data, returns instance once promise is resolved.', function() {
      this.collection = new Collection();

      const model = this.collection.create({
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      }).then((model) => {
        expect(model instanceof Model).toBeTruthy();  
      });
    });

    it('Adds the new model to the collection immediately if "wait" options is falsy', function() {
      spyOn(Model.prototype, 'create').and.callFake(function(url) {
        return {
          then: function(cb) {
            setTimeout(() => {
              cb.call(null, {
                status: 201
              });
            }, 1000);

            return this;
          },
          catch: ()=> {}
        }
      });

      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      }, { wait: false }).then(() => {

      }).catch(() => {
        
      });

      expect(this.collection.length).toEqual(1);
    });

    it('Adds the new model only after successful creation on server if "wait" options is truthy', function() {
      spyOn(Model.prototype, 'create').and.callFake(function(url) {
        return {
          then: function(cb) {
            setTimeout(() => {
              cb.call(null, {
                status: 201
              });
            }, 1000);

            return this;
          },
          catch: ()=> {}
        }
      });

      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      }, { wait: true });

      expect(this.collection.length).toEqual(0);

      // Fast-forward until all timers have been executed
      jest.runOnlyPendingTimers();

      expect(this.collection.length).toEqual(1);
    });

    it('Sets the "creating" label to truthy if "wait" option is truthy', function() {
      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      }, { wait: true }).then(() => {

      }).catch(() => {
        
      });

      expect(this.collection.saving).toBeTruthy();
    });

    it('Calls the create action on the model with the collections URL', function() {
      spyOn(Model.prototype, 'create').and.callFake(function() {
        return {
          then: function() {
            return this;
          }
        }
      });

      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      })

      expect(Model.prototype.create.calls.mostRecent().args[1].url).toEqual(this.collection.url());
    });

    it('Sets the "creating" label to falsy after the model.create method completes successfuly', function() {
      spyOn(Model.prototype, 'create').and.callFake(function(url) {
        return {
          then: function(cb) {
            setTimeout(() => {
              cb.call(null, {
                status: 201
              });
            }, 1000);

            return this;
          },
          catch: ()=> {}
        }
      });

      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      }, { wait: true }).then(() => {

      }).catch(() => {
        
      });

      expect(this.collection.saving).toBeTruthy();

      // Fast-forward until all timers have been executed
      jest.runOnlyPendingTimers();

      expect(this.collection.saving).toBeFalsy();
    });

    it('Sets the "creating" label to falsy after the model.create method fails', function() {
      spyOn(Model.prototype, 'create').and.callFake(function(url) {
        return {
          then: function(cb) {
            return this;
          },
          catch: function(cb) {
            setTimeout(() => {
              cb.call(null, {
                status: 500
              });
            });

            return this;
          }
         }
      });

      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "first_name": "Nick",
          "last_name": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "021552497"
        },
        "relationships": {
          "business": {
            "data": {
              "type": "businesses",
              "id": "1"
            }
          },
          "projects": {
            "data": [
              {
                "type": "projects",
                "id": "1"
              }
            ]
          }
        }
      }, { wait: true }).then(() => {

      }).catch(() => {
        
      });

      expect(this.collection.saving).toBeTruthy();

      // Fast-forward until all timers have been executed
      jest.runOnlyPendingTimers();

      expect(this.collection.saving).toBeFalsy();
    });
  });
});