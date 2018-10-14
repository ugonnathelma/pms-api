# Population Managment System

## Why I chose a graph databse

The ability to put locations inside each other with an arbitrary amount of nesting creates
some challenges for storing and retrieving data. 

If we use a document data store we can store a nested location like this.

```
[{
    1: {
        name: 'Lagos',
        maleCount: 20,
        femaleCount: 20,
        locations: [{
            name: 'Yaba',
            maleCount: 12,
            femaleCount: 22,
            locations: [{
                name: 'Sabo',
                maleCount: 2,
                femaleCount: 9,
                locations: []
            }]
        }]
    }
}]
```

As a result if we want to find 'Sabo' we need to first look inside 'Lagos' then 'Yaba'
Querying quickly becomes inefficient and slow.

Using a graph we can represent each location as a node and the connection between them as a relationship.
This changes the retrieving of deeply nested locations from a recursive problem to a graph traversal.

Please refer to `Cypher.md` for a brief intro to the the Cypher Query Language.


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




