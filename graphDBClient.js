var neo4j = require('neo4j-driver').v1;
require('dotenv').config();

var neo4jUserName = process.env.NEO4JUSER || "neo4j";
var neo4jPassword = process.env.NEO4JUSERPASS || "neo4j";

console.log(neo4jUserName, neo4jPassword, 'auth');

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic(neo4jUserName, neo4jPassword));

const createLocation = (session, name, malePopulationCount, femalePopulationCount) => {
    validateNotEmpty([name, malePopulationCount, femalePopulationCount])
    return new Promise((resolve, reject) => {
        session.run(`
            CREATE (
                parent:Location{ 
                    name: {name}, 
                    male: {malePopulationCount},
                    female: {femalePopulationCount}
                }
            ) 
            RETURN parent`, {
                name,
                malePopulationCount: parseInt(malePopulationCount),
                femalePopulationCount: parseInt(femalePopulationCount)
            })
            .then(result => {
                let response = result.records[0];
                let locationData = response.get('parent')
                let location = parseLocation(locationData)
                resolve(location)
            })
            .catch(error => reject(error));
    });
}

const createSublocation = (session, parentId, name, malePopulationCount, femalePopulationCount) => {
    validateId(parentId)
    validateNotEmpty([name, malePopulationCount, femalePopulationCount])
    return new Promise((resolve, reject) => {
        session.run(`
            MATCH (parent) WHERE id(parent) = ${parentId}
                CREATE (parent)-[:SUBLOCATION]->(
                    child:Location{ 
                        name: {name},
                        male: {malePopulationCount},
                        female: {femalePopulationCount}
                    }
                )
            RETURN child`, {
                parentId,
                name,
                malePopulationCount: parseInt(malePopulationCount),
                femalePopulationCount: parseInt(femalePopulationCount)
        }).then(result => {
            let response = result.records[0];

            if(!response) resolve({});

            let locationData = response.get('child')
            let location = parseLocation(locationData)
            resolve(location)
        })
        .catch(error => reject(error));
    })
}

const getParentLocation = async (session, nodeId) => {
    validateId(nodeId)
    return new Promise((resolve, reject) => {
        session.run(`
            MATCH (parent)-[:SUBLOCATION]->(child) 
                WHERE id(child) = ${nodeId}
            RETURN parent
        `)
        .then(result => {
            let response = result.records[0];
            let locationData = response.get('parent')
            let location = parseLocation(locationData)
            resolve(location);
        })
        .catch(error => reject(error));
    })
    
}

const getAllLocations = async (session) => {
    return new Promise((resolve, reject) => {
        session.run(`MATCH (location) RETURN location`)
        .then(result => {
            
            let totalMaleCount = 0, totalFemaleCount = 0;
            let locations = [];
            
            let response = result.records

            locations = response.map(record => parseLocation(record.get('location')))

            locations.forEach(location => {
                totalMaleCount += location.maleCount;
                totalFemaleCount += location.femaleCount
            })

            resolve({
                locations,
                totalMaleCount,
                totalFemaleCount,
                sumTotal: totalMaleCount + totalFemaleCount
            });
        })
        .catch(error => reject(error));
    })
   
}

const getLocation = async (session, locationId) => {
    validateId(locationId)
    return new Promise((resolve, reject) => {
        session.run(`
            MATCH (location) WHERE id(location) = ${locationId} 
            RETURN location
        `)
        .then(result => {
            let location = {};
            let response = result.records[0];

            if(!response) resolve({});

            let locationData = response.get('location')
            location = parseLocation(locationData)

           resolve(location);
        })
        .catch(error => reject(error));
    })
}

const getLocationWithSublocations = async (session, locationId) => {
    validateId(locationId)
    return new Promise((resolve, reject) => {
        session.run(`
            MATCH (parent)-[:SUBLOCATION*]->(child) 
                WHERE id(parent) = ${locationId} 
            RETURN parent, collect(child) as children
        `)
        .then(result => {
            let response = result.records[0];

            if(!response) resolve({});

            let locationData = response.get('parent')
            let location = parseLocation(locationData);
            let childrenData = response.get('children')
            let children = childrenData.map(child => parseLocation(child))
            resolve({
                location,
                children
            })
        })
        .catch(error => reject(error));
    })
}

const updateLocation = async (session, locationId, name, malePopulationCount, femalePopulationCount) => {
    validateId(locationId)
    validateAtLeastOneNotEmpty([name, malePopulationCount, femalePopulationCount])
    return new Promise((resolve, reject) => {
        session.run(`
            MATCH (location) WHERE id(location) = ${locationId}
                SET 
                    ${name ? 'location.name = {name}' : ''},
                    ${malePopulationCount ? 'location.male = {malePopulationCount}' : ''},
                    ${femalePopulationCount ? 'location.female = {femalePopulationCount}' : ''}
            RETURN location
        `, {
            name,
            malePopulationCount: parseInt(malePopulationCount),
            femalePopulationCount: parseInt(femalePopulationCount)
        })
        .then(result => {
            let response = result.records[0];

            if(!response) resolve({});

            let locationData = response.get('location')
            let location = parseLocation(locationData);
            resolve(location)
        })
        .catch(error => reject(error));
    })
}

const deleteLocation = (session, locationId) => {
    validateId(locationId)
    return new Promise((resolve, reject) => {
        session.run(`
            MATCH (parent)
            OPTIONAL MATCH (parent)-[:SUBLOCATION*]->(child) 
                WHERE id(parent) = ${locationId} 
            DETACH DELETE parent
        `)
        .then(() => {
            resolve()
        })
        .catch(error => reject(error));
    })
}

const deleteAllLocations = (session) => {
    return new Promise((resolve, reject) => {
        session.run(`
            MATCH (locations) 
            DETACH DELETE locations`)
        .then(() => {
            resolve()
        })
        .catch(error => reject({error}));
    });
}

const parseLocation = locationData => {
    let {
        identity,
        properties: {
            name,
            male,
            female
        }
    } = locationData

    // integer fields sometimes have the low key on them. currently unsure why
    let id = identity.low ? identity.low : id;
    let maleCount = male.low ? male.low : male;
    let femaleCount = female.low ? female.low : female;
    return {
        id,
        name,
        maleCount,
        femaleCount,
        total: parseInt(maleCount) + parseInt(femaleCount)
    }
}

const validateId = (id) => {
    if (!typeof (id) === 'number' || id < 0) throw "invalid Id"
}

const validateAtLeastOneNotEmpty = fields => {
    let empty = true;
    fields.forEach(field => {
        if (field) empty = false
    })
    if (empty) throw 'You must include a field to change'
}

const validateNotEmpty = fields => {
    var missing = false;
    fields.forEach(field => {
        if (!field) empty = true
    })
    if (missing) throw 'All fields must be filled'
}

module.exports = {
    driver,
    dbMethods: {
        createLocation,
        createSublocation,
        getParentLocation,
        getAllLocations,
        getLocation,
        getLocationWithSublocations,
        updateLocation,
        deleteLocation,
        deleteAllLocations
    }
}