const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Centennial College",
    description: "One of the best school in GTA",
    address: "941 Progress Ave, Scarborough, ON M1G 3T8",
    location: {
      lat: 43.7852043,
      lng: -79.5330397,
    },
    creator: "omair",
  },
  {
    id: "p2",
    title: "Walmart Supercentre",
    description: "Best multi store for the shopping",
    address: "1900 Eglinton Ave E, Scarborough, ON M1L 2L9",
    location: {
      lat: 43.728196,
      lng: -79.6006049,
    },
    creator: "mutaz",
  },
  {
    id: "p3",
    title: "Sky Zone Trampoline Park",
    description: "Best sky zone park in toronto",
    address: "45 Esandar Dr, Toronto, ON M4G 4C5",
    location: {
      lat: 43.7065237,
      lng: -79.9666804,
    },
    creator: "omair",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError(
      "Could not find a place for the provided place id.",
      404
    );
  }

  res.json(place);
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    );
  }

  res.json({ places });
};

const createPlace = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
      console.log(errors);
      return next(new HttpError("Invalid input, Please enter correct data!", 400));
    }

    const { title, description, address, location, creator} = req.body;

    const newPlace = { id : uuidv4(), title, description, address, location, creator };

    DUMMY_PLACES.push(newPlace);

    res.status(201).json({place : newPlace});
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id != placeId);

    res.status(200).json({message: "Deleted a place."});
};

const updatePlace = (req, res, next) => {
    const placeId = req.params.pid;

    const { title, description } = req.body;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId)};

    const updatedElementIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[updatedElementIndex] = updatedPlace;

    res.status(200).json({place : updatedPlace});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
