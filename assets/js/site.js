import {
  ensureSeedData,
  getSiteContent,
  listCollection,
  setImage,
  setLink,
  openModal,
  closeModal,
  fallbackImage
} from "./shared.js";

function renderServices(services) {
  const grid = document.getElementById("servicesGrid");
  grid.innerHTML = services.map(service => `
    <article class="card service-card">
      <img class="service-image" src="${service.image || fallbackImage}" alt="${service.title}" />
      <div class="card-body">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      </div>
    </article>
  `).join("");
}

function renderRates(rates) {
  const grid = document.getElementById("ratesGrid");
  grid.innerHTML = rates.map(rate => `
    <article class="flip-card" data-rate-id="${rate.id}">
      <div class="flip-card-inner">
        <div class="flip-face flip-front">
          ${rate.front_image ? `<img src="${rate.front_image}" alt="${rate.title} front" />` : `<div class="flip-placeholder"><div><h3>${rate.title}</h3><p>Upload a front image from the admin dashboard.</p></div></div>`}
        </div>
        <div class="flip-face flip-back">
          ${rate.back_image ? `<img src="${rate.back_image}" alt="${rate.title} back" />` : `<div class="flip-placeholder"><div><h3>${rate.title}</h3><p>Upload a back image from the admin dashboard.</p></div></div>`}
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".flip-card").forEach(card => {
    card.addEventListener("click", () => card.classList.toggle("is-flipped"));
  });
}

function renderGallery(items) {
  const grid = document.getElementById("galleryGrid");
  if (!items.length) {
    grid.innerHTML = `
      <article class="card" style="grid-column: 1 / -1;">
        <div class="card-body">
          <h3>No gallery photos yet</h3>
          <p>Upload your gym photos from the admin dashboard and they will show here.</p>
        </div>
      </article>
    `;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="gallery-item" data-image="${item.image}">
      <img src="${item.image}" alt="${item.alt_text || "Gallery image"}" />
    </div>
  `).join("");

  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => openModal(item.dataset.image));
  });
}

async function initializeSite() {
  try {
    await ensureSeedData();
    const [site, services, rates, gallery] = await Promise.all([
      getSiteContent(),
      listCollection("services"),
      listCollection("rates"),
      listCollection("gallery")
    ]);

    document.getElementById("heroTitle").textContent = site.heroTitle;
    document.getElementById("heroTagline").textContent = site.heroTagline;
    document.getElementById("heroButton").textContent = site.heroButtonText;
    document.getElementById("aboutTitle").textContent = site.aboutTitle;
    document.getElementById("aboutMissionTitle").textContent = site.aboutMissionTitle;
    document.getElementById("aboutBody").textContent = site.aboutBody;
    document.getElementById("aboutBodySecond").textContent = site.aboutBodySecond;
    document.getElementById("contactTitle").textContent = site.contactTitle;
    document.getElementById("address").textContent = site.address;
    document.getElementById("weekdayHours").textContent = site.weekdayHours;
    document.getElementById("weekendHours").textContent = site.weekendHours;
    document.getElementById("email").textContent = site.email ? `Email: ${site.email}` : "";

    setLink(document.getElementById("heroButton"), site.heroButtonUrl || "#rates", "#rates", Boolean(site.heroButtonUrl));
    setLink(document.getElementById("facebookUrl"), site.facebookUrl || "#", "#", true);
    setLink(document.getElementById("instagramUrl"), site.instagramUrl || "#", "#", true);

    setImage(document.getElementById("heroImage"), site.heroImage);
    setImage(document.getElementById("logoImage"), site.logoImage);
    setImage(document.getElementById("aboutLogo"), site.logoImage);

    renderServices(services);
    renderRates(rates);
    renderGallery(gallery);
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML("afterbegin", `
      <div style="padding:1rem;background:#7d090f;color:#fff;text-align:center;">Failed to load Supabase content. Run the SQL in <strong>supabase-setup.sql</strong>, make sure the bucket name is exactly <strong>SITE-IMAGES</strong>, and confirm your tables and policies are enabled.</div>
    `);
  }
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("imageModal").addEventListener("click", event => {
  if (event.target.id === "imageModal") closeModal();
});

initializeSite();
