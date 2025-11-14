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

  // REGEX POUR VALIDATION
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPhone = /^[0-9]{10}$/;

  let selectedDestination = null;
  let selectedAccommodation = null;
  let passengerCount = 1;
  let destinationsData = [];
  let accommodationsData = [];

  // Configuration date (à partir d'aujourd'hui)
  const today = new Date();
  departureDate.min = today.toISOString().split("T")[0];

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
        option.textContent = dest.name + " - $" + dest.price.toLocaleString();
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
          <p class="text-sm text-gray-400 mb-2">${acc.shortDescription}</p>
          <p class="text-neon-cyan font-semibold">${acc.pricePerDay} $/day</p>
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

      let count = 1;
      if (radio.value === "Solo") {
        count = 1;
        addPassengerBtn.style.display = "none";
      }
      if (radio.value === "Couple") {
        count = 2;
        addPassengerBtn.style.display = "none";
      }
      if (radio.value === "Group") {
        count = 3;
        addPassengerBtn.style.display = "block";
      }

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

    // Durée fixe de 7 jours pour l'exemple
    const days = 7;
    const total =
      selectedDestination.price +
      days * selectedAccommodation.pricePerDay * passengerCount;
    priceBox.textContent = "$" + total.toLocaleString();
  }

  // VALIDATION
  function showError(input, msg) {
    input.classList.add("border-red-500");
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains("error-message")) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message text-red-400 text-sm mt-1";
      input.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = msg;
  }

  function hideError(input) {
    input.classList.remove("border-red-500");
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

    if (input.type === "email" && value && !regexEmail.test(value)) {
      showError(input, "Invalid email format");
      return false;
    }

    if (input.type === "tel" && value) {
      const cleanPhone = value.replace(/[\s\-\(\)]/g, "");
      if (!regexPhone.test(cleanPhone)) {
        showError(input, "Phone must be 10 digits");
        return false;
      }
    }

    hideError(input);
    return true;
  }

  // VALIDATION EN TEMPS RÉEL
  bookingForm.addEventListener("input", (e) => {
    if (e.target.matches(".form-input, .form-textarea")) {
      validateInput(e.target);
    }
  });

  // SAUVEGARDER BOOKING
  function saveBooking(bookingData) {
    let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    bookings.push(bookingData);
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }

  // SOUMISSION
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    // Validation destination
    if (!destinationSelect.value) {
      showError(destinationSelect, "Select a destination");
      isValid = false;
    } else {
      hideError(destinationSelect);
    }

    // Validation date
    if (!departureDate.value) {
      showError(departureDate, "Select a date");
      isValid = false;
    } else {
      hideError(departureDate);
    }

    // Validation accommodation
    if (!selectedAccommodation) {
      alert("Please select an accommodation");
      isValid = false;
    }

    // Validation champs passagers
    const allInputs = bookingForm.querySelectorAll(
      ".form-input[required], .form-textarea"
    );
    allInputs.forEach((input) => {
      if (!validateInput(input)) isValid = false;
    });

    if (isValid) {
      // Collecter les données passagers
      const passengers = [];
      const passengerBlocks = passengerContainer.querySelectorAll(".mt-10");

      passengerBlocks.forEach((block) => {
        const inputs = block.querySelectorAll(".form-input, .form-textarea");

        // Vérification sécurisée des champs
        const firstName = inputs[0]?.value || "";
        const lastName = inputs[1]?.value || "";
        const email = inputs[2]?.value || "";
        const phone = inputs[3]?.value || "";
        const specialReq = inputs[4]?.value || "";

        passengers.push({
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          specialReq: specialReq,
        });
      });

      // Créer booking object
      const bookingId = "BK-" + Date.now();
      const bookingDate = new Date().toISOString();

      const bookingData = {
        id: bookingId,
        date: bookingDate,
        destination: selectedDestination.name,
        accommodation: selectedAccommodation.name,
        departureDate: departureDate.value,
        passengerCount: passengerCount,
        passengers: passengers,
        totalPrice: priceBox.textContent,
        status: "confirmed",
      };

      // Vérifier si user logged in
      const isLoggedIn = localStorage.getItem("isLoggedIn");

      if (isLoggedIn !== "true") {
        const userChoice = confirm(
          "You are not logged in. Click OK to continue as guest, or Cancel to login first."
        );
        if (!userChoice) {
          window.location.href = "login.html";
          return;
        }
        bookingData.userType = "guest";
      } else {
        bookingData.userType = "logged";
        bookingData.userId = localStorage.getItem("userId");
      }

      // Sauvegarder
      saveBooking(bookingData);

      // Confirmation
      alert(
        "Booking confirmed!\nBooking ID: " +
          bookingData.id +
          "\nTotal: " +
          priceBox.textContent
      );

      // Redirection
      window.location.href = "my-bookings.html";
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
          <input type="email" class="form-input w-full px-4 py-3" placeholder="Enter your email" required>
        </div>
        <div>
          <label class="block text-gray-300 mb-2 text-sm">Phone</label>
          <input type="tel" class="form-input w-full px-4 py-3" placeholder="Enter your phone number" required>
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