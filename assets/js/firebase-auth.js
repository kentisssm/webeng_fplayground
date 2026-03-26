import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

setPersistence(auth, browserLocalPersistence).catch(error => {
  console.warn("Firebase auth persistence could not be set:", error);
});

analyticsSupported()
  .then(supported => {
    if (supported) getAnalytics(firebaseApp);
  })
  .catch(() => {
    // Ignore analytics errors during local development.
  });
