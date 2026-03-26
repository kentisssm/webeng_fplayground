import { auth } from "./firebase-auth.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  ensureSeedData,
  getSiteContent,
  saveSiteContent,
  listCollection,
  createItem,
  updateItem,
  removeItem,
  uploadImage,
  showToast,
  getFriendlyErrorMessage
} from "./shared.js";

const state = {
  services: [],
  rates: [],
  gallery: []
};

function setDashboardVisible(isVisible) {
  document.getElementById("loginPanel").classList.toggle("hidden", isVisible);
  document.getElementById("dashboardSection").classList.toggle("hidden", !isVisible);
}

function populateSiteForm(site) {
  document.getElementById("heroTitleInput").value = site.heroTitle || "";
  document.getElementById("heroTaglineInput").value = site.heroTagline || "";
  document.getElementById("heroButtonTextInput").value = site.heroButtonText || "";
  document.getElementById("heroButtonUrlInput").value = site.heroButtonUrl || "";
  document.getElementById("aboutTitleInput").value = site.aboutTitle || "";
  document.getElementById("aboutMissionTitleInput").value = site.aboutMissionTitle || "";
  document.getElementById("aboutBodyInput").value = site.aboutBody || "";
  document.getElementById("aboutBodySecondInput").value = site.aboutBodySecond || "";
  document.getElementById("contactTitleInput").value = site.contactTitle || "";
  document.getElementById("addressInput").value = site.address || "";
  document.getElementById("weekdayHoursInput").value = site.weekdayHours || "";
  document.getElementById("weekendHoursInput").value = site.weekendHours || "";
  document.getElementById("emailInput").value = site.email || "";
  document.getElementById("facebookUrlInput").value = site.facebookUrl || "";
  document.getElementById("instagramUrlInput").value = site.instagramUrl || "";
  document.getElementById("heroImageInput").value = site.heroImage || "";
  document.getElementById("logoImageInput").value = site.logoImage || "";
}

