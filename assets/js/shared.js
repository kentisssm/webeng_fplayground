import { supabase } from "./supabase.js";
import { STORAGE_BUCKET } from "./supabase-config.js";

const fallbackSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#a00c13" offset="0%" />
      <stop stop-color="#1f1f1f" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <text x="50%" y="50%" fill="#ffffff" font-size="42" font-family="Segoe UI, Arial" text-anchor="middle">Fitness Playground</text>
</svg>
`);

export const fallbackImage = `data:image/svg+xml;charset=UTF-8,${fallbackSvg}`;

export const defaultSiteContent = {
  key: "main",
  heroTitle: "FITNESS PLAYGROUND",
  heroTagline: "Your Journey to Fitness Starts Here",
  heroButtonText: "Join Now",
  heroButtonUrl: "",
  aboutTitle: "About Us",
  aboutMissionTitle: "Our Mission",
  aboutBody: "At Fitness Playground, we help members build strength, confidence, and consistency through a welcoming training environment.",
  aboutBodySecond: "Use the admin dashboard to replace this text with your real story, location details, and branding.",
  contactTitle: "Contact Us",
  address: "Add your gym address here.",
  weekdayHours: "Mon–Fri: 6:00 AM – 10:00 PM",
  weekendHours: "Sat–Sun: 8:00 AM – 8:00 PM",
  email: "hello@fitnessplayground.com",
  facebookUrl: "https://facebook.com/",
  instagramUrl: "https://instagram.com/",
  heroImage: "",
  logoImage: ""
};

const defaultServices = [
  {
    title: "PERSONAL TRAINING",
    description: "Get one-on-one coaching tailored to your goals, form, and fitness level.",
    image: "",
    sort_order: 1
  },
  {
    title: "GROUP WORKOUTS",
    description: "Train with energy and accountability through coach-led small group sessions.",
    image: "",
    sort_order: 2
  },
  {
    title: "STRENGTH & CONDITIONING",
    description: "Build endurance, power, and mobility with structured strength programs.",
    image: "",
    sort_order: 3
  }
];


function mapSiteRowToContent(row = {}) {
  return {
    key: row.key || "main",
    heroTitle: row.hero_title || "",
    heroTagline: row.hero_tagline || "",
    heroButtonText: row.hero_button_text || "",
    heroButtonUrl: row.hero_button_url || "",
    aboutTitle: row.about_title || "",
    aboutMissionTitle: row.about_mission_title || "",
    aboutBody: row.about_body || "",
    aboutBodySecond: row.about_body_second || "",
    contactTitle: row.contact_title || "",
    address: row.address || "",
    weekdayHours: row.weekday_hours || "",
    weekendHours: row.weekend_hours || "",
    email: row.email || "",
    facebookUrl: row.facebook_url || "",
    instagramUrl: row.instagram_url || "",
    heroImage: row.hero_image || "",
    logoImage: row.logo_image || ""
  };
}

function mapSiteContentToRow(content = {}) {
  return {
    key: content.key || "main",
    hero_title: content.heroTitle || "",
    hero_tagline: content.heroTagline || "",
    hero_button_text: content.heroButtonText || "",
    hero_button_url: content.heroButtonUrl || "",
    about_title: content.aboutTitle || "",
    about_mission_title: content.aboutMissionTitle || "",
    about_body: content.aboutBody || "",
    about_body_second: content.aboutBodySecond || "",
    contact_title: content.contactTitle || "",
    address: content.address || "",
    weekday_hours: content.weekdayHours || "",
    weekend_hours: content.weekendHours || "",
    email: content.email || "",
    facebook_url: content.facebookUrl || "",
    instagram_url: content.instagramUrl || "",
    hero_image: content.heroImage || "",
    logo_image: content.logoImage || ""
  };
}

const defaultRates = [
  {
    title: "Monthly Membership",
    front_image: "",
    back_image: "",
    sort_order: 1
  },
  {
    title: "Coaching Package",
    front_image: "",
    back_image: "",
    sort_order: 2
  }
];

function normalizeError(error, fallbackMessage) {
  if (!error) return new Error(fallbackMessage);
  return error instanceof Error ? error : new Error(error.message || fallbackMessage);
}

export async function ensureSeedData() {
  const { data: siteRows, error: siteError } = await supabase
    .from("site_content")
    .select("key")
    .eq("key", "main")
    .limit(1);

  if (siteError) throw normalizeError(siteError, "Unable to read site content.");

  if (!siteRows || !siteRows.length) {
    const { error } = await supabase.from("site_content").insert(mapSiteContentToRow(defaultSiteContent));
    if (error) throw normalizeError(error, "Unable to seed site content.");
  }

  const { count: servicesCount, error: servicesError } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true });
  if (servicesError) throw normalizeError(servicesError, "Unable to read services.");
  if (!servicesCount) {
    const { error } = await supabase.from("services").insert(defaultServices);
    if (error) throw normalizeError(error, "Unable to seed services.");
  }

  const { count: ratesCount, error: ratesError } = await supabase
    .from("rates")
    .select("id", { count: "exact", head: true });
  if (ratesError) throw normalizeError(ratesError, "Unable to read rates.");
  if (!ratesCount) {
    const { error } = await supabase.from("rates").insert(defaultRates);
    if (error) throw normalizeError(error, "Unable to seed rates.");
  }
}

export async function getSiteContent() {
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("key", "main")
    .maybeSingle();

  if (error) throw normalizeError(error, "Unable to load site content.");
  return { ...defaultSiteContent, ...mapSiteRowToContent(data || {}) };
}

export async function saveSiteContent(payload) {
  const completePayload = { ...defaultSiteContent, ...payload, key: "main" };
  const { error } = await supabase.from("site_content").upsert(mapSiteContentToRow(completePayload), { onConflict: "key" });
  if (error) throw normalizeError(error, "Unable to save site content.");
}

export async function listCollection(name) {
  const { data, error } = await supabase.from(name).select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw normalizeError(error, `Unable to load ${name}.`);
  return data || [];
}

export async function createItem(name, payload) {
  const { error } = await supabase.from(name).insert(payload);
  if (error) throw normalizeError(error, `Unable to create ${name} item.`);
}

export async function updateItem(name, id, payload) {
  const { error } = await supabase.from(name).update(payload).eq("id", id);
  if (error) throw normalizeError(error, `Unable to update ${name} item.`);
}

export async function removeItem(name, id) {
  const { error } = await supabase.from(name).delete().eq("id", id);
  if (error) throw normalizeError(error, `Unable to delete ${name} item.`);
}

export async function uploadImage(file, folder = "general") {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = `${folder}/${Date.now()}-${cleanName}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) throw normalizeError(error, "Unable to upload image.");

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function setImage(element, src) {
  if (!element) return;
  const value = src || fallbackImage;
  element.src = value;
  element.classList.remove("hidden");
}

export function setLink(element, href, fallback = "#", openNewTab = false) {
  if (!element) return;
  element.href = href || fallback;
  if (openNewTab && href) {
    element.target = "_blank";
    element.rel = "noreferrer";
  }
}

export function openModal(imageUrl) {
  document.getElementById("modalImage").src = imageUrl;
  document.getElementById("imageModal").classList.add("is-open");
}

export function closeModal() {
  document.getElementById("imageModal").classList.remove("is-open");
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

export function getFriendlyErrorMessage(error) {
  const message = error?.message || "Something went wrong.";
  if (message.includes('relation "site_content" does not exist')) return "Supabase tables are not created yet. Run the SQL in supabase-setup.sql first.";
  if (message.includes("Bucket not found")) return `Storage bucket ${STORAGE_BUCKET} was not found. Make sure the bucket name is exactly ${STORAGE_BUCKET}.`;
  if (message.includes("row-level security")) return "A Supabase policy blocked the request. Use the policies in supabase-setup.sql.";
  return message;
}
