document.addEventListener("DOMContentLoaded", () => {
  // DÉCLARATION DES VARIABLES (TOUJOURS EN PREMIER)
  const destinationSelect = document.getElementById("destination");
  const accommodationContainer = document.getElementById(
    "accommodationContainer"
  );

  const passengerContainer = document.getElementById("passengerContainer");
  const addPassengerBtn = document.getElementById("addPassengerBtn");

  addPassengerBtn.style.display = "none";

  let destinationsData = [];
  let accommodationsData = [];

  //  FETCH DES DESTINATIONS
  fetch("destinations.json")
    .then((res) => res.json())
    .then((data) => {
      destinationsData = data.destinations;

      // Remplir le select
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
  destinationSelect.addEventListener("change", () => {
    const selectedId = destinationSelect.value;
    const destination = destinationsData.find((d) => d.id === selectedId);

    accommodationContainer.innerHTML = "";

    if (!destination) return;

    destination.accommodations.forEach((accId) => {
      const acc = accommodationsData.find((a) => a.id === accId);

      if (acc) {
        const div = document.createElement("div");
        div.className = "accommodation-card p-4 h-fit cursor-pointer";
        div.dataset.id = acc.id;

        // CONTENU DE LA CARD
        div.innerHTML = `
        <h3 class="font-semibold text-lg">${acc.name}</h3>
        <p class="text-gray-400 text-sm">${acc.shortDescription}</p>
        `;

        // SELECT BY CLICK
        div.addEventListener("click", () => {
          document
            .querySelectorAll(".accommodation-card")
            .forEach((c) => c.classList.remove("selected"));
          div.classList.add("selected");
        });

        accommodationContainer.appendChild(div);
      }
    });
  });
  function createPassengerBlock(num) {
    const div = document.createElement("div");

    div.innerHTML = `
        <div class="mt-10">
            <h2 class="font-orbitron text-2xl mb-4 text-glow">Personal Information ${num}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-gray-300 mb-2 text-sm">First Name</label>
                    <input type="text" class="form-input w-full px-4 py-3"
                        placeholder="Enter your first name" required>
                </div>
                <div>
                    <label class="block text-gray-300 mb-2 text-sm">Last Name</label>
                    <input type="text" class="form-input w-full px-4 py-3"
                        placeholder="Enter your last name" required>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-gray-300 mb-2 text-sm">Email Address</label>
                    <input type="email" class="form-input w-full px-4 py-3"
                        placeholder="Enter your email" required>
                </div>
                <div>
                    <label class="block text-gray-300 mb-2 text-sm">Phone Number</label>
                    <input type="tel" class="form-input w-full px-4 py-3"
                        placeholder="Enter your phone number" required>
                </div>
            </div>
            <div>
                <label class="block text-gray-300 mb-2 text-sm">Special Requirements</label>
                <textarea class="form-textarea w-full px-4 py-3"
                    rows="4" placeholder="Any special requirements..." maxlength="500"></textarea>
            </div>
        </div>
    `;
    return div;
  }
  let passengerCount = 0;
  document.querySelectorAll("input[name='passengers']").forEach((radio) => {
    radio.addEventListener("change", () => {
      passengerContainer.innerHTML = "";
      passengerCount = 0;

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
    });
  });

  // Add Passenger (Group only)
  addPassengerBtn.addEventListener("click", () => {
    passengerCount++;
    passengerContainer.appendChild(createPassengerBlock(passengerCount));
  });
});
