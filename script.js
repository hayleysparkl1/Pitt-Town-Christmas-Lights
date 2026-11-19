const submissionForm = document.querySelector("#submission-form");
const addressInput = document.querySelector("#house-address");
const consentInput = document.querySelector("#address-consent");
const submitButton = submissionForm.querySelector('button[type="submit"]');
const formMessage = document.querySelector("#form-message");
const houseList = document.querySelector("#house-list");
const emptyMessage = document.querySelector("#empty-message");

const supabaseUrl = window.SUPABASE_URL;
const supabaseKey = window.SUPABASE_PUBLISHABLE_KEY;
const submissionsEndpoint = `${supabaseUrl}/rest/v1/lights_submissions`;

function setMessage(message) {
  formMessage.textContent = message;
}

function createHeaders(extraHeaders = {}) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extraHeaders,
  };
}

function renderAddresses(addresses) {
  houseList.replaceChildren();

  for (const submission of addresses) {
    const listItem = document.createElement("li");
    listItem.textContent = submission.address;
    houseList.append(listItem);
  }

  emptyMessage.hidden = addresses.length > 0;
}

async function loadApprovedAddresses() {
  emptyMessage.textContent = "Loading approved homes…";

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

    const addresses = await response.json();
    renderAddresses(addresses);

    if (addresses.length === 0) {
      emptyMessage.textContent = "No approved homes are listed yet.";
    }
  } catch (error) {
    emptyMessage.hidden = false;
    emptyMessage.textContent =
      "Could not load the trail right now. Please try again later.";
    console.error(error);
  }
}

submissionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const address = addressInput.value.trim();

  if (!address) {
    setMessage("Enter a street address.");
    addressInput.focus();
    return;
  }

  if (!consentInput.checked) {
    setMessage("Please agree before submitting this address.");
    consentInput.focus();
    return;
  }

  submitButton.disabled = true;
  setMessage("Submitting address…");

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
    setMessage("Thanks. Your address was submitted and is awaiting review.");
    addressInput.focus();
  } catch (error) {
    setMessage(
      "Sorry, the address could not be submitted. Check the connection and try again."
    );
    console.error(error);
  } finally {
    submitButton.disabled = false;
  }
});

if (
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl.includes("PASTE_YOUR") ||
  supabaseKey.includes("PASTE_YOUR")
) {
  setMessage("Add your Supabase project URL and publishable key in config.js.");
  emptyMessage.textContent = "Connect Supabase to load approved homes.";
} else {
  loadApprovedAddresses();
}