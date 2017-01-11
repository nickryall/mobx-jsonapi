const user = {
  "jsonapi": {
    "version": "1.0"
  },
  "data": {
    "id": "1",
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
    },
    "links": {
      "self": "http://localhost/api/user"
    }
  }
}

const business = {
  "jsonapi": {
    "version": "1.0"
  },
  "data": {
    "id": "1",
    "type": "companies",
    "attributes": {
      "name": "Acme Inc",
      "streetAddress": "2033 San Elijo Ave.",
      "city": "Cardiff by the Sea",
      "state": "CA",
      "zipcode": "92007",
      "country": "United States",
      "phone": "021552497",
      "subdomain": "acme",
      "primaryColor": "#005493"
    },
    "relationships": {
      "logo": {
        "data": {
          "type": "media",
          "id": "1556899"
        }
      },
      "subscription": {
        "data": {
          "type": "subscriptions",
          "id": "1"
        }
      },
      "users": {
        "meta": {
          "total_records": 1
        },
        "data": [
          {
            "type": "users",
            "id": "1"
          }
        ]
      }
    },
    "links": {
      "self": "http://localhost/api/company"
    }
  }
};

export { 
  user, 
  business
};