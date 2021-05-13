const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const NodeWebcam = require("node-webcam");
const recorder = require("node-record-lpcm16");

const app = express();

app.set("view engine", "ejs");

mongoose.connect(
  "mongodb+srv://sid:sid@cluster0.skejf.mongodb.net/AVTest?retryWrites=true&w=majority"
);
const Schema = mongoose.Schema;

imgSchema = new Schema({
  fname: { type: String, required: true },
});
const Image = mongoose.model("Image", imgSchema);

audioSchema = new Schema({
  fname: { type: String, required: true },
});
const Audio = mongoose.model("Audio", audioSchema);

// ****************************************************************************************************
let opts = {
  width: 1280,
  height: 720,
  quality: 100,
  frames: 30,
  delay: 0,
  saveShots: true,
  output: "jpeg",
  device: 1,
  callbackReturn: "location",
  verbose: false,
};

const webcam = NodeWebcam.create(opts);
const ImageCapture = (img) => {
  webcam.capture(`images/${img}`, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(data);
    const img = new Image({
      fname: data,
    });
    img
      .save()
      .then((result) => console.log("Image In The DataBase"))
      .catch((err) => console.log(err));
  });
};

// ****************************************************************************************************

const record_audio = (fname) => {
  const filePath = path.join("audio", `${fname}.wav`);

  const file = fs.createWriteStream(filePath, { encoding: "binary" });

  recording = recorder.record({
    sampleRate: 4800,
  });

  recording.stream().pipe(file);

  // To stop Recording destroy the file Stream itself. This works!!
  setTimeout(() => {
    file.end();
    file.on("close", () => {
      console.log("file_stream_destroyed");
      ado = new Audio({
        fname: filePath.toString(),
      });
      ado
        .save()
        .then((result) => console.log("Audio Has Been Logged In the DataBase"))
        .catch((err) => console.log(err));
    });
  }, 5000);
};

// *******************************************************************************************************

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, function (err) {
  if (err) {
    console.log(err);
  }
  console.log("Server Has Started On Port -> 8000!");
});

app.get("/", function (req, res) {
  res.render("index", { pageTitle: "HomePage" });
});

app.get("/data", function (req, res) {
  let i = 0;
  const dataGathering = setInterval(function () {
    ImageCapture(i);
    record_audio(i);
    i++;
  }, 12000);

  //End the dataGathering function after 30 seconds. Change this later to use test duration time.
  setTimeout(() => {
    clearInterval(dataGathering);
  }, 100000);

  res.render("index", { pageTitle: "Data_Gathering" });
});
