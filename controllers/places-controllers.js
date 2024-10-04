const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const getLocationForAddress = require("../util/location");
const Place = require("../models/Place");

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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  }catch(err){
    const error = new HttpError("Something went wrong, could not find a place", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided place id.",
      404
    );
    return next(error);
  }

  res.json({place: place.toObject({ getters: true })});
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;

  try{
    places = await Place.find({ creator : userId });
  }catch(err){
    const error = new HttpError("Fetching places failed, try again later", 500);
    return next(error);
  }


  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    );
  }

  res.json({ places: places.map(place => place.toObject({ getters: true})) });
};

const createPlace = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
      console.log(errors);
      return next(new HttpError("Invalid input, Please enter correct data!", 400));
    }

    const { title, description, address, creator} = req.body;

    let location;

    try {
      location = await getLocationForAddress(address);
    }catch(error){
      return next(error);
    }

    const createdPlace = new Place({
      title,
      description,
      address,
      creator,
      location,
      image : 'https://commondatastorage.googleapis.com/codeskulptor-assets/gutenberg.jpg'
    });

    try{
      await createdPlace.save();
    }catch(err){
      const error = new HttpError("Creating place failed, please try again", 500);
      return next(error);
    }

    res.status(201).json({place : createdPlace.toObject({getters: true})});
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id != placeId);

    res.status(200).json({message: "Deleted a place."});
};

const updatePlace = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
      console.log(errors);
      throw new HttpError("Invalid input, Please enter correct data!", 400);
    }

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
