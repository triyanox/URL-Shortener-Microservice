require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const dns = require("dns");
const { nanoid } = require("nanoid");
const urlParser = require("url");

const MONGO_URI = process.env["DB_URI"];
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});
const ShortURL = mongoose.model("ShortURL", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/shorturl/", (req, res) => {
  let original_url = req.body.url;
  let parsedUrl = dns.lookup(
    urlParser.parse(original_url).hostname,
    (error, adress) => {
      if (!adress) {
        res.json({
          error: "invalid url",
        });
      } else {
        let short_url = nanoid();
        let newURL = new ShortURL({
          original_url: original_url,
          short_url: short_url,
        });
        newURL.save((error, data) => {
          if (error) return console.error(error);
        });
        res.json({
          original_url: original_url,
          short_url: short_url,
        });
      }
    }
  );
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let short_url = req.params.short_url;

  ShortURL.findOne({ short_url: short_url }, (err, data) => {
    if (err) return console.log(err);
    res.redirect(301, data.original_url);
  });
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
