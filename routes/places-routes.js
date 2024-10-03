const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.delete("/:pid", placesControllers.deletePlace);

router.post("/", 
            [
                check("title").not().isEmpty(),
                check("address").not().isEmpty(),
                check("description").isLength({ min: 5 })
            ]
            ,placesControllers.createPlace);

router.patch("/:pid", placesControllers.updatePlace);

module.exports = router;
