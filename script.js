console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currfolder;

// Convert seconds → mm:ss
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from folder
async function main(folder) {
  currfolder = folder;

  let a = await fetch(`http://127.0.0.1:5500/songs/${currfolder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let links = div.getElementsByTagName("a");
  let songList = [];

  for (let i = 0; i < links.length; i++) {
    let href = links[i].getAttribute("href");

    if (href && href.endsWith(".mp3")) {
      songList.push(decodeURIComponent(href.split(`/${currfolder}/`)[1]));
    }
  }

  return songList;
}

//  NEW: reusable render function
function renderSongs() {
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="img/music.svg">
        <div class="info">
            <div>${song}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg">
        </div>
      </li>`;
  }

  // Attach click events
  Array.from(document.querySelectorAll(".songList li")).forEach(li => {
    li.addEventListener("click", () => {
      let track = li.querySelector(".info div").innerHTML.trim();
      playMusic(track);
    });
  });
}

// Play music
const playMusic = (track, pause = false) => {
  currentSong.src = `/songs/${currfolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = track || "No song selected";
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Main function
async function songInfo() {

  songs = await main("ncs");
  playMusic(songs[0], true);

  renderSongs(); // ✅ replaced duplicate code

  // Play / Pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Time update
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    if (currentSong.duration) {
      document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }
  });

  // Seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());

    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());

    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume
  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  // Load playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(card => {
    card.addEventListener("click", async () => {

      let folder = card.dataset.folder;

      songs = await main(folder);

      renderSongs();              // ✅ reused
       if (songs.length > 0) {
      playMusic(songs[0]);   // ✅ now it PLAYS automatically
    }
    });
  });

//Add event listener to mute the track
  document.querySelector(".volumn>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("img/volumn.svg")){
            e.target.src = e.target.src.replace("img/volumn.svg", "img/mute.svg")
            currentSong.volumn = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volumn.svg")
            currentSong.volumn = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}

// Run
songInfo();