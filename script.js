const submissionForm = document.querySelector("#submission-form");
const addressInput = document.querySelector("#house-address");
const consentInput = document.querySelector("#address-consent");
const submitButton = submissionForm.querySelector('button[type="submit"]');
const formMessage = document.querySelector("#form-message");

const approvedHomesList = document.querySelector("#approved-houses");
const approvedEmptyMessage = document.querySelector("#approved-empty");
const trailStopsList = document.querySelector("#trail-stops");
const trailEmptyMessage = document.querySelector("#trail-empty");
const trailRoutes = document.querySelector("#trail-routes");
const trailStatus = document.querySelector("#trail-status");

const supabaseUrl = window.SUPABASE_URL;
const supabaseKey = window.SUPABASE_PUBLISHABLE_KEY;
const submissionsEndpoint = `${supabaseUrl}/rest/v1/lights_submissions`;
const selectedHomes = [];

function hasSupabaseConfig() {
  return (
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("PASTE_YOUR") &&
    !supabaseKey.includes("PASTE_YOUR")
  );
}

function createHeaders(extraHeaders = {}) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extraHeaders,
  };
}

function renderSelectedTrail() {
  trailStopsList.replaceChildren();
  trailRoutes.replaceChildren();

  for (const home of selectedHomes) {
    const item = document.createElement("li");
    item.textContent = home.address;
    trailStopsList.append(item);
  }

  trailEmptyMessage.hidden = selectedHomes.length > 0;

  if (selectedHomes.length === 0) {
    trailStatus.textContent = "";
    return;
  }

  trailStatus.textContent =
    "Stops are ordered by the order you selected them. You can uncheck a home to remove it.";

  const homesPerRoute = 4;

  for (let start = 0; start < selectedHomes.length; start += homesPerRoute) {
    const routeHomes = selectedHomes.slice(start, start + homesPerRoute);
    const previousHome = start > 0 ? selectedHomes[start - 1] : null;
    const finalHome = routeHomes[routeHomes.length - 1];

    const mapsUrl = new URL("https://www.google.com/maps/dir/");
    mapsUrl.searchParams.set("api", "1");
    mapsUrl.searchParams.set("travelmode", "driving");
    mapsUrl.searchParams.set("destination", finalHome.address);

    if (previousHome) {
      mapsUrl.searchParams.set("origin", previousHome.address);
    }

    const intermediateHomes = routeHomes.slice(0, -1);

    if (intermediateHomes.length > 0) {
      mapsUrl.searchParams.set(
        "waypoints",
        intermediateHomes.map((home) => home.address).join("|")
      );
    }

    const firstStopNumber = start + 1;
    const lastStopNumber = start + routeHomes.length;
    const link = document.createElement("a");

    link.className = "route-link";
    link.href = mapsUrl.toString();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent =
      selectedHomes.length > homesPerRoute
        ? `Open stops ${firstStopNumber}–${lastStopNumber} in Google Maps`
        : "Open your trail in Google Maps";

    trailRoutes.append(link);
  }
}

function renderApprovedHomes(homes) {
  approvedHomesList.replaceChildren();

  for (const home of homes) {
    const item = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const addressText = document.createElement("span");

    label.className = "house-option";
    checkbox.type = "checkbox";
    checkbox.value = String(home.id);
    checkbox.setAttribute("aria-label", `Add ${home.address} to your trail`);
    addressText.textContent = home.address;

    checkbox.addEventListener("change", () => {
      const selectedIndex = selectedHomes.findIndex(
        (selectedHome) => selectedHome.id === home.id
      );

      if (checkbox.checked && selectedIndex === -1) {
        selectedHomes.push(home);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        selectedHomes.splice(selectedIndex, 1);
      }

      renderSelectedTrail();
    });

    label.append(checkbox, addressText);
    item.append(label);
    approvedHomesList.append(item);
  }

  approvedEmptyMessage.hidden = homes.length > 0;

  if (homes.length === 0) {
    approvedEmptyMessage.textContent = "No approved homes are listed yet.";
  }
}

async function loadApprovedHomes() {
  approvedEmptyMessage.textContent = "Loading approved homes…";

  const query = new URLSearchParams({
    select: "id,address,created_at",
    status: "eq.approved",
    order: "created_at.asc",
  });

  try {
    const response = await fetch(`${submissionsEndpoint}?${query}`, {
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Could not load homes (${response.status}).`);
    }

    const homes = await response.json();
    renderApprovedHomes(homes);
  } catch (error) {
    approvedEmptyMessage.hidden = false;
    approvedEmptyMessage.textContent =
      "Could not load approved homes. Please try again later.";
    console.error(error);
  }
}

submissionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const address = addressInput.value.trim();

  if (!address) {
    formMessage.textContent = "Enter a street address.";
    addressInput.focus();
    return;
  }

  if (!consentInput.checked) {
    formMessage.textContent = "Please agree before submitting this address.";
    consentInput.focus();
    return;
  }

  submitButton.disabled = true;
  formMessage.textContent = "Submitting address…";

  try {
    const response = await fetch(submissionsEndpoint, {
      method: "POST",
      headers: createHeaders({
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify({
        address,
        consent: true,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Supabase submission error:", details);
      throw new Error(`Submission failed (${response.status}).`);
    }

    submissionForm.reset();
    formMessage.textContent =
      "Thanks. Your address was submitted and is awaiting review.";
    addressInput.focus();
  } catch (error) {
    formMessage.textContent =
      "Sorry, the address could not be submitted. Check the connection and try again.";
    console.error(error);
  } finally {
    submitButton.disabled = false;
  }
});

if (!hasSupabaseConfig()) {
  approvedEmptyMessage.textContent =
    "Connect Supabase to load approved homes.";
  formMessage.textContent =
    "Add your Supabase project URL and publishable key in config.js.";
} else {
  loadApprovedHomes();
}