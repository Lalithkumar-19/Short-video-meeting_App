const socket = io("/");
const myVideo = document.createElement("video");
const videoGrid = document.getElementById("video-grid");
myVideo.muted = false;

var peer = new Peer();
const peers = {};

let myvideoSteam;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myvideoSteam = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userID) => {
      connecTONewUser(userID, stream);
    });

    let text = $("input");
    $("html").keydown((e) => {
      if (e.which == 13 && text.val() != "") {
        socket.emit("message", {msg:text.val(),name:localStorage.getItem("name")});
        text.val("");
      }
    });

    socket.on("createMessage", (obj) => {
        const {msg,name}=obj;
      $("ul").append(`<li class="message"><b>${name}</b/><br/>${msg}</li>`);
      scrollToBottom();
    });
  })
  .catch((err) => console.log(err));

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});





peer.on("open", (id) => {
  console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});




const connecTONewUser = (userID, stream) => {
  const call = peer.call(userID, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userID] = call;
};




const addVideoStream = (video, stream) => {
  video.srcObject = stream;
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
  const enabled = myvideoSteam.getAudioTracks()[0].enabled;
  if (enabled) {
    myvideoSteam.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myvideoSteam.getAudioTracks()[0].enabled = true;
  }
};




const playStop = () => {
  let enabled = myvideoSteam.getVideoTracks()[0].enabled;
  if (enabled) {
    myvideoSteam.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myvideoSteam.getVideoTracks()[0].enabled = true;
  }
};





const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
    <span>Mute</span>`;
  document.querySelector(".main__mute_button").innerHTML = html;
};




const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};




const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};




const Show_Hide_chat = () => {
    const chat = $(".main__right"); 
    const right = $(".main__left");

    if (chat.is(":visible")) {      
        chat.hide();      
        right.css("flex", 1);  // Expand the left section to full width when chat is hidden
    } else {
        chat.show();                 
        right.css("flex", 0.8);   // Reset to the original width when chat is shown again
    }
}



const LeaveMeeting=()=>{
    myVideo.remove();
    window.location.href = "/";

}