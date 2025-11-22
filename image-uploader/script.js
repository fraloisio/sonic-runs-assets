import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------------
  // TOGGLE: turn fake mode on/off
  // ----------------------------------------------
  const FAKE_MODE = false; // ← set true/false manually

  // Optional placeholder assets ONLY used when FAKE_MODE = true
  const FAKE_AUDIO = "fake/fake-audio.mp3";
  const FAKE_METADATA = "fake/fake-metadata.txt";

  // ----------------------------------------------
  // DOM elements
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
  // Helper: switch UI screens
  // ----------------------------------------------
  function show(screen) {
    screenUpload.classList.remove("active");
    screenLoading.classList.remove("active");
    screenSuccess.classList.remove("active");
    screenError.classList.remove("active");
    screen.classList.add("active");
  }

  // ----------------------------------------------
  // Helper: normalize API outputs to usable URLs
  // ----------------------------------------------
  function toUrl(output) {
    if (!output) return "";
    if (typeof output === "string") return output;

    // Common shapes returned by Gradio client
    if (output.url) return output.url;
    if (output.path) return output.path;
    if (output.name) return output.name;
    if (output.orig_name) return output.orig_name;

    // Blob/File
    if (output instanceof Blob || output instanceof File) {
      return URL.createObjectURL(output);
    }

    if (output.data && (output.data instanceof Blob)) {
      return URL.createObjectURL(output.data);
    }

    return "";
  }

  // ----------------------------------------------
  // Main click: GENERATE AUDIO
  // ----------------------------------------------
  btnGenerate.addEventListener("click", async () => {

    if (!fileInput.files.length) {
      alert("Please upload an image first.");
      return;
    }

    show(screenLoading);

    // ---------- FAKE MODE ----------
    if (FAKE_MODE) {
      return runFakeMode();
    }

    // ---------- REAL MODE ----------
    try {
      const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";
      const client = await Client.connect(HF_SPACE);

      const file = fileInput.files[0];
      const uploadedImage = await client.upload(file); // ensure the file is available to the Space

      const result = await client.predict("/pipeline_from_image", {
        image: uploadedImage,
      });

      const [audioResult, metadataResult] = result.data;
      const audioUrl = toUrl(audioResult);
      const metadataUrl = toUrl(metadataResult);

      // Set outputs
      outputImage.src = URL.createObjectURL(file);
      audioPlayer.src = audioUrl;
      audioPlayer.load();
      metadataLink.href = metadataUrl;

      show(screenSuccess);

    } catch (err) {
      errorMessage.textContent = err?.message || "Something went wrong. Try again.";
      show(screenError);
    }
  });

  // ----------------------------------------------
  // FAKE MODE generator
  // ----------------------------------------------
  async function runFakeMode() {

    // simulate loading delay
    await new Promise((res) => setTimeout(res, 1000));

    // preview the uploaded image
    const file = fileInput.files[0];
    outputImage.src = URL.createObjectURL(file);

    audioPlayer.src = FAKE_AUDIO;
    metadataLink.href = FAKE_METADATA;

    show(screenSuccess);
  }

  // ----------------------------------------------
  // Back buttons
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
