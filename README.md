# Population Managment System
Population Management System allows users manage locations

### Features!

- Location can be created with the following fields:
- - name
- - maleCount
- - femaleCount
- Sub-locations can be created with the same fields above
- Locations and Sub-locations can be updated
- Locations and Sub-locations can be deleted
- When a location is deleted, all sub-locations of that location is also deleted

### Tools and Modules Required
* [NodeJs](https://nodejs.org/en) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.
* [Neo4J](https://neo4j.com/docs/operations-manual/current/installation/) - graph database management system developed by Neo4j 
* [Postman](https://www.getpostman.com/) - To test APi's
* Terminal or Command Line
* Text Editor or IDE

### Endpoints

| VERB | URL | ACTION |
| ------ | ------ | ------ |
| POST | /locations | Creates a new location |
| POST | /locations/:id/sublocations | Creates a sub-location |
| GET | /locations | Gets all locations |
| GET | /locations/:id | Gets specific location |
| GET | /locations/:id/sublocations | Gets specific location and all its sub-locations |
| PUT | /locations/:id | Edits a location |
| DELETE | /locations/:id | Deletes a location |

### PostMan
There's a postman collection `PMS Collection.postman_collection.json` with prepopulated requests for you to test the endpoints

## Setting Up

### Installing Neo4j

Follow the install instructions here.(https://neo4j.com/docs/operations-manual/current/installation/)

After installing neo4j, create a graph database for your app.

### Setting Up the application

from inside the application directory, run `npm install` to install the dependencies. Create a .env file following the conventions found in `env.sample` and add your neo4j credentials and preferred port.

## Running Tests

Test the application by runing `npm test`. This starts `jest` and runs the tests found in `graphDbClient.test.js`

## Running the Application

Start the app using `npm start`. You may make use of the included postman collection as a guide to querying the http API.

## Apiary

https://app.apiary.io/pms9

License
----

MIT

