import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/+esm";

// Optional: set a token via devtools/localStorage to avoid hardcoding secrets
// localStorage.setItem("hf_token", "replicate-your-token-here");
const HF_TOKEN = window.HF_TOKEN || localStorage.getItem("hf_token") || null;

let app;

async function initClient() {
    try {
        app = await Client.connect(
            "Hope-and-Despair/Stable-Audio-freestyle-new-experiments",
            { hf_token: HF_TOKEN || undefined }
        );
    } catch (err) {
        console.error("Failed to init Gradio client", err);
        switchScreen("upload-screen", "error-screen");
    }
}

initClient();

document.getElementById("generateBtn").addEventListener("click", async () => {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return alert("Please upload an image.");

    if (!app) {
        alert("Still connecting to the server. Please try again in a moment.");
        return;
    }

    switchScreen("upload-screen", "loading-screen");

    try {
        const result = await app.predict("/pipeline_from_image", { image: file });

        // The HF client returns { data: [...] }
        const audioElement = document.getElementById("audioPlayer");

        const audioUrl =
            result?.data?.[0]?.url ??
            result?.data?.[0] ??
            null;

        if (!audioUrl) throw new Error("No audio returned.");

        audioElement.src = audioUrl;

        document.getElementById("statusMessage").innerHTML =
            "Your image has been transferred to the Global Bubbles Space.<br>Its echoes are now part of the archive.";

        switchScreen("loading-screen", "result-screen");

    } catch (err) {
        console.error("API error:", err);
        switchScreen("loading-screen", "error-screen");
    }
});

function switchScreen(from, to) {
    document.getElementById(from).classList.remove("active");
    document.getElementById(to).classList.add("active");
}

function resetApp() {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("upload-screen").classList.add("active");
}
