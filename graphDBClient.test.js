var driver = require("./graphDBClient").driver;
var dbMethods = require("./graphDBClient").dbMethods;

var session;
var location;
var nestedLocation;

beforeAll(async done => {
  session = driver.session(session);
  let err = null;
  await dbMethods.deleteAllLocations(session).catch(e => (err = e));
  if (!err) {
    console.log("db cleared");
  } else {
    console.log("could not clear db", err);
  }
  driver.close();
  done();
});

beforeEach(() => (session = session ? session : driver.session()));

afterEach(() => session.close());

afterAll(async done => {
  console.log("clearing db");
  session = session ? session : driver.session();
  let err = null;
  await dbMethods.deleteAllLocations(session).catch(e => (err = e));
  if (!err) {
    console.log("db cleared");
  } else {
    console.log("could not clear db", err);
  }
  driver.close();
  done();
});

test("create a location", async done => {
  location = await dbMethods.createLocation(session, "Lagos", 10, 20);

  expect(location.name).toBe("Lagos");
  expect(location.maleCount).toBe(10);
  expect(location.femaleCount).toBe(20);
  expect(location.total).toBe(30);
  done();
});

test("create a nested location", async done => {
  nestedLocation = await dbMethods.createSublocation(
    session,
    location.id,
    "Ikeja",
    20,
    50
  );

  expect(nestedLocation.name).toBe("Ikeja");
  expect(nestedLocation.maleCount).toBe(20);
  expect(nestedLocation.femaleCount).toBe(50);
  expect(nestedLocation.total).toBe(70);
  done();
});

test("get the parent of nested location", async done => {
  let parentLocation = await dbMethods.getParentLocation(
    session,
    nestedLocation.id
  );

  expect(Object.is(parentLocation, location)).toBeTruthy;
  done();
});

test("get all locations", async done => {
  let {
    locations,
    totalMaleCount,
    totalFemaleCount,
    sumTotal
  } = await dbMethods.getAllLocations(session);

  expect(locations).toHaveLength(2);
  expect(Object.is(locations[0], location)).toBeTruthy;
  expect(Object.is(locations[1], nestedLocation)).toBeTruthy;
  expect(totalMaleCount).toBe(30);
  expect(totalFemaleCount).toBe(70);
  expect(sumTotal).toBe(100);
  done();
});

test("get a location by Id", async done => {
  let fetchedLocation = await dbMethods.getLocation(session, location.id);

  expect(Object.is(fetchedLocation, location)).toBeTruthy;
  done();
});

test("get a location by Id with its children", async done => {
  let {
    location: fetchedLocation,
    children
  } = await dbMethods.getLocationWithSublocations(session, location.id);

  expect(Object.is(fetchedLocation, location)).toBeTruthy;
  expect(children).toHaveLength(1);
  expect(Object.is(children[0], nestedLocation)).toBeTruthy;
  done();
});

test("edit a location", async done => {
  let { id, name, maleCount, femaleCount } = nestedLocation;
  let fetchedLocation = await dbMethods.updateLocation(
    session,
    id,
    "Illupeju",
    maleCount,
    femaleCount
  );

  expect(Object.is(fetchedLocation, nestedLocation)).toBeFalsy;
  expect(fetchedLocation.name).toBe("Illupeju");
  done();
});

test("delete a location and its children", async done => {
  await dbMethods.deleteLocation(session, location.id);
  let {
    locations,
    totalMaleCount,
    totalFemaleCount,
    sumTotal
  } = await dbMethods.getAllLocations(session);

  expect(locations).toHaveLength(0);
  expect(totalMaleCount).toBe(0);
  expect(totalFemaleCount).toBe(0);
  expect(sumTotal).toBe(0);
  done();
});

test("delete a non-existent location", async done => {
  await dbMethods.deleteLocation(session, 123).then(result => {
    expect(result.message).toEqual("location has been removed");
  });
  done();
});

test("edit a non-existent location", async done => {
  await dbMethods.updateLocation(session, 45, "Mende", 20, 50).then(result => {
    expect(result.message).toEqual("Location doesn't exist");
  });
  done();
});

test("edit a location with no input", async done => {
  await dbMethods.updateLocation(session, location.id).catch(error => {
    expect(error).toEqual("You must include a field to change");
  });
  done();
});

test("get a non-existent location", async done => {
  await dbMethods.getLocation(session, "333").then(result => {
    expect(result.message).toEqual("Location doesn't exist");
  });
  done();
});
