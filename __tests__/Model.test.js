import request from 'axios';
import Model from '../src/Model';
import Collection from '../src/Collection';
import { user, business } from '../fixtures/models';
import { toJS } from 'mobx';

describe('Model', function() {
  describe('constructor with no initial state', function() {
    beforeEach(function() {
      spyOn(Model.prototype, 'set');

      this.store = {};
      this.model = new Model({
        collection: this.store
      });
    });

    it ('Sets up a reference to the collection', function() {
      expect(this.model.collection).toEqual(this.store);
    });

    it ('Sets up an internal uuid', function() {
      expect(this.model.uuid).toBeDefined();
    });

    it ('Creates an attributes map', function() {
      expect(this.model.attributes).toBeDefined();
    });

    it ('Creates a relationships map', function() {
      expect(this.model.relationships).toBeDefined();
    });

    it ('Does not call set method as there is no initial data', function() {
      expect(this.model.set).not.toHaveBeenCalled();
    });
  });

  describe('constructor with initial state', function() {
    beforeAll(function() {
      spyOn(Model.prototype, 'set');
    });

    beforeEach(function() {
      this.store = {};
      this.model = new Model({
        collection: this.store, 
        initialState: {
          jsonapi: {
            version: 1.0
          },
          data: user.data,
          included: [
            business
          ]
        }
      });
    });

    it ('Calls set method with the initial state', function() {
      expect(this.model.set).toHaveBeenCalledWith({
        jsonapi: {
          version: 1.0
        },
        data: user.data,
        included: [
          business
        ]
      });
    });
  });

  describe('constructor with child stores', function() {
    it('Sets up references to the stores passed in through options', function() {
      this.model = new Model({
        related: {
          relatedStoreOne: {},
          relatedStoreTwo: {}
        }
      });

      expect(this.model.relatedStoreOne).toBeDefined();
      expect(this.model.relatedStoreTwo).toBeDefined();
    });

    it('Sets up reference to the "this" on the related store', function() {
      this.relatedStoreOne = {};
      this.relatedStoreTwo = {};

      class SubClassOne extends Model{};
      class SubClassTwo extends SubClassOne{};

      this.model = new SubClassTwo({
        related: {
          childStoreOne: this.relatedStoreOne,
          childStoreTwo: this.relatedStoreTwo
        }
      });

      expect(this.relatedStoreOne.subClassTwo).toEqual(this.model);
      expect(this.relatedStoreTwo.subClassTwo).toEqual(this.model);
    });
  });

  describe('type property', function() {
    beforeEach(function() {
      class SubModel extends Model {
        type = 'users';
      };

      this.model = new SubModel();
    });

    it('Provides a getter for the static "type" property', function() {
      expect(this.model.type).toEqual('users');
    });
  });

  describe('url method', function() {
    it('Returns url for the model.', function() {
      class SubModel extends Model {
        url() {
          return '/api/v1/user';
        }
      };

      this.model = new SubModel();

      expect(this.model.url()).toEqual('/api/v1/user');
    });

    it('can use the urlRoot property as a base.', function() {
      class SubModel extends Model {
        urlRoot = '/api/v1/people';
      };

      this.model = new SubModel();

      expect(this.model.url()).toEqual('/api/v1/people');

      this.model.id = 2;

      expect(this.model.url()).toEqual('/api/v1/people/2');
    });

    it('can use the collection URL or function.', function() {
      this.collection = {
        url() {
          return '/api/v1/people';
        }
      };

      this.model = new Model({
        collection: this.collection
      });

      expect(this.model.url()).toEqual('/api/v1/people');

      this.model.id = 2;

      expect(this.model.url()).toEqual('/api/v1/people/2');
    });
  });

  describe('uniqueId getter', function() {
    it('Returns the model.id property if it exists', function() {
      const model = new Model({
        collection: null,
        initialState: {
          data: {
            id: '5',
            type: 'people',
            attributes: {},
            relationships: {}
          }
        }
      });

      expect(model.uniqueId).toEqual('5');
    });

    it('Returns the uuid property if the model is new', function() {
      const model = new Model();

      expect(model.uniqueId).toEqual(model.uuid);
    });
  });

  describe('request state properties', function() {
    beforeEach(function() {
      this.model = new Model();
    });

    it('Provides observable properties for models state', function() {
      expect(this.model.fetching).toBeDefined();
      expect(this.model.saving).toBeDefined();
    });
  });

  describe('getAttribute method', function() {
    beforeEach(function() {
      this.model = new Model({
        initialState: user
      });
    });

    it('returns the value of the attribute key given', function() {
      expect(this.model.getAttribute('firstName')).toEqual('Nick');
    });
  });

  describe('getRelationship method', function() {
    beforeEach(function() {
      this.model = new Model({
        initialState: user
      });
    });

    it('returns the relationship with the name given', function() {
      expect(this.model.getRelationship('business')).toEqual({
        data: {
          id: '1',
          type: 'businesses'
        }
      });
    });
  });

  describe('setRequestLabel action', function() {
    beforeEach(function() {
      this.model = new Model();
    });

    it('Sets the give prop to the boolean value', function() {
      this.model.setRequestLabel('saving', true);
      expect(this.model.saving).toBeTruthy();
      this.model.setRequestLabel('saving', false);
      expect(this.model.saving).toBeFalsy();
    });
  });

  describe('setAttributes action', function() {
    beforeEach(function() {
      this.model = new Model();
    });

    it('Merges in the passed in attributes', function() {
      this.model.setAttributes({
        name: 'Nick',
        phone: '021552497'
      });

      expect(this.model.getAttribute('name')).toEqual('Nick');
      expect(this.model.getAttribute('phone')).toEqual('021552497');

      this.model.setAttributes({
        name: 'John',
        phone: '021552497'
      });

      expect(this.model.getAttribute('name')).toEqual('John');
      expect(this.model.getAttribute('phone')).toEqual('021552497');
    });
  });

  describe('setAttribute action', function() {
    beforeEach(function() {
      this.model = new Model();
    });

    it('Accepts a key and value as argument and merges them in as new attribute', function() {
      this.model.setAttributes({
        name: 'Nick',
        phone: '021552497'
      });

      expect(this.model.getAttribute('name')).toEqual('Nick');
      expect(this.model.getAttribute('phone')).toEqual('021552497');

      this.model.setAttribute('name', 'John');
      expect(this.model.getAttribute('name')).toEqual('John');
      this.model.setAttribute('phone', '0211912340');
      expect(this.model.getAttribute('phone')).toEqual('0211912340');
    });
  });

  describe('clearAttributes action', function() {
    beforeEach(function() {
      this.model = new Model();
    });

    it('Clears all attributes', function() {
      this.model.setAttributes({
        name: 'Nick',
        phone: '021552497'
      });

      expect(this.model.getAttribute('name')).toEqual('Nick');
      expect(this.model.getAttribute('phone')).toEqual('021552497');

      this.model.clearAttributes();

      expect(this.model.getAttribute('name')).not.toBeDefined();
      expect(this.model.getAttribute('phone')).not.toBeDefined();
    });
  });

  describe('setRelationships action', function() {
    beforeEach(function() {
      this.model = new Model({
        initialState:  user
      });
    });


    it('Merges in the passed in relationships, replacing the data for the relationships passed in.', function() {
      expect(toJS(this.model.relationships)).toEqual({
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
      });

      this.model.setRelationships({
        "projects": {
          "data": [
            {
              "type": "projects",
              "id": "2"
            },
            {
              "type": "projects",
              "id": "3"
            }
          ]
        }
      });

      expect(toJS(this.model.relationships)).toEqual({
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
              "id": "2"
            },
            {
              "type": "projects",
              "id": "3"
            }
          ]
        }
      });
    });
  });

  describe('setToOneRelationship action', function() {
    beforeEach(function() {
      this.model = new Model({
        initialState:  user
      });
    });

    it('Is a no-op if called on a to-many relationship', function() {
      expect(toJS(this.model.relationships)).toEqual({
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
      });

      this.model.setToOneRelationship('projects', "2");

      expect(toJS(this.model.relationships)).toEqual({
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
      });
    });

    it('Updates a the id of an existing to-one relationship', function() {
      expect(toJS(this.model.relationships)).toEqual({
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
      });

      this.model.setToOneRelationship('business', "2");

      expect(toJS(this.model.relationships)).toEqual({
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
              "id": "1"
            }
          ]
        }
      });
    });

    it('Creates a new toOne relationship if it doesn\'t exist', function() {
      expect(toJS(this.model.relationships)).toEqual({
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
      });

      this.model.setToOneRelationship('role', "1", "roles");

      expect(toJS(this.model.relationships)).toEqual({
        "business": {
          "data": {
            "type": "businesses",
            "id": "1"
          }
        },
        "role": {
          "data": {
            "type": "roles",
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
      });
    });
  });

  describe('clearRelationships action', function() {
    beforeEach(function() {
      this.model = new Model({
        initialState: {
          jsonapi: {
            version: 1.0
          },
          data: user
        }
      });
    });

    it('Clears all relationships', function() {
      this.model.clearRelationships();

      expect(toJS(this.model.relationships)).toEqual({});
    });
  });

  describe('fetch action', function() {
    beforeEach(function() {
      class SubModel extends Model {
        type = 'people';
        url() {
          return '/api/v1/user';
        }
      };

      this.model = new SubModel({
        initialState: user
      });
    });

    it('Sets the "fetching" request label to truthy', function() {
      this.model.fetch();

      expect(this.model.fetching).toBeTruthy();
    });

    it('Calls a get request with the models url by default', function() {
      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            cb.call(null, {
              status: 200,
              data: user
            });

            return this;
          },
          catch: ()=> {}
         }
      });

      this.model.fetch();

      expect(request.get).toHaveBeenCalledWith(this.model.url(), { params: {} });
    });

    it('Calls a get request with the url passed in though options', function() {
      spyOn(request, 'get').and.callThrough();

      this.model.fetch({
        url: '/api/users/1'
      });

      expect(request.get).toHaveBeenCalledWith('/api/users/1', { params: {} });
    });

    it('Sends the any "params" included in the options argument', function() {
      spyOn(request, 'get').and.callThrough();

      this.model.fetch({
        params: {
          included: 'businesses'
        }
      });

      expect(request.get).toHaveBeenCalledWith(this.model.url(), { params: { included: 'businesses'} });
    });

    it('Calls the set method if the request is successful', function() {
      spyOn(Model.prototype, 'set');

      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            cb.call(null, {
              status: 200,
              data: user
            });

            return this;
          },
          catch: ()=> {}
         }
      });


      this.model.fetch();

      expect(this.model.set).toHaveBeenCalledWith(user);
    });

    it('Sets the "fetching" request label to falsy if the request fails', function() {
      spyOn(Model.prototype, 'set');

      spyOn(request, 'get').and.callFake(function(url) {
        return {
          then: function(cb) {
            return {
              catch: function(cb) {
                cb.call(null, {
                  status: 404
                });

                return this;
              }
            }
          }
         }
      });

      this.model.fetch();

      expect(this.model.set).not.toHaveBeenCalled();

      expect(this.model.fetching).toBeFalsy();
    });
  });

  describe('save action', function() {
    beforeEach(function() {
      class SubModel extends Model {
        type = 'people';
        url() {
          return '/api/v1/user';
        }
      };

      this.model = new SubModel({
        initialState: user
      });
    });

    it('Sends patch request to the URL if model has an ID', function() {
      this.patch = spyOn(request, 'patch').and.callThrough();

      this.model.save();

      expect(this.patch.calls.mostRecent().args[0]).toEqual(this.model.url());
    });

    it('Sends all attributes and relationships if data argument is missing', function() {
      this.patch = spyOn(request, 'patch').and.callThrough();
      this.model.save();

      expect(this.patch.calls.mostRecent().args[1]).toEqual({
        data: {
          id: '1',
          type: 'people',
          attributes: this.model.attributes.toJS(),
          relationships: toJS(this.model.relationships)
        }
      });
    });

    it('Sends only the attributes and relationships in the data argument', function() {
      this.patch = spyOn(request, 'patch').and.callThrough();

      this.model.save({
        attributes: {
          firstName: 'Nick'
        }
      });

      expect(this.patch.calls.mostRecent().args[1]).toEqual({
        data: {
          id: '1',
          type: 'people',
          attributes: {
            firstName: 'Nick'
          }
        }
      });

      this.model.save({
        relationships: {
          business: {
            data: {
              type: 'businesses',
              id: '3'
            }
          }
        }
      });

      expect(this.patch.calls.mostRecent().args[1]).toEqual({
        data: {
          id: '1',
          type: 'people',
          relationships: {
            business: {
              data: {
                type: 'businesses',
                id: '3'
              }
            }
          }
        }
      });

      this.model.save({
        attributes: {
          firstName: 'Nick'
        },
        relationships: {
          business: {
            data: {
              type: 'businesses',
              id: '3'
            }
          }
        }
      });

      expect(this.patch.calls.mostRecent().args[1]).toEqual({
        data: {
          id: '1',
          type: 'people',
          attributes: {
            firstName: 'Nick'
          },
          relationships: {
            business: {
              data: {
                type: 'businesses',
                id: '3'
              }
            }
          }
        }
      });
    });

    it('Immediately updates the attributes on the model if the "wait" option is falsey', function() {
      this.model.save({
        attributes: {
          firstName: 'Rick'
        }
      }, {
        wait: false
      });

      expect(this.model.getAttribute('firstName')).toEqual('Rick');
    });

    it('Does not Immediately update the attributes on the model if the "wait" option is truthy', function() {
      this.model.save({
        attributes: {
          firstName: 'Rick'
        }
      }, {
        wait: true
      });

      expect(this.model.getAttribute('firstName')).toEqual('Nick');
    });

    it('Sets the "saving" request label to truthy if the  "wait" option is truthy', function() {
      this.model.save({
        attributes: {
          firstName: 'Rick'
        }
      }, {
        wait: true
      });

      expect(this.model.saving).toBeTruthy();
    });

    it('Calls the set method if the request is successful', function() {
      spyOn(Model.prototype, 'set');

      spyOn(request, 'patch').and.callFake(function(url) {
        return {
          then: function(cb) {
            cb.call(null, {
              status: 200,
              data: user
            });

            return this;
          },
          catch: ()=> {}
         }
      });


      this.model.save();

      expect(this.model.set).toHaveBeenCalledWith(user);
    });

    it('Resets the attributes to the original state if the request fails and wait option is falsy', function() {
      spyOn(Model.prototype, 'set');

      spyOn(request, 'patch').and.callFake(function(url) {
        return {
          then: function(cb) {
            return {
              catch: function(cb) {
                cb.call(null, {
                  status: 404
                });

                return this;
              }
            }
          }
         }
      });

      this.model.save({
        attributes: {
          firstName: 'John'
        }
      }, { wait: false });

      expect(this.model.set).not.toHaveBeenCalled();

      expect(this.model.getAttribute('firstName')).toEqual('Nick');
    });

    it('Resets the relationships to the original state if the request fails and wait option is falsy', function() {
      spyOn(Model.prototype, 'set');

      spyOn(request, 'patch').and.callFake(function(url) {
        return {
          then: function(cb) {
            return {
              catch: function(cb) {
                cb.call(null, {
                  status: 404
                });

                return this;
              }
            }
          }
         }
      });

      this.model.save({
        relationships: {
          business: {
            data: {
              type: 'businesses',
              id: '4'
            }
          }
        }
      }, { wait: false });

      expect(this.model.set).not.toHaveBeenCalled();

      expect(this.model.getRelationship('business').data.id).toEqual('1');
    });
  });

  describe('saveAttributes method', function() {
    it('Sends attributes and options to save action', function () {
      spyOn(Model.prototype, 'save').and.callThrough();
      
      class SubModel extends Model {
        url() {
          return '/api/v1/user';
        }
      };

      this.model = new SubModel();

      this.model.saveAttributes({
        name: 'Nick',
        email: 'nick.ryall@gmail.com'
      }, {
        wait: true
      });

      expect(this.model.save).toHaveBeenCalledWith({
        attributes: {
          name: 'Nick',
          email: 'nick.ryall@gmail.com'
        }
      }, {
        wait: true
      });
    });
  });

  describe('set action', function() {
    beforeEach(function() {
      class SubModel extends Model {
        type = 'people';
        url = '/api/v1/user';
      };

      this.model = new SubModel({
        initialState: user
      });
    });

    it('Should merge in the attributes and the relationships', function() {
      expect(this.model.getAttribute('firstName')).toEqual('Nick');

      this.model.set({
        data: {
          "id": "1",
          "type": "people",
          "attributes": {
            "title": "Mr",
            "firstName": "John",
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
                },
                {
                  "type": "projects",
                  "id": "2"
                }
              ]
            }
          }
        }
      });

      expect(this.model.getAttribute('firstName')).toEqual('John');
      expect(this.model.getAttribute('lastName')).toEqual('Ryall');
      expect(this.model.getRelationship('projects').data.length).toEqual(2);
    });

    it('Should pass any included objects onto the setIncluded method', function() {
      spyOn(Model.prototype, 'setIncluded');

      this.model.set({
        data: {
          "id": "1",
          "type": "people",
          "attributes": {
            "title": "Mr",
            "firstName": "John",
            "lastName": "Nick",
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
                },
                {
                  "type": "projects",
                  "id": "2"
                }
              ]
            }
          }
        },
        included: [
          business
        ]
      });

      expect(this.model.setIncluded).toHaveBeenCalledWith([
        business
      ]);
    });
  });

  describe('create action', function() {
    beforeEach(function() {
      class SubModel extends Model {
        type = 'people';
        url() {
          return '/api/v1/user';
        }
      };

      this.model = new SubModel({
        initialState: {
          jsonapi: {
            version: 1.0
          },
          data: {
            "attributes": {
            "title": "Mr",
            "firstName": "Nick",
            "lastName": "Ryall",
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
            }
          }
        }
      });
    });

    it('Posts all existing data if no new data is passed in', function() {
      this.post = spyOn(request, 'post').and.callThrough();
      this.model.create();

      expect(this.post.calls.mostRecent().args[1]).toEqual({
        data: {
          "type": "people",
          "attributes": {
            "title": "Mr",
            "firstName": "Nick",
            "lastName": "Ryall",
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
          }
        }
      });
    });

    it('Merges in passed in data with any existing data before posting', function() {
      this.post = spyOn(request, 'post').and.callThrough();
      this.model.create({
        attributes: {
          "phone": "0211912340"
        }
      });

      expect(this.post.calls.mostRecent().args[1]).toEqual({
        data: {
          "type": "people",
          "attributes": {
            "title": "Mr",
            "firstName": "Nick",
            "lastName": "Ryall",
            "email": "nick.ryall@gmail.com",
            "phone": "0211912340",
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
          }
        }
      });
    });

    it('Wraps passed in data as a full resource object before sending', function() {
      const data = {
        "type": "people",
        "attributes": {
          "title": "Mr",
          "firstName": "Nick",
          "lastName": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "0211912340",
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
        }
      };

      this.post = spyOn(request, 'post').and.callThrough();
      this.model.create(data);

      expect(this.post.calls.mostRecent().args[1]).toEqual({
        data: data
      });
    });

    it('Immediately sets the data on the model if "wait" option is falsy', function() {
      spyOn(request, 'post').and.callFake(function(url) {
        return {
          then: function(cb) {
            setTimeout(() => {
              cb.call(null, {
                status: 201,
                data: {
                  data: {
                    "id": "1",
                    "attributes": {
                      "title": "Mr",
                      "firstName": "Timmy",
                      "lastName": "Ryall",
                      "email": "nick.ryall@gmail.com",
                      "phone": "0211912340",
                      "created_at": "2016-11-02T01:54:57.444Z",
                      "modified_at": "2016-11-02T01:54:57.444Z"
                    }
                  }
                }
              });
            }, 1000);

            return this;
          },
          catch: ()=> {}
        }
      });

      this.model.create({
        "attributes": {
          "title": "Mr",
          "firstName": "Timmy",
          "lastName": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "0211912340",
          "created_at": "2016-11-02T01:54:57.444Z",
          "modified_at": "2016-11-02T01:54:57.444Z"
        }
      }, { wait: false });

      expect(this.model.getAttribute('firstName')).toEqual('Timmy');
    });

    it('Waits for successful response from server before updating model if "wait" option is truthy', function() {
      spyOn(request, 'post').and.callFake(function(url) {
        return {
          then: function(cb) {
            setTimeout(() => {
              cb.call(null, {
                status: 201,
                data: {
                  data: {
                    "id": "1",
                    "attributes": {
                      "title": "Mr",
                      "firstName": "Timmy",
                      "lastName": "Ryall",
                      "email": "nick.ryall@gmail.com",
                      "phone": "0211912340",
                      "created_at": "2016-11-02T01:54:57.444Z",
                      "modified_at": "2016-11-02T01:54:57.444Z"
                    }
                  }
                }
              });
            }, 1000);

            return this;
          },
          catch: ()=> {}
        }
      });

      this.model.create({
        "attributes": {
          "title": "Mr",
          "firstName": "Timmy",
          "lastName": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "0211912340",
          "created_at": "2016-11-02T01:54:57.444Z",
          "modified_at": "2016-11-02T01:54:57.444Z"
        }
      }, { wait: true });

      expect(this.model.getAttribute('firstName')).toEqual('Nick');

      // Fast-forward until all timers have been executed
      jest.runAllTimers();


      expect(this.model.getAttribute('firstName')).toEqual('Timmy');
    });

    it('Sets the saving request label to truthy if "wait" option is truthy', function() {
      this.model.create({
        "attributes": {
          "title": "Mr",
          "firstName": "Timmy",
          "lastName": "Ryall",
          "email": "nick.ryall@gmail.com",
          "phone": "0211912340",
          "created_at": "2016-11-02T01:54:57.444Z",
          "modified_at": "2016-11-02T01:54:57.444Z"
        }
      }, { wait: true });

      expect(this.model.saving).toBeTruthy();
    });

    it('sends the post request to the model url', function() {
      this.post = spyOn(request, 'post').and.callThrough();
      this.model.create();

      expect(this.post.calls.mostRecent().args[0]).toEqual(this.model.url());
    });

    it('sends the post request to the url passed in as "url" option', function() {
      this.post = spyOn(request, 'post').and.callThrough();
      this.model.create(null, {
        url: '/api/v1/people/1'
      });

      expect(this.post.calls.mostRecent().args[0]).toEqual('/api/v1/people/1');
    });

    it('calls the models set action with the response from successful save to server', function() {
      spyOn(Model.prototype, 'set');

      spyOn(request, 'post').and.callFake(function(url) {
        return {
          then: function(cb) {
            cb.call(null, {
              status: 201,
              data: user
            });

            return this;
          },
          catch: ()=> {}
         }
      });

      this.model.create();

      expect(this.model.set).toHaveBeenCalledWith(user);
    });

    it('resets to the original attributes on failed save to server if "wait" option is falsy', function() {
      spyOn(Model.prototype, 'set');

      spyOn(request, 'post').and.callFake(function(url) {
        return {
          then: function(cb) {
            return {
              catch: function(cb) {
                cb.call(null, {
                  status: 404
                });

                return this;
              }
            }
          }
         }
      });

      this.model.create({
        attributes: {
          firstName: 'John'
        }
      }, { wait: false });

      expect(this.model.set).not.toHaveBeenCalled();

      expect(this.model.getAttribute('firstName')).toEqual('Nick');
    });
  });

  describe('destroy action', function() {
    beforeEach(function() {
      class SubCollection extends Collection {
        url() {
          return '/api/v1/businesses';
        }
      };

      const newModel = new Model();

      newModel.setAttributes({
        name: 'New business'
      });

      this.collection = new SubCollection();
      this.collection.add([
        business,
        newModel
      ]);
    });

    it('should immediately remove the model from the parent collection if the model is new', function() {
      this.collection.getModelAt(1).destroy();
      expect(this.collection.length).toEqual(1);
    });

    it('should immediately remove the model from the parent collection if the "wait" option is falsy', function() {
      this.collection.getModelAt(0).destroy({ wait: false });
      expect(this.collection.length).toEqual(1);
    });

    it('should put the models back in the parent collection if the request fails', function() {
      spyOn(request, 'delete').and.callFake(function(url) {
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

      this.collection.getModelAt(0).destroy({ wait: false });
      expect(this.collection.length).toEqual(2);
      expect(this.collection.getModelAt(0).deleting).toBeFalsy();
    });

    it('Sends delete request to the URL of the model', function() {
      const deleteRequest = spyOn(request, 'delete').and.callThrough();

      this.collection.getModelAt(0).destroy();

      expect(deleteRequest).toHaveBeenCalledWith(`${this.collection.url()}/1`);
    });

    it('Sets the "deleting" requestLabel to truthy if "wait" option if truthy', function() {
      this.collection.getModelAt(0).destroy({ wait: true });
      expect(this.collection.getModelAt(0).deleting).toBeTruthy();
    });

    it('Waits until a successful response from server before removing model from collection if "wait" options is truthy', function() {
      spyOn(request, 'delete').and.callFake(function(url) {
        return {
          then: function(cb) {
            setTimeout(() => {
              cb.call(null, {
                status: 200
              });
            }, 1000);

            return this;
          },
          catch: () => {}
        }
      });

      this.collection.getModelAt(0).destroy({ wait: true });

      expect(this.collection.length).toEqual(2);
      expect(this.collection.getModelAt(0).deleting).toBeTruthy();

      // Fast-forward until all timers have been executed
      jest.runAllTimers();

      expect(this.collection.length).toEqual(1);
      expect(this.collection.getModelAt(0).deleting).toBeFalsy();
    });
  });
});