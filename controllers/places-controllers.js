const HttpError = require("../models/http-error");

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

exports.getPlaceById = getPlaceById;
