import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

// Toggle state stored here
let FAKE_MODE = false;

// Sync checkboxes on all screens
function syncFakeCheckboxes(value) {
  document.getElementById("fake-toggle").checked = value;
  document.getElementById("fake-toggle-2").checked = value;
  document.getElementById("fake-toggle-3").checked = value;
}

function setupFakeModeToggles() {
  ["fake-toggle", "fake-toggle-2", "fake-toggle-3"].forEach(id => {
    document.getElementById(id).addEventListener("change", (e) => {
      FAKE_MODE = e.target.checked;
      syncFakeCheckboxes(FAKE_MODE);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupFakeModeToggles();

  const screenUpload = document.getElementById("screen-upload");
  const screenLoading = document.getElementById("screen-loading");
  const screenSuccess = document.getElementById("screen-success");
  const screenError = document.getElementById("screen-error");

  const fileInput = document.getElementById("file-input");
  const btnGenerate = document.getElementById("btn-generate");
  const btnBack = document.getElementById("btn-back");
  const btnErrorBack = document.getElementById("btn-error-back");

  const outputImage = document.getElementById("output-image");
  const audioPlayer = document.getElementById("audio-player");
  const metadataLink = document.getElementById("metadata-link");
  const titleText = document.getElementById("title-text");
  const errorMessage = document.getElementById("error-message");

  function show(screen) {
    screenUpload.classList.remove("active");
    screenLoading.classList.remove("active");
    screenSuccess.classList.remove("active");
    screenError.classList.remove("active");
    screen.classList.add("active");
  }

  function reset() {
    fileInput.value = "";
    outputImage.src = "";
    audioPlayer.src = "";
    metadataLink.href = "";
    titleText.textContent = "";
  }

  // Extract TITLE from metadata
  async function extractTitleFromMetadata(url) {
    try {
      const text = await fetch(url).then(r => r.text());
      const match = text.match(/^TITLE:\s*(.+)$/m);
      return match ? match[1].trim() : "Untitled Soundscape";
    } catch {
      return "Untitled Soundscape";
    }
  }

  // Fake mode
  async function runFakeMode(file) {
    await new Promise(res => setTimeout(res, 1200));

    outputImage.src = URL.createObjectURL(file);
    titleText.textContent = "Generated Soundscape";

    audioPlayer.src = "fake/fake-audio.mp3";
    metadataLink.href = "fake/fake-metadata.txt";

    show(screenSuccess);
  }

  btnGenerate.addEventListener("click", async () => {
    const selectedFile = fileInput.files?.[0];

    if (!selectedFile) {
      alert("Please choose a file");
      return;
    }

    // Store the file BEFORE screen change
    const file = selectedFile;

    show(screenLoading);

    if (FAKE_MODE) return runFakeMode(file);

    try {
      const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";
      const client = await Client.connect(HF_SPACE);

      const uploaded = await client.upload(file);

      const result = await client.predict("/pipeline_from_image", {
        image: uploaded,
      });

      const [audioRes, metaRes] = result.data;

      const audioUrl = audioRes.url || audioRes.path || "";
      const metadataUrl = metaRes.url || metaRes.path || "";

      outputImage.src = URL.createObjectURL(file);
      audioPlayer.src = audioUrl;
      metadataLink.href = metadataUrl;

      const parsedTitle = await extractTitleFromMetadata(metadataUrl);
      titleText.textContent = parsedTitle;

      show(screenSuccess);
    } catch (err) {
      errorMessage.textContent = err?.message || "Unknown error";
      show(screenError);
    }
  });

  btnBack.addEventListener("click", () => {
    reset();
    show(screenUpload);
  });

  btnErrorBack.addEventListener("click", () => {
    reset();
    show(screenUpload);
  });
});
