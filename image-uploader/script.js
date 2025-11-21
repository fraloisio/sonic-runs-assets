import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------------
  // FAKE MODE
  // ----------------------------------------------
  const FAKE_MODE = true;

  // These get converted into URLs automatically by your system
  const FAKE_AUDIO_URL = "/mnt/data/0014-serpentine-ascent-through-mist-20251121-224139.wav";
  const FAKE_METADATA_URL = "/mnt/data/0014-serpentine-ascent-through-mist-20251121-224139.txt";
  const FAKE_IMAGE_URL = "/mnt/data/0014-serpentine-ascent-through-mist-20251121-224139.png";

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
  const errorMessage = document.getElementById("error-message");

  // (Optional) if you want to show output image, add an <img> in HTML:
  // <img id="fake-output-image" />
  const fakeImageElement = document.getElementById("fake-output-image");

  // ----------------------------------------------
  // Helper for switching screens
  // ----------------------------------------------
  function show(screen) {
    screenUpload.classList.remove("active");
    screenLoading.classList.remove("active");
    screenSuccess.classList.remove("active");
    screenError.classList.remove("active");
    screen.classList.add("active");
  }

  // ----------------------------------------------
  // Main Generate Button
  // ----------------------------------------------
  btnGenerate.addEventListener("click", async () => {

    if (!fileInput.files.length) {
      alert("Please upload an image first.");
      return;
    }

    show(screenLoading);

    // ----------------------------
    // FAKE MODE SHORTCUT
    // ----------------------------
    if (FAKE_MODE) {
      return runFakePipeline();
    }

    // ----------------------------
    // REAL HUGGING FACE MODE
    // (turned off until your Space is generating again)
    // ----------------------------

    try {
      const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";
      const client = await Client.connect(HF_SPACE);
      const file = fileInput.files[0];

      const result = await client.predict("/pipeline_from_image", {
        image: file,
      });

      const [audioUrl, metadataUrl] = result.data;

      audioPlayer.src = audioUrl;
      metadataLink.href = metadataUrl;

      show(screenSuccess);

    } catch (err) {
      errorMessage.textContent = err?.message || "Something went wrong. Try again.";
      show(screenError);
    }
  });

  // ----------------------------------------------
  // FAKE PIPELINE (works instantly)
  // ----------------------------------------------
  async function runFakePipeline() {
    console.log("🎭 Fake mode active — simulating generation…");

    // delay to simulate “processing” animation
    await new Promise((res) => setTimeout(res, 1800));

    try {
      // AUDIO
      audioPlayer.src = FAKE_AUDIO_URL;

      // METADATA
      metadataLink.href = FAKE_METADATA_URL;
      metadataLink.download = "metadata.txt";

      // (Optional) IMAGE PREVIEW
      if (fakeImageElement) {
        fakeImageElement.src = FAKE_IMAGE_URL;
      }

      show(screenSuccess);

    } catch (err) {
      console.error(err);
      errorMessage.textContent = "Fake data failed to load (unlikely).";
      show(screenError);
    }
  }

  // ----------------------------------------------
  // Back Buttons
  // ----------------------------------------------
  btnBack.addEventListener("click", () => show(screenUpload));
  btnErrorBack.addEventListener("click", () => show(screenUpload));

});
