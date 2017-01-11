# Mobx JSON:API 

Mobx Collection and Model classes for working with a JSON:API compliant API. 

http://jsonapi.org
## Collection Examples

```js
import { Collection, Model } from 'mobx-jsonapi';

class User extends Model {}

class Users extends Collection {
  url ()  {
    return '/jsonapi/users'
  }

  model () {
    return User;
  }
}

const users = new Users({
  initialState: {
    "meta": {
      "totalPages": 1
    },
    "links": {
      "self": "http://example.com/users?page[number]=1",
      "first": "http://example.com/users?page[number]=1&page[size]=1",
      "next": null,
      "prev": null,
      "last": null
    },
    "data": [
      {
        "id": "1",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "firstName": "Nick",
          "lastName": "Ryall",
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
        },
        "links": {
          "self": "http://rakenapp/jsonapi/users/1"
        }
      },
      {
        "id": "2",
        "type": "users",
        "attributes": {
          "title": "Mr",
          "firstName": "John",
          "lastName": "Jones",
          "email": "john.jones@gmail.com",
          "phone": "021552497",
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
          "self": "http://rakenapp/jsonapi/users/2"
        }
      }
    ]
  }
});

// Get length
users.length // 2

// Get user by ID
users.getModel('1').getAttribute('firstName') // Nick

// Get user by Index
users.getModalAt(1).getAttribute('firstName') // John

// Fetch users
users.fetch({ wait: true }).then((collection, response) => {
  // Do something
}).catch((error) => {
  // Alert error
});

// Create new User
users.create({
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
    }
  }
}, { wait: true }).then((response) => {
  // Do something
}).catch((error) => {
  // Alert error
});

users.length // 3

// Remove first User
users.remove(users.getModelAt(0));

users.length // 2

```

## Model Examples

```js
import { Model } from 'mobx-jsonapi';

class User extends Model {
  url() {
    return '/jsonapi/me'
  }

  // Attributes are an observable map so can make user of mobx computed getters
  @computed get fullName() {
    return `${this.getAttribute('title')} ${this.getAttribute('firstName')} ${this.getAttribute('lastName')}`;
  }
};

const user = new User({
  initialState: {
    "data": {
      "id": "1",
      "type": "users",
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
          },
          "links": {
            "self": "http://rakenapp/jsonapi/businesses/1"
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
        "self": "http://rakenapp/jsonapi/users/1"
      }
    }
  }
});

// Get attribute
user.getAttribute('title') // Mr

// Set attribute ( Merges values )
user.setAttribute('title', 'Master') // Master

// Computed getter
user.fullName // Master Nick Ryall

// Set attributes ( Merges values )
user.setAttributes({
  title: 'Mr',
  firstName: 'Nicholas'
});

// Get relationship
user.getRelationship('business').data.id // 1
user.getRelationship('business').links.self // "http://rakenapp/jsonapi/businesses/1"

// Set relationships ( Merges values )
user.setRelationShips({
  "business": {
    "data": {
      "type": "businesses",
      "id": "2"
    },
    "links": {
      "self": "http://rakenapp/jsonapi/businesses/2"
    }
  }
});

// Save to server ( Will send all values via PATCH )
user.save(null, { wait: true }).then((response) => {
  // Do something
}).catch((error) => {
  // Alert error
});

// Set and save at same time ( Will send only changed values via PATCH )
user.save({
  attributes: {
    title: 'Mr',
    firstName: 'Nicholas'
  },
  relationships: {
    "business": {
      "data": {
        "type": "businesses",
        "id": "2"
      },
      "links": {
        "self": "http://rakenapp/jsonapi/businesses/2"
      }
    }
  }
}, { wait: true }).then((response) => {
  // Do something
}).catch((error) => {
  // Alert error
});

// Convenience method to set and save just attributes 
( Note: 'wait' option set to false for optimistic update. This is available on all CRUD methods )
user.saveAttributes({
  title: 'Mr',
  firstName: 'Nicholas'
}, { wait: false });

user.getAttribute('firstName'); // Nicholas


```
