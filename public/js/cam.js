var socket = io.connect("http://localhost:8000/");

console.log("Working??");

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(gotMedia)
  .catch((error) => console.error("getUserMedia() error:", error));

function gotMedia(mediaStream) {
  const mediaStreamTrack = mediaStream.getVideoTracks()[0];
  const ImageClick = () => {
    const imageCapture = new ImageCapture(mediaStreamTrack);
    imageCapture
      .takePhoto()
      .then((blob) => {
        console.log(blob);
        blob.arrayBuffer().then((buff) => {
          console.log(buff);
          socket.emit("image", buff);
        });
      })
      .catch((error) => console.error("takePhoto() error:", error));
  };

  const dataGathering = setInterval(function () {
    ImageClick();
    // record_audio(i);
  }, 5000);

  //   console.log(imageCapture);
}
