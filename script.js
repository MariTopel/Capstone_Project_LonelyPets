//object that holds the pet type and name.
const state = {
  pet: null, //will hold { type, name } once a pet is created
};

//object that holds the pet images
const petImages = {
  dragon: "images/dragon.png",
  cat: "images/cat.png",
  dog: "images/dog.png",
  plant: "images/plant.png",
  "space octopus": "images/octopus.png",
};

//ai chatbot fake test thingy
function generatePetReply(userText) {
  // naive echo–in a real app you'd call your AI here
  return `You said "${userText}", that sounds interesting!`;
}

//function that creates the pet form
function petForm(onSave) {
  const form = document.createElement("form"); //this creates the pet form
  form.id = "pet-form";

  // makes the form in html
  form.innerHTML = `
    <label for="pet-type">Choose a pet:</label>
    <select id="pet-type" name="petType" required>
      <option value="" disabled selected>Select your pet</option>
      <option value="dragon">Dragon</option>
      <option value="cat">Catz</option>
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
  resetButton.textContent = "I want to be matched with a different creature."; //adds text to the button
  resetButton.addEventListener("click", onReset); //makes it so when you click the button it performs the onReset function

  const header = document.createElement("h2"); // makes a <h2>
  header.textContent = "You have been matched with"; //adds the text to the <h2>

  // makes image of the pet
  const img = document.createElement("img"); //makes <img>
  img.src = petImages[pet.type] || ""; //gets pet image based on type that is connect to the image selection or nothing if returns false
  img.alt = pet.type; // adds alt text to say what the pet type is that is connected to that image
  img.style.width = "150px";
  img.style.height = "auto";
  img.style.display = "block";
  img.style.margin = "1rem auto";

  container.appendChild(img); //adds image to the container
  container.appendChild(header); //adds header to container
  container.appendChild(summary); //adds summary to container
  container.appendChild(resetButton); //adds resetButton to container

  return container;
}

// component function that creates the chatview for the AI chat
function ChatView() {
  const section = document.createElement("section");
  section.id = "chat";

  // Title
  const title = document.createElement("h2");
  title.textContent = "Chat with your pet";
  section.appendChild(title);

  // Messages container
  const messages = document.createElement("div");
  messages.id = "chat-messages";
  messages.style.minHeight = "100px";
  messages.style.border = "1px solid #ccc";
  messages.style.padding = "0.5rem";
  messages.style.marginBottom = "0.5rem";
  messages.innerHTML = `<p><em>Your conversation will appear here.</em></p>`;
  section.appendChild(messages);

  // Input area
  const inputWrapper = document.createElement("div");
  inputWrapper.id = "chat-input-area";

  const input = document.createElement("input"); //creates area for user to type message
  input.type = "text"; //sets input type to text so that it becomes a string when saved?
  input.id = "chat-input"; //sets ID to that name for being able to identify it
  input.placeholder = "Type a message…";
  input.disabled = false; // will enable once AI is hooked up
  inputWrapper.appendChild(input);

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Send";
  sendBtn.disabled = false; // will hook click handler later
  inputWrapper.appendChild(sendBtn);

  sendBtn.addEventListener("click", () => {
    //added event listener on button
    const text = input.value.trim(); //.trim gets rid of white space on ends of user input
    if (!text) return;
    // 1) Append the user’s message
    const userMsg = document.createElement("p"); //creates a <p>
    userMsg.innerHTML = `<strong>You:</strong> ${text}`; // saying "You: user typed in text"
    messages.appendChild(userMsg); //adds the user written entered stuff to the messages container
    input.value = ""; // resets the box that is typed in to be empty

    // 2) Simulate an AI reply after a short pause for testing
    setTimeout(() => {
      const aiMsg = document.createElement("p");
      aiMsg.innerHTML = `<strong>Pet:</strong> ${generatePetReply(text)}`;
      messages.appendChild(aiMsg);
      // scroll to bottom
      messages.scrollTop = messages.scrollHeight;
    }, 500);
  });

  section.appendChild(inputWrapper);
  return section;
}

// root app (will somehow translate to REACT when I learn REACT)
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
      root.appendChild(ChatView());
    } else {
      root.appendChild(petForm(savePet));
    }
  }

  render();
}

//mount
const rootElement = document.getElementById("app");
App(rootElement);
