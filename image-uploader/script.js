import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------------
  // FAKE MODE: dynamic toggle
  // ----------------------------------------------
  let FAKE_MODE = false;

  const fakeToggle = document.getElementById("fake-toggle");

  // restore last choice
  FAKE_MODE = localStorage.getItem("FAKE_MODE") === "true";
  fakeToggle.checked = FAKE_MODE;

  // update on click
  fakeToggle.addEventListener("change", () => {
    FAKE_MODE = fakeToggle.checked;
    localStorage.setItem("FAKE_MODE", FAKE_MODE);
  });

  // fake assets
  const FAKE_AUDIO = "fake/fake-audio.mp3";
  const FAKE_METADATA = "fake/fake-metadata.txt";

  // ----------------------------------------------
  // DOM ELEMENTS
  // ----------------------------------------------
  const screenUpload = document.getElementById("screen-upload");
  const screenLoading = document.getElementById("screen-loading");
  const screenSuccess = document.getElementById("screen-success");
  const screenError = document.getElementById("screen-error");

  const fileInput = document.getElementById("file-input");
  const btnGenerate = document.getElementById("btn-generate");
  const btnBack = document.getElementById("btn-back");
  const btnErrorBack = document.getElementById("btn-error-back");

  const audioPlayer = document.getElementById("audio-player");
  const metadataLink = document.getElementById("metadata-link");
  const outputImage = document.getElementById("output-image");
  const errorMessage = document.getElementById("error-message");

  // ----------------------------------------------
  // SCREEN SWITCHER
  // ----------------------------------------------
  function show(screen) {
    screenUpload.classList.remove("active");
    screenLoading.classList.remove("active");
    screenSuccess.classList.remove("active");
    screenError.classList.remove("active");
    screen.classList.add("active");
  }

  // ----------------------------------------------
  // SAFE URL NORMALIZER
  // ----------------------------------------------
  function toUrl(x) {
    if (!x) return "";
    if (typeof x === "string") return x;
    if (x.url) return x.url;
    if (x.path) return x.path;
    if (x.name) return x.name;
    if (x.data instanceof Blob) return URL.createObjectURL(x.data);
    if (x.data?.url) return x.data.url;
    if (x.data?.path) return x.data.path;
    return "";
  }
  function getFilename(file) {
    return file.name.replace(/\.[^/.]+$/, ""); // remove extension
}

// ----------------------------------------------
// MAIN BUTTON
// ----------------------------------------------
btnGenerate.addEventListener("click", async () => {

  if (!fileInput.files.length) {
    alert("Please upload an image first.");
    return;
  }

  show(screenLoading);

  // --- FAKE MODE ACTIVE ---
  if (FAKE_MODE) {
    return runFake();    // ← STOP EVERYTHING ELSE
  }

  // --- REAL API MODE ---
  try {
    const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";
    const client = await Client.connect(HF_SPACE);

    const file = fileInput.files[0];
    const uploaded = await client.upload(file);

    const result = await client.predict("/pipeline_from_image", {
      image: uploaded,
    });

    const [audioRes, metaRes] = result.data;

    audioPlayer.src = toUrl(audioRes);
    metadataLink.href = toUrl(metaRes);
    outputImage.src = URL.createObjectURL(file);
    document.getElementById("title-text").textContent = getFilename(file);
    show(screenSuccess);

  } catch (err) {
    console.error(err);
    errorMessage.textContent = err?.message || "Something went wrong.";
    show(screenError);
  }
});


// ----------------------------------------------
// FAKE MODE PIPELINE  (FIXED VERSION)
// ----------------------------------------------
async function runFake() {

  // a short delay so the spinner shows briefly (optional)
  await new Promise(r => setTimeout(r, 600));

  const file = fileInput.files[0];

  // Set fake outputs
  outputImage.src = URL.createObjectURL(file);
  audioPlayer.src = FAKE_AUDIO;
  metadataLink.href = FAKE_METADATA;
  document.getElementById("title-text").textContent = getFilename(file);

  show(screenSuccess);   // ← IMPORTANT: SWITCH SCREEN
}


  // ----------------------------------------------
  // RESET
  // ----------------------------------------------
  function resetUi() {
    outputImage.src = "";
    audioPlayer.src = "";
    audioPlayer.load();
    metadataLink.removeAttribute("href");
    fileInput.value = "";
    errorMessage.textContent = "";
  }

  btnBack.addEventListener("click", () => {
    resetUi();
    show(screenUpload);
  });

  btnErrorBack.addEventListener("click", () => {
    resetUi();
    show(screenUpload);
  });

});
