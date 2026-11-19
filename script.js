const submissionForm = document.querySelector("#submission-form");
const addressInput = document.querySelector("#house-address");
const consentInput = document.querySelector("#address-consent");
const formMessage = document.querySelector("#form-message");
const houseList = document.querySelector("#house-list");
const emptyMessage = document.querySelector("#empty-message");

const previewAddresses = [];

function renderAddresses() {
  houseList.replaceChildren();

  for (const address of previewAddresses) {
    const listItem = document.createElement("li");
    listItem.textContent = address;
    houseList.append(listItem);
  }

  emptyMessage.hidden = previewAddresses.length > 0;
}

submissionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const address = addressInput.value.trim();

  if (!address) {
    formMessage.textContent = "Enter a street address.";
    addressInput.focus();
    return;
  }

  if (!consentInput.checked) {
    formMessage.textContent = "Please agree before adding this address.";
    consentInput.focus();
    return;
  }

  previewAddresses.push(address);
  renderAddresses();

  formMessage.textContent =
    "Address added to this preview. It will disappear when the page is refreshed.";

  submissionForm.reset();
  addressInput.focus();
});

renderAddresses();