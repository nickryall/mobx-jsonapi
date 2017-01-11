import request from 'axios';
import Collection from '../src/Collection';
import Model from '../src/Model';

import { users, businesses } from '../fixtures/collections';

describe('Collection', function() {
  describe('constructor with no initial state', function() {
    beforeEach(function() {
      spyOn(Collection.prototype, 'set');

      this.store = {};
      this.collection = new Collection({
        parent: this.store
      });
    });

    it ('Sets up a reference to the parent', function() {
      expect(this.collection.parent).toEqual(this.store);
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
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it ('Calls set method with the initial state', function() {
      expect(this.collection.set).toHaveBeenCalledWith(users);
    });
  });

  describe('constructor with related stores', function() {
    it('Sets up references to the stores passed in through options', function() {
      this.collection = new Collection({
        childStores: {
          relatedStoreOne: {},
          relatedStoreTwo: {}
        }
      });

      expect(this.collection.relatedStoreOne).toBeDefined();
      expect(this.collection.relatedStoreTwo).toBeDefined();
    });
  });

  describe('url method', function() {
    it('Create the URL for the collection', function() {
      const parent = {
        url: '/api/projects/1'
      };

      class subCollection extends Collection {
        url() {
          return `${this.parent.url}/users`;
        };
      };

      this.collection = new subCollection({
        parent: parent
      });

      expect(this.collection.url()).toEqual('/api/projects/1/users');
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
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it('returns the length of collection.models', function() {
      expect(this.collection.length).toEqual(2);
    });
  });

  describe('modelIds method', function() {
    beforeEach(function() {
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it('returns the unique ids for every model in the collection', function() {
      expect(this.collection.modelIds()).toEqual(['1', '2']);
    });
  });

  describe('getModel method', function() {
    beforeEach(function() {
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it('returns the the model with the given unique id', function() {
      const model = this.collection.getModel('2');
      expect(model.getAttribute('firstName')).toEqual('John');
    });
  });

  describe('getModelAt method', function() {
    beforeEach(function() {
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it('returns the the model at the give index', function() {
      const model = this.collection.getModelAt(0);
      expect(model.getAttribute('firstName')).toEqual('Nick');
    });
  });

  describe('getMeta method', function() {
    beforeEach(function() {
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it('returns the meta item with the given key', function() {
      expect(this.collection.getMeta('totalPages')).toEqual(1);
    });
  });

  describe('getLink method', function() {
    beforeEach(function() {
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
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
      this.collection = new Collection({
        initialState: users
      });

      expect(this.collection.setMeta).toHaveBeenCalledWith(users.meta);
      expect(this.collection.setLinks).toHaveBeenCalledWith(users.links);
      expect(this.collection.setModels).toHaveBeenCalledWith(users.data);
      expect(this.collection.setIncluded).toHaveBeenCalledWith(users.included);
    });

    it('Calls the correct set method for each data type', function() {
      const data = [].concat(users.data);

      this.collection = new Collection({
        initialState: {
          "data": data
        }
      });

      expect(this.collection.setMeta).not.toHaveBeenCalled();
      expect(this.collection.setLinks).not.toHaveBeenCalled();
      expect(this.collection.setModels).toHaveBeenCalledWith(data);
      expect(this.collection.setIncluded).not.toHaveBeenCalled();
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
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "firstName": "James",
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
            "firstName": "John",
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
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "firstName": "James",
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
            "firstName": "John",
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
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "firstName": "James",
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
            "firstName": "John",
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
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });

      this.collection.setModels([
        {
          "id": "3",
          "type": "users",
          "attributes": {
            "title": "Mr",
            "firstName": "James",
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
            "firstName": "John",
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

    it('Should not add new models to the collection', function() {
      expect(this.collection.length).toEqual(3);
    });
  });

  describe('add action', function() {
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
            "firstName": "Nick",
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
          "firstName": "Tim",
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

      this.collection.add(modelJSONWrapped);

      expect(this.collection.setModels).toHaveBeenCalledWith([modelJSONWrapped], { add: true, remove: false, merge: false });

      expect(this.collection.getModelAt(0).getAttribute('firstName')).toEqual('Nick');

      this.collection.add(modelJSON);

      expect(this.collection.setModels).toHaveBeenCalledWith([modelJSON], { add: true, remove: false, merge: false });

      expect(this.collection.getModelAt(1).getAttribute('firstName')).toEqual('Tim');
    });

    it('Can receive a single JSON representation of a model', function() {
      this.collection.addModels({
        "id": "1",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "firstName": "Nick",
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
        initialState: {
          data: {
            "id": "2",
            "type": "users",
            "attributes": {
              "title": "Mr",
              "firstName": "John",
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
        }
      });

      this.collection.add(newModel);

      expect(this.collection.getModel('2').getAttribute('email')).toEqual('john.jones@gmail.com');
    });

    it('Can receive an array of JSON representations', function() {
      this.collection.add(users.data);

      expect(this.collection.getModel('1').getAttribute('email')).toEqual('nick.ryall@gmail.com');
      expect(this.collection.getModel('2').getAttribute('email')).toEqual('john.jones@gmail.com');
    });

    it('Can receive an array of model instances', function() {
      const newModel1 = new Model({
        initialState: {
          data: users.data[0]
        }
      });

      const newModel2 = new Model({
        initialState: {
          data: users.data[1]
        }
      });

      this.collection.add([
        newModel1,
        newModel2
      ]);

      expect(this.collection.getModel('1').getAttribute('email')).toEqual('nick.ryall@gmail.com');
      expect(this.collection.getModel('2').getAttribute('email')).toEqual('john.jones@gmail.com');
    });
  });

  describe('addModels action', function() {
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

      this.collection.addModels({
        "id": "1",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "firstName": "Nick",
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

      const newModel1 = new SubModel({
        initialState: {
          data: users.data[0]
        }
      });

      const newModel2 = new SubModel({
        initialState: {
          data: users.data[1]
        }
      });

      this.collection.addModels([
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
        this.collection.addModels(model);
      }).toThrow(new Error('Collection can only hold users models.'));

    });
  });

  describe('remove action', function() {
    beforeAll(function() {
      spyOn(Collection.prototype, 'removeModels').and.callThrough();
    });

    beforeEach(function() {
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it('Finds the unique ids of the models(s) and passes them to the removeModels action', function() {
      this.collection.remove([
        this.collection.getModelAt(0)
      ]);

      expect(this.collection.removeModels).toHaveBeenCalledWith(['1']);
      expect(this.collection.length).toEqual(1);

      const newModel = new Model();

      // Add a new model with no server Id.
      this.collection.add(newModel);

      this.collection.remove([
        this.collection.getModelAt(1)
      ]);

      expect(this.collection.removeModels).toHaveBeenCalledWith([newModel.uniqueId]);
      expect(this.collection.length).toEqual(1);
    });
  });

  describe('removeModels action', function() {
    beforeEach(function() {
      this.store = {};
      this.collection = new Collection({
        parent: this.store, 
        initialState: users
      });
    });

    it('Removes the models with the given ids (or uuid)', function() {
      const newModel = new Model();

      // Add a new model with no server Id.
      this.collection.add(newModel);

      expect(this.collection.length).toEqual(3);

      this.collection.removeModels(['2']);

      expect(this.collection.length).toEqual(2);

      this.collection.removeModels([newModel.uniqueId]);

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
      this.collection.fetch();

      expect(this.collection.fetching).toBeTruthy();
    });

    it('Calls a get request with the collections url by default', function() {
      spyOn(request, 'get').and.callThrough();

      this.collection.fetch();

      expect(request.get).toHaveBeenCalledWith(this.collection.url(), { params: {} });
    });

    it('Calls a get request with the url passed in though options', function() {
      spyOn(request, 'get').and.callThrough();

      this.collection.fetch({
        url: '/api/v1/users/1/businesses'
      });

      expect(request.get).toHaveBeenCalledWith('/api/v1/users/1/businesses', { params: {} });
    });

    it('Sends the any "params" included in the options argument', function() {
      spyOn(request, 'get').and.callThrough();

      this.collection.fetch({
        params: {
          included: 'projects'
        }
      });

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


      this.collection.fetch();

      expect(this.collection.set).toHaveBeenCalledWith(businesses, { add: true, change: true, remove: true });
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


      this.collection.fetch({ add: true, change: false, remove: false });

      expect(this.collection.set).toHaveBeenCalledWith(businesses, { add: true, change: false, remove: false });
    });

    it('Sets the "fetching" request label to falsy if the request fails', function() {
      spyOn(Collection.prototype, 'set');

      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            return {
              catch: function(cb) {
                cb.call(null, {
                  status: 500
                });

                return this;
              }
            }
          }
         }
      });

      this.collection.fetch();

      expect(this.collection.set).not.toHaveBeenCalled();
      expect(this.collection.fetching).toBeFalsy();
    });
  });

  describe('create action', function() {
    it('Exits if called with and model id that already exists in collection', function() {
      this.collection = new Collection();

      this.collection.add(users.data);

      // No op as model with id exists
      this.collection.create({
        "id": "1",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "firstName": "Nick",
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
          "firstName": "Nick",
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
          "firstName": "Nick",
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
      }, { wait: false });

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
          "firstName": "Nick",
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
          "firstName": "Nick",
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

      expect(this.collection.saving).toBeTruthy();
    });

    it('Calls the create action on the model with the collections URL', function() {
      spyOn(Model.prototype, 'create').and.callThrough();

      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "firstName": "Nick",
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
        expect(model.create.calls.mostRecent().args[1].url).toEqual(this.collection.url());
      });
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
          "firstName": "Nick",
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

      expect(this.collection.saving).toBeTruthy();

      // Fast-forward until all timers have been executed
      jest.runOnlyPendingTimers();

      expect(this.collection.saving).toBeFalsy();
    });

    it('Sets the "creating" label to falsy after the model.create method fails', function() {
      spyOn(Model.prototype, 'create').and.callFake(function(url) {
        return {
          then: function(cb) {
            return {
              catch: function(cb) {
                setTimeout(() => {
                  cb.call(null, {
                    status: 500
                  });
                });

                return this;
              }
            }
          }
         }
      });

      this.collection = new Collection();

      this.collection.create({
        "attributes": {
          "title": "Mr",
          "firstName": "Nick",
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

      expect(this.collection.saving).toBeTruthy();

      // Fast-forward until all timers have been executed
      jest.runOnlyPendingTimers();

      expect(this.collection.saving).toBeFalsy();
    });
  });
});