function renderCollection(listId, items, type) {
  const list = document.getElementById(listId);
  list.innerHTML = items.map(item => {
    if (type === "services") {
      return `
        <article class="data-card">
          <h4>${item.title}</h4>
          <p>${item.description}</p>
          <p><strong>Image:</strong> ${item.image || "None"}</p>
          <p><strong>Sort:</strong> ${item.sort_order}</p>
          <div class="row-actions">
            <button class="btn btn-secondary" type="button" data-type="services" data-action="edit" data-id="${item.id}">Edit</button>
            <button class="btn btn-primary" type="button" data-type="services" data-action="delete" data-id="${item.id}">Delete</button>
          </div>
        </article>
      `;
    }
    if (type === "rates") {
      return `
        <article class="data-card">
          <h4>${item.title}</h4>
          <p><strong>Front:</strong> ${item.front_image || "None"}</p>
          <p><strong>Back:</strong> ${item.back_image || "None"}</p>
          <p><strong>Sort:</strong> ${item.sort_order}</p>
          <div class="row-actions">
            <button class="btn btn-secondary" type="button" data-type="rates" data-action="edit" data-id="${item.id}">Edit</button>
            <button class="btn btn-primary" type="button" data-type="rates" data-action="delete" data-id="${item.id}">Delete</button>
          </div>
        </article>
      `;
    }
    return `
      <article class="data-card">
        <h4>${item.alt_text || "Gallery Item"}</h4>
        <p><strong>Image:</strong> ${item.image}</p>
        <p><strong>Sort:</strong> ${item.sort_order}</p>
        <div class="row-actions">
          <button class="btn btn-secondary" type="button" data-type="gallery" data-action="edit" data-id="${item.id}">Edit</button>
          <button class="btn btn-primary" type="button" data-type="gallery" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");
}

function fillServiceForm(item = {}) {
  document.getElementById("serviceId").value = item.id || "";
  document.getElementById("serviceTitle").value = item.title || "";
  document.getElementById("serviceDescription").value = item.description || "";
  document.getElementById("serviceImage").value = item.image || "";
  document.getElementById("serviceSortOrder").value = item.sort_order || 1;
}

function fillRateForm(item = {}) {
  document.getElementById("rateId").value = item.id || "";
  document.getElementById("rateTitle").value = item.title || "";
  document.getElementById("rateFrontImage").value = item.front_image || "";
  document.getElementById("rateBackImage").value = item.back_image || "";
  document.getElementById("rateSortOrder").value = item.sort_order || 1;
}

function fillGalleryForm(item = {}) {
  document.getElementById("galleryId").value = item.id || "";
  document.getElementById("galleryImage").value = item.image || "";
  document.getElementById("galleryAltText").value = item.alt_text || "";
  document.getElementById("gallerySortOrder").value = item.sort_order || 1;
}

async function loadDashboardData() {
  await ensureSeedData();
  const [site, services, rates, gallery] = await Promise.all([
    getSiteContent(),
    listCollection("services"),
    listCollection("rates"),
    listCollection("gallery")
  ]);

  state.services = services;
  state.rates = rates;
  state.gallery = gallery;

  populateSiteForm(site);
  renderCollection("servicesList", services, "services");
  renderCollection("ratesList", rates, "rates");
  renderCollection("galleryList", gallery, "gallery");
}

async function handleEditOrDelete(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { type, action, id } = button.dataset;
  const item = state[type].find(entry => entry.id === id);
  if (!item && action === "edit") return;

  if (action === "edit") {
    if (type === "services") fillServiceForm(item);
    if (type === "rates") fillRateForm(item);
    if (type === "gallery") fillGalleryForm(item);
    showToast(`Loaded ${type.slice(0, -1)} for editing.`);
    return;
  }

  if (!confirm("Delete this item?")) return;
  try {
    await removeItem(type, id);
    await loadDashboardData();
    showToast("Item deleted.");
  } catch (error) {
    showToast(getFriendlyErrorMessage(error));
  }
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    setDashboardVisible(false);
    return;
  }
  try {
    await loadDashboardData();
    setDashboardVisible(true);
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const email = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Login successful.");
  } catch (error) {
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    showToast("Logged out.");
  } catch (error) {
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("uploadForm").addEventListener("submit", async event => {
  event.preventDefault();
  const file = document.getElementById("uploadInput").files[0];
  const folder = document.getElementById("uploadFolder").value;
  if (!file) {
    showToast("Choose an image first.");
    return;
  }
  try {
    const url = await uploadImage(file, folder);
    document.getElementById("uploadedImagePath").value = url;
    showToast("Image uploaded.");
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("copyUploadUrl").addEventListener("click", async () => {
  const value = document.getElementById("uploadedImagePath").value;
  if (!value) {
    showToast("No uploaded URL to copy.");
    return;
  }
  await navigator.clipboard.writeText(value);
  showToast("Copied upload URL.");
});

document.getElementById("siteForm").addEventListener("submit", async event => {
  event.preventDefault();
  const payload = {
    heroTitle: document.getElementById("heroTitleInput").value.trim(),
    heroTagline: document.getElementById("heroTaglineInput").value.trim(),
    heroButtonText: document.getElementById("heroButtonTextInput").value.trim(),
    heroButtonUrl: document.getElementById("heroButtonUrlInput").value.trim(),
    aboutTitle: document.getElementById("aboutTitleInput").value.trim(),
    aboutMissionTitle: document.getElementById("aboutMissionTitleInput").value.trim(),
    aboutBody: document.getElementById("aboutBodyInput").value.trim(),
    aboutBodySecond: document.getElementById("aboutBodySecondInput").value.trim(),
    contactTitle: document.getElementById("contactTitleInput").value.trim(),
    address: document.getElementById("addressInput").value.trim(),
    weekdayHours: document.getElementById("weekdayHoursInput").value.trim(),
    weekendHours: document.getElementById("weekendHoursInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    facebookUrl: document.getElementById("facebookUrlInput").value.trim(),
    instagramUrl: document.getElementById("instagramUrlInput").value.trim(),
    heroImage: document.getElementById("heroImageInput").value.trim(),
    logoImage: document.getElementById("logoImageInput").value.trim()
  };
  try {
    await saveSiteContent(payload);
    showToast("Website content saved.");
  } catch (error) {
    console.error(error);
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("serviceForm").addEventListener("submit", async event => {
  event.preventDefault();
  const id = document.getElementById("serviceId").value;
  const payload = {
    title: document.getElementById("serviceTitle").value.trim(),
    description: document.getElementById("serviceDescription").value.trim(),
    image: document.getElementById("serviceImage").value.trim(),
    sort_order: Number(document.getElementById("serviceSortOrder").value || 1)
  };
  try {
    await (id ? updateItem("services", id, payload) : createItem("services", payload));
    fillServiceForm();
    await loadDashboardData();
    showToast(`Service ${id ? "updated" : "created"}.`);
  } catch (error) {
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("rateForm").addEventListener("submit", async event => {
  event.preventDefault();
  const id = document.getElementById("rateId").value;
  const payload = {
    title: document.getElementById("rateTitle").value.trim(),
    front_image: document.getElementById("rateFrontImage").value.trim(),
    back_image: document.getElementById("rateBackImage").value.trim(),
    sort_order: Number(document.getElementById("rateSortOrder").value || 1)
  };
  try {
    await (id ? updateItem("rates", id, payload) : createItem("rates", payload));
    fillRateForm();
    await loadDashboardData();
    showToast(`Rate card ${id ? "updated" : "created"}.`);
  } catch (error) {
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("galleryForm").addEventListener("submit", async event => {
  event.preventDefault();
  const id = document.getElementById("galleryId").value;
  const payload = {
    image: document.getElementById("galleryImage").value.trim(),
    alt_text: document.getElementById("galleryAltText").value.trim(),
    sort_order: Number(document.getElementById("gallerySortOrder").value || 1)
  };
  try {
    await (id ? updateItem("gallery", id, payload) : createItem("gallery", payload));
    fillGalleryForm();
    await loadDashboardData();
    showToast(`Gallery item ${id ? "updated" : "created"}.`);
  } catch (error) {
    showToast(getFriendlyErrorMessage(error));
  }
});

document.getElementById("servicesList").addEventListener("click", handleEditOrDelete);
document.getElementById("ratesList").addEventListener("click", handleEditOrDelete);
document.getElementById("galleryList").addEventListener("click", handleEditOrDelete);
document.getElementById("clearServiceBtn").addEventListener("click", () => fillServiceForm());
document.getElementById("clearRateBtn").addEventListener("click", () => fillRateForm());
document.getElementById("clearGalleryBtn").addEventListener("click", () => fillGalleryForm());

