//imports
const recognize = require("./modules/recognize");
//const
const RECORD_TIME = 5000;

//var
var elMic;
var elMicMessage;
var elNotification;

var mediaRecorderRef;
var wavObject;
// init
var init = () => {
	initilizeDomRefferences();
	setupEventListeners();
};

// intializeDomRefferences
var initilizeDomRefferences = () => {
	elMic = document.querySelector(".micButton");
	elPlayer = document.querySelector(".player");
	elMicMessage = document.querySelector(".micMessage");
	elNotification = document.querySelector(".notification");
};

// setupEventListeners
var setupEventListeners = () => {
	elMic.addEventListener("click", record);
};

// event listeners

// listener record
var record = (event) => {
	navigator.mediaDevices
		.getUserMedia({ audio: true, video: false })
		.then(handleSuccess)
		.catch((e) => {
			alert(e);

			elMicMessage.innerHTML = "did not find device";
		});
	setTimeout(() => {
		mediaRecorderRef.stop();
	}, RECORD_TIME);
};

const handleSuccess = function (stream) {
	const options = { mimeType: "audio/webm" };
	const recordedChunks = [];
	let mediaRecorder = new MediaRecorder(stream, options);

	mediaRecorder.addEventListener("dataavailable", function (e) {
		if (e.data.size > 0) {
			recordedChunks.push(e.data);
		}
	});

	mediaRecorder.addEventListener("stop", function () {
		wavObject = new Blob(recordedChunks, { type: "audio/mp3" });
		recognize(wavObject, notify);
	});
	mediaRecorderRef = mediaRecorder;
	mediaRecorder.start();
};

// util

// unfocus
var unfocus = (element) => {
	if (element != null) {
		element.blur();
	}
};
//notify
var notify = (response) => {
	unfocus(elMic);
	if (response == null || response.result == null) {
		elNotification.innerHTML = `
        <div class="notificationBody">
					<div class="notificationTitle">
						OOPS!
					</div>
					<div class="notificationMessage">
						Song not found!
					</div>
					
				</div>`;
	} else {
		let { title, artist, release_date } = response.result;
		elNotification.innerHTML = `
        <div class="notificationBody">
					<div class="notificationTitle">
						${title}
					</div>
					<div class="songElement">
						by ${artist}
					</div>
					<div class="songElement">
						${release_date}
					</div>
				</div>
        `;
	}
	elNotification.classList.remove("hide");
	setTimeout(() => {
		elNotification.classList.add("hide");
	}, 5000);
};
window.onload = init;
