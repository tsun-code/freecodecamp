// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

// Add needed header to pass freecodecamp tests
if (!process.env.DISABLE_XORIGIN) {
  app.use(function (req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if (!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      //console.log(origin);
      res.setHeader('Access-Control-Allow-Origin', origin);
      //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// freeCodeCamp challenge - start
const dateFormat = require('dateformat');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(bodyParser.json());

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const ExerciseTrackerSchema = new Schema({
  username: { type: String, required: true, unique: true },
  log: [{
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: Date
  }]
});
// ExerciseTrackerSchema.methods.count = function () {
//   return this.log.length;
// }
const ExerciseTracker = mongoose.model("ExerciseTracker", ExerciseTrackerSchema);

app.post("/api/exercise/new-user", (req, res) => {
  let username = req.body.username;
  if (!username) return res.status(400).send("Path `username` is required.");

  ExerciseTracker.findOne({ username: username }, (err, data) => {
    if (err) return res.status(500).send("Internal Error when lookup");
    if (data) return res.status(400).send("username already taken");

    let tracker = new ExerciseTracker({ username: username });
    tracker.save((err, data) => {
      if (err) return res.status(500).send("Internal Error when save");
      res.json({ username: data.username, _id: data._id });
    });
  });
});

app.post("/api/exercise/add", (req, res) => {
  let userId = req.body.userId;
  if (!userId) return res.status(400).send("unknown _id");

  ExerciseTracker.findById(userId, (err, data) => {
    if (err) return res.status(500).send("Internal Error when lookup");
    if (!data) return res.status(400).send("unknown _id");

    let { description, duration, date } = req.body;
    let dateObj;
    if (!duration) return res.status(400).send("Path `duration` is required.");
    if (!description) return res.status(400).send("Path `description` is required.");
    if (!date) {
      dateObj = new Date();
    } else {
      dateObj = new Date(date);
    }

    data.log.push({ description, duration, date: dateObj });
    data.save((err, data) => {
      if (err) return res.status(500).send("Internal Error when save");
      res.json({ username: data.username, duration: parseInt(duration), description: description, _id: data._id, date: dateFormat(date, "ddd mmm dd yyyy") });
    });
  });
});

app.get("/api/exercise/log", (req, res) => {
  let { userId, from, to, limit } = req.query;
  ExerciseTracker.findById(userId, (err, data) => {
    if (err) return res.status(500).send("Internal Error when lookup");
    if (!data) return res.status(400).send("unknown userId");
    data.count = data.log.length;
    let resObj = {};
    resObj._id = data._id;
    resObj.username = data.username;
    resObj.count = 0;
    resObj.log = [];

    let fromDate = new Date(from);
    let toDate = new Date(to);

    for (const exercise of data.log) {
      if (fromDate != "Invalid Date" && fromDate.getTime() > exercise.date.getTime()) {
        continue;
      }
      if (toDate != "Invalid Date" && toDate.getTime() < (exercise.date.getTime() + (exercise.duration * 60 * 1000))) {
        continue;
      }
      resObj.log.push({ description: exercise.description, duration: exercise.duration, date: dateFormat(exercise.date, "ddd mmm dd yyyy") });
      resObj.count++;
      if (!isNaN(limit) && Math.floor(limit) > 0 && resObj.count >= Math.floor(limit)) {
        break;
      }
    }
    res.json(resObj);
  });

});

app.get("/api/exercise/users", (req, res) => {
  ExerciseTracker.find({}).select({ log: 0 }).exec((err, data) => {
    res.json(data);
  });
});

// freeCodeCamp challenge - end

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
