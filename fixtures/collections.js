const users = {
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
  ],
  "included": [
    {
      id: '1',
      type: 'businesses',
      "attributes": {
        "name": "Acme Inc",
        "street_address": "2033 San Elijo Ave.",
        "city": "Cardiff by the Sea",
        "state": "CA",
        "zipcode": "92007",
        "country": "United States",
        "phone": "021552497",
        "subdomain": "acme",
        "logo": "https://mybucket.s3.amazonaws.com/logo.png",
        "pdf_header_background": "#000",
        "cloud_services": {
          "box": false,
          "dropbox": false,
          "google_drive": false
        },
        "created_at": "2016-11-02T01:54:57.548Z",
        "modified_at": "2016-11-02T01:54:57.548Z"
      },
      "relationships": {
        "subscription": {
          "data": {
            "type": "subscriptions",
            "id": "1"
          }
        },
        "users": {
          "data": [
            {
              "type": "users",
              "id": "1"
            }
          ]
        }
      }
    },
    {
      id: '2',
      type: 'businesses',
      "attributes": {
        "name": "Web Inc",
        "street_address": "59 Rua Road.",
        "city": "Auckland",
        "state": "Auckland",
        "zipcode": "0602",
        "country": "New Zealand",
        "phone": "021552497",
        "subdomain": "webinc",
        "logo": "https://mybucket.s3.amazonaws.com/logo.png",
        "pdf_header_background": "#000",
        "cloud_services": {
          "box": false,
          "dropbox": false,
          "google_drive": false
        },
        "created_at": "2016-11-02T01:54:57.548Z",
        "modified_at": "2016-11-02T01:54:57.548Z"
      },
      "relationships": {
        "subscription": {
          "data": {
            "type": "subscriptions",
            "id": "1"
          }
        },
        "users": {
          "data": [
            {
              "type": "users",
              "id": "2"
            }
          ]
        }
      }
    }
  ]
};

const businesses = {
  "meta": {
    "totalPages": 1
  },
  "links": {
    "self": "http://example.com/businesses?page[number]=1",
    "first": "http://example.com/businesses?page[number]=1&page[size]=1",
    "next": null,
    "prev": null,
    "last": null
  },
  "data": [
    {
      "id": "1",
      "type": "businesses",
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
        "subscription": {
          "data": {
            "type": "subscriptions",
            "id": "1"
          }
        },
        "users": {
          "meta": {
            "total_records": 2
          },
          "data": [
            {
              "type": "users",
              "id": "1"
            },
            {
              "type": "users",
              "id": "2"
            }
          ]
        }
      },
      "links": {
        "self": "http://localhost/api/businesses/1"
      }
    },
    {
      "id": "2",
      "type": "businesses",
      "attributes": {
        "name": "Another Company",
        "streetAddress": "59 Rua Road.",
        "city": "Auckland",
        "state": "Auckland",
        "zipcode": "0602",
        "country": "New Zealand",
        "phone": "021552497",
        "subdomain": "acme",
        "primaryColor": "#005493"
      },
      "relationships": {
        "subscription": {
          "data": {
            "type": "subscriptions",
            "id": "1"
          }
        },
        "users": {
          "data": [
            {
              "type": "users",
              "id": "2"
            },
            {
              "type": "users",
              "id": "3"
            }
          ]
        }
      },
      "links": {
        "self": "http://localhost/api/businesses/2"
      }
    }
  ]
}
    
export { 
  users, 
  businesses, 
};