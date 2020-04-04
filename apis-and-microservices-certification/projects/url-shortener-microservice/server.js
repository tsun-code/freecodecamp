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
      console.log(origin);
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
const dns = require('dns');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
//mongoose.set("useFindAndModify", false);

const Schema = mongoose.Schema;
const UrlShortenerSchema = new Schema({
  original_url: { type: String, required: true, unique: true }
});
UrlShortenerSchema.plugin(AutoIncrement, { inc_field: "short_url" });
const UrlShortener = mongoose.model("UrlShortener", UrlShortenerSchema);

app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(bodyParser.json());

app.post("/api/shorturl/new", (req, res) => {
  let fullUrl = req.body.url || "no-url";
  let stripUrl = fullUrl.replace(/^https?:\/\//i, "");
  if (stripUrl.indexOf("/") > 0) {
    stripUrl = stripUrl.slice(0,stripUrl.indexOf("/"));
  }
  // console.log("Input URL: " + fullUrl);
  // console.log("Stripped URL: " + stripUrl);

  dns.lookup(stripUrl, (err, address, family) => {
    if (err) return res.json({ error: "invalid Hostname" });

    UrlShortener.findOne({ original_url: fullUrl }, (err, data) => {
      if (err) return res.status(500).send("Internal Error");
      if (!data) {
        let urlShortener = new UrlShortener({ original_url: fullUrl });
        urlShortener.save((err, data) => {
          res.json({ original_url: data.original_url, short_url: data.short_url });
        });
      } else {
        res.json({ original_url: data.original_url, short_url: data.short_url });
      }
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  UrlShortener.findOne({short_url: req.params.short_url},(err,data) => {
    if (err || !data) return res.status(404).json({error: "No short url found for given input"});
    res.redirect(data.original_url);
  });
});


app.get("*", (req, res) => {
  res.status(404).json({ error: "invalid URL" });
});
// freeCodeCamp challenge - end

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
