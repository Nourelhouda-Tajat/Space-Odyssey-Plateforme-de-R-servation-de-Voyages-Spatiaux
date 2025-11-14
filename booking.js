document.addEventListener("DOMContentLoaded", () => {
  // DÉCLARATION DES VARIABLES
  const destinationSelect = document.getElementById("destination");
  const accommodationContainer = document.getElementById(
    "accommodationContainer"
  );
  const priceBox = document.getElementById("totalPrice");
  const passengerContainer = document.getElementById("passengerContainer");
  const addPassengerBtn = document.getElementById("addPassengerBtn");
  const bookingForm = document.getElementById("bookingForm");
  const departureDate = document.getElementById("departureDate");

  let selectedDestination = null;
  let selectedAccommodation = null;
  let passengerCount = 1;
  let destinationsData = [];
  let accommodationsData = [];

  // Configuration date (demain à 30 jours)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);
  departureDate.min = minDate.toISOString().split("T")[0];
  departureDate.max = maxDate.toISOString().split("T")[0];

  // Afficher formulaire Solo par défaut
  passengerContainer.appendChild(createPassengerBlock(1));
  addPassengerBtn.style.display = "none";

  // FETCH DES DESTINATIONS
  fetch("destinations.json")
    .then((res) => res.json())
    .then((data) => {
      destinationsData = data.destinations;
      destinationsData.forEach((dest) => {
        const option = document.createElement("option");
        option.value = dest.id;
        option.textContent = dest.name;
        destinationSelect.appendChild(option);
      });
    });

  // FETCH DES ACCOMMODATIONS
  fetch("accommodations.json")
    .then((res) => res.json())
    .then((data) => {
      accommodationsData = data.accommodations;
    });

  // CHANGEMENT DE DESTINATION
  destinationSelect.addEventListener("change", () => {
    const id = destinationSelect.value;
    selectedDestination = destinationsData.find((d) => d.id === id);
    selectedAccommodation = null;
    accommodationContainer.innerHTML = "";

    if (!selectedDestination) {
      updateTotalPrice();
      return;
    }

    selectedDestination.accommodations.forEach((accId) => {
      const acc = accommodationsData.find((a) => a.id === accId);
      if (acc) {
        const div = document.createElement("div");
        div.className = "accommodation-card";
        div.innerHTML = `
          <h3 class="font-bold mb-2">${acc.name}</h3>
          <p class="text-sm text-gray-300">${acc.pricePerDay} $/day</p>
        `;
        div.addEventListener("click", () => {
          document
            .querySelectorAll(".accommodation-card")
            .forEach((c) => c.classList.remove("selected"));
          div.classList.add("selected");
          selectedAccommodation = acc;
          updateTotalPrice();
        });
        accommodationContainer.appendChild(div);
      }
    });
    updateTotalPrice();
  });

  // CHANGEMENT NOMBRE PASSAGERS
  document.querySelectorAll("input[name='passengers']").forEach((radio) => {
    radio.addEventListener("change", () => {
      passengerContainer.innerHTML = "";
      let count = radio.value === "Solo" ? 1 : radio.value === "Couple" ? 2 : 3;
      addPassengerBtn.style.display =
        radio.value === "Group" ? "block" : "none";

      for (let i = 1; i <= count; i++) {
        passengerContainer.appendChild(createPassengerBlock(i));
      }
      passengerCount = count;
      updateTotalPrice();
    });
  });

  // AJOUTER PASSAGER
  addPassengerBtn.addEventListener("click", () => {
    if (passengerCount < 6) {
      passengerCount++;
      passengerContainer.appendChild(createPassengerBlock(passengerCount));
      updateTotalPrice();
    } else {
      alert("Maximum 6 passengers");
    }
  });

  // CALCUL DU PRIX
  function updateTotalPrice() {
    if (!selectedDestination || !selectedAccommodation) {
      priceBox.textContent = "$0";
      return;
    }

    const days = selectedDestination.dureeVoyage;
    const total =
      selectedDestination.price +
      days * 2 * selectedAccommodation.pricePerDay * passengerCount;
    priceBox.textContent = "$" + total.toLocaleString();
  }

  // VALIDATION
  function showError(input, msg) {
    input.classList.add("error");
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains("error-message")) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message show";
      errorDiv.style.color = "#ef4444";
      errorDiv.style.fontSize = "0.875rem";
      errorDiv.style.marginTop = "0.25rem";
      input.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = msg;
    errorDiv.classList.add("show");
  }

  function hideError(input) {
    input.classList.remove("error");
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains("error-message")) {
      errorDiv.remove();
    }
  }

  function validateInput(input) {
    const value = input.value.trim();

    if (input.hasAttribute("required") && !value) {
      showError(input, "This field is required");
      return false;
    }

    if (
      input.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      showError(input, "Invalid email format");
      return false;
    }

    if (
      input.type === "tel" &&
      value &&
      !/^[0-9]{10}$/.test(value.replace(/[\s\-\(\)]/g, ""))
    ) {
      showError(input, "Phone must be 10 digits");
      return false;
    }

    hideError(input);
    return true;
  }

  // VALIDATION EN TEMPS RÉEL
  bookingForm.addEventListener("input", (e) => {
    if (
      e.target.classList.contains("form-input") ||
      e.target.classList.contains("form-textarea")
    ) {
      validateInput(e.target);
    }
  });

  // SOUMISSION
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    if (!destinationSelect.value) {
      showError(destinationSelect, "Select a destination");
      isValid = false;
    } else {
      hideError(destinationSelect);
    }

    if (!departureDate.value) {
      showError(departureDate, "Select a date");
      isValid = false;
    } else {
      hideError(departureDate);
    }

    if (!selectedAccommodation) {
      alert("Please select an accommodation");
      isValid = false;
    }

    bookingForm
      .querySelectorAll(".form-input, .form-textarea")
      .forEach((input) => {
        if (!validateInput(input)) isValid = false;
      });

    if (isValid) {
      alert("Booking confirmed! Total: " + priceBox.textContent);
      bookingForm.reset();
      passengerContainer.innerHTML = "";
      passengerContainer.appendChild(createPassengerBlock(1));
      accommodationContainer.innerHTML = "";
      selectedDestination = null;
      selectedAccommodation = null;
      passengerCount = 1;
      updateTotalPrice();
    }
  });
});

// CRÉER BLOC PASSAGER
function createPassengerBlock(num) {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="mt-10">
      <h2 class="font-orbitron text-2xl mb-4 text-glow">Personal Information ${num}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-300 mb-2 text-sm">First Name</label>
          <input type="text" class="form-input w-full px-4 py-3" placeholder="Enter first name" required>
        </div>
        <div>
          <label class="block text-gray-300 mb-2 text-sm">Last Name</label>
          <input type="text" class="form-input w-full px-4 py-3" placeholder="Enter last name" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-gray-300 mb-2 text-sm">Email</label>
          <input type="email" class="form-input w-full px-4 py-3" placeholder="Enter email" required>
        </div>
        <div>
          <label class="block text-gray-300 mb-2 text-sm">Phone</label>
          <input type="tel" class="form-input w-full px-4 py-3" placeholder="0612345678" required>
        </div>
      </div>
      <div>
        <label class="block text-gray-300 mb-2 text-sm">Special Requirements</label>
        <textarea class="form-textarea w-full px-4 py-3" rows="4" placeholder="Any special requirements..." maxlength="500"></textarea>
      </div>
    </div>
  `;
  return div;
}