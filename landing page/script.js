


const menuIcon = document.getElementById("menu-icon");
const navLinks = document.getElementById("nav-links");

let menuOpen = false;

menuIcon.addEventListener("click", () => {

  if (!menuOpen) {
    navLinks.classList.add("active");
    navLinks.classList.remove("closing");
    menuOpen = true;
  } else {
    navLinks.classList.add("closing");

    setTimeout(() => {
      navLinks.classList.remove("active");
      navLinks.classList.remove("closing");
    }, 300);

    menuOpen = false;
  }
});

// ================= ELEMENTS =================
const form = document.getElementById("shorten-form");
const input = document.querySelector(".link-input");
const resultsContainer = document.getElementById("link-results");
const button = document.querySelector(".shorten-btn");

// ================= ERROR MESSAGE =================
let errorMsg = document.createElement("small");
errorMsg.className = "error-message";
errorMsg.style.color = "red";
errorMsg.style.display = "block";
errorMsg.style.marginTop = "8px";
input.parentElement.appendChild(errorMsg);

// ================= LOAD SAVED LINKS =================
document.addEventListener("DOMContentLoaded", loadLinks);

// ================= FORM SUBMIT =================
form.addEventListener("submit", function (e) {
  e.preventDefault();
  handleShorten();
});

// ================= MAIN FUNCTION =================
async function handleShorten() {
  let url = input.value.trim();
  errorMsg.textContent = "";

  if (!url) {
    showError("Please add a link");
    return;
  }

  // AUTO FIX URL
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // CHECK DUPLICATES
  let links = JSON.parse(localStorage.getItem("links")) || [];
  const exists = links.find(link => link.original === url);

  if (exists) {
    showError("This link already exists");
    return;
  }

  // LOADING STATE
  button.textContent = "Shortening...";
  button.disabled = true;

  try {
    // ✅ WORKING API (NO CORS ISSUE)
    const response = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`
    );

    const data = await response.json();

    if (!data || !data.shorturl) {
      showError("Invalid URL");
      resetButton();
      return;
    }

    const linkData = {
      id: Date.now(),
      original: url,
      short: data.shorturl
    };

    saveLink(linkData);
    displayLink(linkData);

    input.value = "";

  } catch (error) {
    console.error(error);
    showError("Network error. Try again.");
  }

  resetButton();
}

// ================= ERROR =================
function showError(message) {
  errorMsg.textContent = message;
  input.style.border = "2px solid red";
}

// ================= RESET BUTTON =================
function resetButton() {
  button.textContent = "Shorten It";
  button.disabled = false;
  input.style.border = "none";
}

// ================= SAVE TO LOCAL STORAGE =================
function saveLink(link) {
  let links = JSON.parse(localStorage.getItem("links")) || [];
  links.push(link);
  localStorage.setItem("links", JSON.stringify(links));
}

// ================= LOAD LINKS =================
function loadLinks() {
  let links = JSON.parse(localStorage.getItem("links")) || [];
  links.forEach(displayLink);
}

// ================= DELETE LINK =================
function deleteLink(id) {
  let links = JSON.parse(localStorage.getItem("links")) || [];
  links = links.filter(link => link.id !== id);
  localStorage.setItem("links", JSON.stringify(links));

  renderLinks();
}

// ================= RE-RENDER =================
function renderLinks() {
  resultsContainer.innerHTML = "";
  loadLinks();
}

// ================= DISPLAY LINK =================
function displayLink(link) {

  // 🔥 FIX: ensures container exists
  if (!resultsContainer) {
    console.error("link-results container not found in HTML");
    return;
  }

  const div = document.createElement("div");
  div.classList.add("result-box");

  div.innerHTML = `
    <p class="original-link">${link.original}</p>
    <div class="short-section">
      <a href="${link.short}" target="_blank">${link.short}</a>
      <button class="copy-btn">Copy</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

  // ================= COPY =================
  const copyBtn = div.querySelector(".copy-btn");

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(link.short);

    copyBtn.textContent = "Copied!";
    copyBtn.style.background = "#3b3054";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.style.background = "#2acfcf";
    }, 2000);
  });

  // ================= DELETE =================
  const deleteBtn = div.querySelector(".delete-btn");

  deleteBtn.addEventListener("click", () => {
    deleteLink(link.id);
  });

  // ================= SHOW ON SCREEN =================
  resultsContainer.prepend(div);

  console.log("Displayed link:", link); // DEBUG
}