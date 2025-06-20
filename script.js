//object that holds the pet type and name.
const state = {
  pet: null, //will hold { type, name } once a pet is created
};

//function that creates the pet form
function petForm(onSave) {
  const form = document.createElement("form"); //this creates the pet form
  form.id = "pet-form";

  form.innerHTML = `
    <label for="pet-type">Choose a pet:</label>
    <select id="pet-type" name="petType" required>
      <option value="" disabled selected>Select your pet</option>
      <option value="dragon">Dragon</option>
      <option value="cat">Cat</option>
      <option value="dog">Dog</option>
      <option value="plant">Plant</option>
      <option value="space octopus">Space Octopus</option>
    </select>

    <label for="pet-name">Name your pet:</label>
    <input type="text" id="pet-name" name="petName" required />

    <button type="submit">Save Pet</button>
    `;
  form.addEventListener("submit", (e) => {
    //when the form is submitted, run this function
    e.preventDefault(); //prevents default behavior for form and let's me code it
    const type = form.petType.value; //grabs the selected value from an input feild inside the form named "petType"
    const name = form.petName.value.trim(); // the .trim() removed extra whitespace from when you enter the pet name
    onSave({ type, name });
  });

  return form;
}

// componenet function for the confirmation view
function confirmationView(pet, onReset) {
  const container = document.createElement("section");
  container.id = "confirmation";

  const summary = document.createElement("p"); //creates a <p> for the resulting pet to be said
  summary.textContent = `${pet.name} the ${pet.type}`; //adds the text "pet name the pet type"

  const resetButton = document.createElement("button"); //creates a button to be assigned the reset function
  resetButton.textContent = "Reset Selections"; //adds text to the button
  resetButton.addEventListener("click", onReset); //makes it so when you click the button it performs the onReset function

  const header = document.createElement("h2"); // makes a <h2>
  header.textContent = "You have been matched with"; //adds the text to the <h2>

  container.appendChild(header); //adds header to container
  container.appendChild(summary); //adds summary to container
  container.appendChild(resetButton); //adds resetButton to container

  return container;
}

// root app (will somehow translate to react well)
function App(root) {
  function savePet(petData) {
    state.pet = petData;
    localStorage.setItem("myPet", JSON.stringify(petData));
    render();
  }

  function resetPet() {
    state.pet = null;
    localStorage.removeItem("myPet");
    render();
  }
  function render() {
    root.innerHTML = ""; //clears the thingy

    // on load pull data from storage if it's there
    if (!state.pet) {
      //if there is no pet info in the state object
      const stored = localStorage.getItem("myPet");
      if (stored) state.pet = JSON.parse(stored);
    }

    //decide which component to mount

    if (state.pet) {
      root.appendChild(confirmationView(state.pet, resetPet));
    } else {
      root.appendChild(petForm(savePet));
    }
  }

  render();
}

//mount
const rootElement = document.getElementById("app");
App(rootElement);
