const socket = io("/");
const myVideo = document.createElement("video");
const videoGrid = document.getElementById("video-grid");
myVideo.muted = true;

var peer = new Peer();
const peers = {};

let myvideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myvideoStream = stream;
    addVideoStream(myVideo, stream, "me");

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, call.peer);
      });
    });

    socket.on("user-connected", (userID) => {
      connectToNewUser(userID, stream);
    });

    let text = $("input");
    $("html").keydown((e) => {
      if (e.which == 13 && text.val() != "") {
        socket.emit("message", {
          msg: text.val(),
          name: localStorage.getItem("name")||"User",
        });
        text.val("");
      }
    });

    socket.on("createMessage", (obj) => {
      const { msg, name } = obj;
      $("ul").append(`<li class="message"><b>${name}</b><br/>${msg}</li>`);
      scrollToBottom();
    });
  })
  .catch((err) => console.log(err));

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();

  // Remove the corresponding video element
  const videoElement = document.querySelector(`[data-peer="${userId}"]`);
  if (videoElement) {
    videoElement.remove();
  }
});

peer.on("open", (id) => {
  console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userID, stream) => {
  const call = peer.call(userID, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, userID);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userID] = call;
};

const addVideoStream = (video, stream, userId) => {
  video.srcObject = stream;
  video.setAttribute("data-peer", userId); // Assign user ID for easy removal
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myvideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myvideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myvideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  let enabled = myvideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myvideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myvideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  document.querySelector(".main__mute_button").innerHTML = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>`;
};

const setUnmuteButton = () => {
  document.querySelector(".main__mute_button").innerHTML = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`;
};

const setPlayVideo = () => {
  document.querySelector(".main__video_button").innerHTML = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>`;
};

const setStopVideo = () => {
  document.querySelector(".main__video_button").innerHTML = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>`;
};

const Show_Hide_chat = () => {
  const chat = $(".main__right");
  const right = $(".main__left");

  if (chat.is(":visible")) {
    chat.hide();
    right.css("flex", 1);
  } else {
    chat.show();
    right.css("flex", 0.8);
  }
};

const LeaveMeeting = () => {
  // Close peer connections
  Object.values(peers).forEach((peer) => peer.close());

  // Stop all video and audio tracks
  myvideoStream.getTracks().forEach((track) => track.stop());

  // Remove video element
  myVideo.remove();

  // Redirect to home
  window.location.href = "/";
};
