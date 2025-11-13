document.addEventListener("DOMContentLoaded", () => {
    const destinationSelect = document.getElementById("destination");
    const packageContainer = document.getElementById("packageContainer");
    let destinationsData = [];

    // Charger le JSON
    fetch("destinations.json")
        .then(response => response.json())
        .then(data => {
            destinationsData = data.destinations;

            // Remplir le select des destinations
            destinationsData.forEach(dest => {
                const option = document.createElement("option");
                option.value = dest.id;
                option.textContent = dest.name;
                destinationSelect.appendChild(option);
            });
        })
        .catch(err => console.error("Erreur de chargement JSON:", err));

    // Quand on change de destination
    destinationSelect.addEventListener("change", (e) => {
        const selectedId = e.target.value;
        const selectedDestination = destinationsData.find(d => d.id === selectedId);

        // Vider le container avant de remplir
        packageContainer.innerHTML = "";

        if (selectedDestination) {
            packageContainer.innerHTML = "<label class='block text-gray-300 mb-2 text-sm'>Select Package</label>";
            
            selectedDestination.accommodations.forEach(pkg => {
                const label = document.createElement("label");
                label.classList.add("flex", "items-center", "cursor-pointer", "mb-2");

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "package";
                input.value = pkg;
                input.classList.add("radio-custom");

                label.appendChild(input);

                const span = document.createElement("span");
                span.textContent = " " + pkg.charAt(0).toUpperCase() + pkg.slice(1);
                span.classList.add("text-gray-300");

                label.appendChild(span);
                packageContainer.appendChild(label);
            });
        } else {
            packageContainer.innerHTML = "<p class='text-gray-400 text-sm'>Please select a destination first</p>";
        }
    });
});
