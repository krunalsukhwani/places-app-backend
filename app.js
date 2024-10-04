const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);

//middleware to handle error
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

//database name is available in the connection string
//database name: shared-places
mongoose
  .connect('mongodb+srv://comp229_403:Mlvoi7p8XhkqN6Oc@cluster0.qtp7h.mongodb.net/shared-places?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });
