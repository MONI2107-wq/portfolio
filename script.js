// Scroll Animation

const frameCount = 240;
const canvas = document.getElementById("scrollCanvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const currentFrame = index =>
  `frames/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;

const images = [];
const img = new Image();

for (let i = 1; i <= frameCount; i++) {
  const image = new Image();
  image.src = currentFrame(i);
  images.push(image);
}

img.src = currentFrame(1);

img.onload = function () {
  context.drawImage(img, 0, 0);
};

window.addEventListener("scroll", () => {
  const scrollTop = document.documentElement.scrollTop;
  const maxScrollTop =
    document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.ceil(scrollFraction * frameCount)
  );

  requestAnimationFrame(() => updateImage(frameIndex + 1));
});

function updateImage(index) {
  context.drawImage(images[index], 0, 0);
}


// Chatbot Toggle
function toggleChat() {
  const bot = document.getElementById("chatbot");
  bot.style.display = bot.style.display === "flex" ? "none" : "flex";
}


// Gemini API Call
async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value;
  if (!message) return;

  appendMessage("You", message);
  input.value = "";

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_GEMINI_API_KEY",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        systemInstruction: {
          parts: [{
            text: `
You are a resume assistant.
STRICT RULES:
1. Answer ONLY using the information provided in this resume.
2. If the answer is not in the resume, reply:
   "This information is not available in the resume."
3. Do not generate additional content.
4. Do not assume or fabricate details.

RESUME CONTENT:
RESUME_TEXT_HERE
`
          }]
        }
      })
    }
  );

  const data = await response.json();
  const botReply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Error fetching response.";

  appendMessage("Bot", botReply);
}

function appendMessage(sender, text) {
  const chatBody = document.getElementById("chat-body");
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}
