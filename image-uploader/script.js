import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

document.addEventListener("DOMContentLoaded", () => {

  const HF_SPACE = "Hope-and-Despair/Stable-Audio-freestyle-new-experiments";

  // Screen switching helper
  const show = (id) => {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  };

  // Elements
  const fileInput = document.getElementById("file-input");
  const btnGenerate = document.getElementById("btn-generate");
  const audioPlayer = document.getElementById("audio-player");
  const metadataLink = document.getElementById("metadata-link");
  const errorMessage = document.getElementById("error-message");
  const btnBack = document.getElementById("btn-back");
  const btnErrorBack = document.getElementById("btn-error-back");

  // Generate Audio Button
  btnGenerate.addEventListener("click", async () => {
    if (!fileInput.files.length) {
      alert("Please select an image first.");
      return;
    }

    show("screen-loading");

    try {
      const file = fileInput.files[0];
      const client = await Client.connect(HF_SPACE);

      const result = await client.predict("/pipeline_from_image", {
        image: file
      });

      const [audioUrl, metadataUrl] = result.data;

      // Assign outputs
      audioPlayer.src = audioUrl;
      metadataLink.href = metadataUrl;

      show("screen-success");

    } catch (err) {
      console.error("Error:", err);

      const msg =
        err?.message ||
        err?.title ||
        err?.detail ||
        "Something went wrong. Please try again.";

      errorMessage.textContent = msg;

      show("screen-error");
    }
  });

  // Buttons to return to upload screen
  btnBack.addEventListener("click", () => show("screen-upload"));
  btnErrorBack.addEventListener("click", () => show("screen-upload"));
});
