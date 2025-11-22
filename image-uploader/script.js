import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------------
  // Fake Mode Toggle
  // ----------------------------------------------
  let FAKE_MODE = false;
  const fakeToggle = document.getElementById("fake-toggle");

  // restore
  FAKE_MODE = localStorage.getItem("FAKE_MODE") === "true";
  fakeToggle.checked = FAKE_MODE;

  // save on change
  fakeToggle.addEventListener("change", () => {
    FAKE_MODE = fakeToggle.checked;
    localStorage.setItem("FAKE_MODE", FAKE_MODE);
  });

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
  const titleText = document.getElementById("title-text");
  const errorMessage = document.getElementById("error-message");

  // ----------------------------------------------
  // UI helper
  // ----------------------------------------------
  function show(screen) {
    [screenUpload, screenLoading, screenSuccess, screenError]
      .forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
  }

  // ----------------------------------------------
  // Convert Gradio output → URL
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

  // ----------------------------------------------
  // Extract filename
  // ----------------------------------------------
  function getFilename(file) {
    if (!file || !file.name) return "Untitled";
    return file.name.replace(/\.[^/.]+$/, ""); // remove extension
  }

  // ----------------------------------------------
  // REAL GENERATION
  // ----------------------------------------------
  btnGenerate.addEventListener("click", async () => {

    if (!fileInput.files.length) {
      alert("Please upload an image first.");
      return;
    }

    show(screenLoading);

    const file = fileInput.files[0];

    // ----- FAKE MODE -----
    if (FAKE_MODE) {
      return runFake(file);
    }

    // ----- REAL MODE -----
    try {
      const client = await Client.connect("Hope-and-Despair/Stable-Audio-freestyle-new-experiments");

      const uploaded = await client.upload(file);

      const result = await client.predict("/pipeline_from_image", {
        image: uploaded
      });

      const [audioRes, metaRes] = result.data;

      audioPlayer.src = toUrl(audioRes);
      metadataLink.href = toUrl(metaRes);
      outputImage.src = URL.createObjectURL(file);
      titleText.textContent = getFilename(file);

      show(screenSuccess);

    } catch (err) {
      console.error(err);
      errorMessage.textContent = err?.message || "Something went wrong.";
      show(screenError);
    }
  });

  // ----------------------------------------------
  // FAKE PIPELINE
  // ----------------------------------------------
  async function runFake(file) {
    await new Promise(r => setTimeout(r, 500)); // tiny delay

    outputImage.src = URL.createObjectURL(file);
    audioPlayer.src = FAKE_AUDIO;
    metadataLink.href = FAKE_METADATA;
    titleText.textContent = getFilename(file);

    show(screenSuccess);
  }

  // ----------------------------------------------
  // Reset UI
  // ----------------------------------------------
  function resetUi() {
    outputImage.src = "";
    audioPlayer.src = "";
    audioPlayer.load();
    metadataLink.removeAttribute("href");
    fileInput.value = "";
    titleText.textContent = "";
    errorMessage.textContent = "";
  }

  btnBack.addEventListener("click", () => { resetUi(); show(screenUpload); });
  btnErrorBack.addEventListener("click", () => { resetUi(); show(screenUpload); });

});
