var express = require('express');
var bodyParser = require('body-parser');
var driver = require('./graphDBClient').driver;
var dbMethods = require('./graphDBClient').dbMethods;
require('dotenv').config();

var port = process.env.EXPRESS_PORT || 3000;

var session;

var createSession = (req, res, next) => {
    console.log('creating a db session');
    session = driver.session();
    next();
}
var closeSessionAndDriver = (req, res, next) => {
    console.log('closing driver and db session');
    session.close(); driver.close();
    next(); 
}

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// create a db session as the request comes in
app.use(createSession);

app.post('/locations', async(req, res, next) => {
    let { name, maleCount, femaleCount } = req.body;
    let location = await dbMethods.createLocation(session, name, maleCount, femaleCount).catch(err => console.log(err));
    res.status(201).send(location);
    next();
})

app.post('/locations/:id/sublocations', async(req, res, next) => {
    let parentId = req.params.id;
    let { name, maleCount, femaleCount } = req.body;
    let location = await dbMethods.createSublocation(session, parentId, name, maleCount, femaleCount).catch(err => console.log(err));
    res.status(201).send(location);
    next();
})

app.get('/locations', async(_, res, next) => {
    let locationData = await dbMethods.getAllLocations(session).catch(err => console.log(err));
    res.status(200).send(locationData);
    next();
})

app.get('/locations/:id', async(req, res, next) => {
    let id = req.params.id;
    let location = await dbMethods.getLocation(session, id).catch(err => console.log(err));
    res.status(200).send(location);
    next();
})

app.get('/locations/:id/sublocations/', async(req, res, next) => {
    let id = req.params.id;
    let locationData = await dbMethods.getLocationWithSublocations(session, id).catch(err => console.log(err));
    res.status(200).send(locationData);
    next();
})

app.put('/locations/:id', async(req, res, next) => {
    let id = req.params.id;
    let { name, maleCount, femaleCount } = req.body;
    let location = await dbMethods.updateLocation(session, id, name, maleCount, femaleCount).catch(err => console.log(err));
    res.status(200).send(location)
    next();
})

app.delete('/locations/:id', async(req, res, next) => {
    let id = req.params.id;
    await dbMethods.deleteLocation(session, id);
    res.sendStatus(204);
    next();
})

// close session and driver connection after request is done.
app.use(closeSessionAndDriver);


app.listen(port, () => console.log(`running on PORT: ${port}`));