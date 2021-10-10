const socket = io("/home");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/home",
  port: "3001",
});
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVedioStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      // alert(`User connected ${userId}`);
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

const muteAndUnmute = () => {
  const enabled = myVedioStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVedioStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVedioStream.getAudioTracks()[0].enabled = true;
  }
};

const playAndStop = () => {
  // console.log("object");
  let enabled = myVedioStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVedioStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVedioStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
