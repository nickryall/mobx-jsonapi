# Mobx JSON:API 

Mobx Collection and Model classes for working with a JSON:API compliant API. 

http://jsonapi.org

## Collection Examples

```js
import { Collection, Model } from 'mobx-jsonapi';
import { observer } from 'mobx-react'

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
          "self": "http://localhost/api/users/1"
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
          "self": "http://localhost/api/users/2"
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
users.remove(users.getModelAt(0))

users.length // 2

```

## Model Examples

