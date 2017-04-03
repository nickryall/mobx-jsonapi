const user = {
  "data": {
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
      "self": "http://rakenapp/jsonapi/user"
    }
  }
}

const business = {
  "data": {
    "id": "1",
    "type": "businesses",
    "attributes": {
      "name": "Acme Inc",
      "street_address": "98 Gilles Avenue.",
      "city": "Auckland",
      "state": "Auckland",
      "zip_code": "1023",
      "country": "New Zealand",
      "phone": "021552497",
      "subdomain": "acme",
      "primary_color": "#005493"
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
      "self": "http://rakenapp/jsonapi/company"
    }
  }
};

export { 
  user, 
  business
};