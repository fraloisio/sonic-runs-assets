import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  const FAKE_MODE = false;

  const FAKE_AUDIO = "fake/fake-audio.mp3";
  const FAKE_METADATA = "fake/fake-metadata.txt";

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

  function show(screen) {
    screenUpload.classList.remove("active");
    screenLoading.classList.remove("active");
    screenSuccess.classList.remove("active");
    screenError.classList.remove("active");
    screen.classList.add("active");
  }

  function toUrl(x) {
    if (!x) return "";
    if (typeof x === "string") return x;
    if (x.url) return x.url;
    if (x.path) return x.path;
    if (x.name) return x.name;
    if (x.data instanceof Blob) return URL.createObjectURL(x.data);
    return "";
  }

  btnGenerate.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    show(screenLoading);

    if (FAKE_MODE) return runFakeMode(file);

    try {
      const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";
      const client = await Client.connect(HF_SPACE);

      // SEND FILE DIRECTLY — NO upload(), NO size checks
      const result = await client.predict("/pipeline_from_image", {
        image: file,
      });

      if (!result || !result.data || result.data.length < 2) {
        console.error("BAD RESULT FROM HF:", result);
        throw new Error("Invalid response from server.");
      }

      const audioUrl = toUrl(result.data[0]);
      const metadataUrl = toUrl(result.data[1]);

      if (!audioUrl || !metadataUrl) {
        throw new Error("Audio or metadata missing.");
      }

      outputImage.src = URL.createObjectURL(file);
      audioPlayer.src = audioUrl;
      audioPlayer.load();
      metadataLink.href = metadataUrl;

      show(screenSuccess);

    } catch (err) {
      console.error("GENERATION ERROR:", err);
      errorMessage.textContent = err?.message || "Something went wrong.";
      show(screenError);
    }
  });

  async function runFakeMode(file) {
    await new Promise((r) => setTimeout(r, 800));
    outputImage.src = URL.createObjectURL(file);
    audioPlayer.src = FAKE_AUDIO;
    metadataLink.href = FAKE_METADATA;
    show(screenSuccess);
  }

  function resetUi() {
    outputImage.src = "";
    audioPlayer.src = "";
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
