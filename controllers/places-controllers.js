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

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    //find the place by place id from the MongoDB
    try{
      place = await Place.findById(placeId);
    }catch(err){
      const error = new HttpError("Something went wrong, could not delete the place", 500);
      return next(error);
    }

    //Display error message if place doesn't exist for the provided place id
    if(!place){
      const error = new HttpError("Could not find the place for the provided Place ID.", 404);
      return next(error);
    }

    //Delete the place information from MongoDB if it exist
    try{
      await place.deleteOne();
    }catch(err){
      const error = new HttpError("Something went wrong, could not delete place.", 500);
      return next(error);
    }

    res.status(200).json({message: "Deleted a place."});
};

const updatePlace = async (req, res, next) => {

    //check the validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors);
      throw new HttpError("Invalid input, Please enter correct data!", 400);
    }

    //get place id, title and description from the user
    const placeId = req.params.pid;
    const { title, description } = req.body;

    //get place from the MongoDB
    let place;
    try{  
      place = await Place.findById(placeId);
    }catch(err){
      const error = new HttpError("Something went wrong, could not update the place.", 500);
      return next(error);
    }

    //display the error if place doesn't exist into the database for the provided id
    if(!place){
      return next(new HttpError("Could not find the place for the provided place id", 404));
    }

    //updated the title and description in the place object
    place.title = title;
    place.description = description;

    //save the updated information into the MongoDB
    try{
      await place.save();
    }catch(err){
      return next(new HttpError("Something went wrong, could not update the place.", 500));
    }

    res.status(200).json({place : place.toObject({ getters: true })});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
