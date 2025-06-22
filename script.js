//test
console.log("loadGenerator is", typeof window.loadGenerator);

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
// top of your script.js, before generatePetReply
const PET_SYSTEM_PROMPT =
  "You are a friendly little virtual pet and you are speaking to a human. " +
  "You reply in short, cheerful sentences, and always stay on topic.";

//This is a module-level promise(it will eventually hold the result of window.loadGenerator() which is an async operation for loading the pet's "brain").
// This means that it is defined across the entire module/javascript file. It is like a global variable. It's not inside a function so everything can use it.
//by having it be a module-level promise, this insures the model is only loaded once.
// All future calls in the generatePetReply(userText) -> if(!generatorPromise) will reuse the same model instead of reloading/remaking it.
let generatorPromise = null;

//creates the pet's reply to the user's text in the text feilt.
async function generatePetReply(userText) {
  if (!generatorPromise) {
    //loads the TF-WASM runtime and distilgpt2 which is 10mb and is designed to be faster and lighter.
    // Which lets the browser run machine learning models directly without needing a server or GPU.
    //once loaded it will power pet's responses locally on browser using Javascript function.
    //TLDR; makes sure the pet's "brain" is loaded into memory before it allows the pet to speak.
    generatorPromise = window.loadGenerator(); //this is defined in the HTML and not here in the script.js.
  }
  // By caching the promise, subsequent chats skip the download & initialization step. aka await that same promise every time—so we load the model only once.
  const generator = await generatorPromise;

  // Build the full prompt. this is sourced from the above PET_SYSTEM_PROMPT
  const prompt = PET_SYSTEM_PROMPT + "\n" + `Human: ${userText}\n` + "Pet:";
  // this translates to:
  // You are a friendly little virtual pet. ...
  //Human: Hello pet!
  //Pet:
  // this tells the model who it is(pet) and what to generate next.

  // Generate with sampling and repetition penalty
  const outputs = await generator(prompt, {
    max_length: 180, // total tolkens used (prompt+reply). AKA caps how long the output can run (inculding the prompt). Research what tolkens actually means.
    temperature: 0.3, // controls randomness (0.0–1.0) 0.3 is very focused and higher values will make it more random.
    top_p: 0.9, // nucleus sampling EXPLANATION: looks at probabilites of next few words. .9 means 90% chance of possible words. this is different from other type that only predicts next single word. It is like the reccomended word in your phone's keyboard.
    repetition_penalty: 1.2, //prevents/pushes the model away from looping. EX: saying the same words over and over like "hello hello hello hello hello"
  });

  let text = outputs[0].generated_text;

  // Strip off the prompt so you only get the pet’s reply. The raw generated text will usually included reprinting the entire prompt, including what the user typed (because that counts as a prompt). This needs to be cut so the user wont see it.
  text = text.replace(prompt, "").trim();

  // Sometimes GPT-2 runs on—cut at first newline. I think what this means is it stops the model from going and going. The issues is that it will output cut off sentences or ideas.
  const end = text.indexOf("\n");
  if (end > 0) text = text.slice(0, end).trim();

  return text;
}

//ai chatbot fake test thingy
//function generatePetReply(userText) {
// naive echo–in a real app you'd call your AI here
//return `You said "${userText}", that sounds interesting!`;
//}

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
    //when the user presses send, it calls generatePetReply(userText) to get pet's response and then display it
    const text = input.value.trim();
    if (!text) return;

    // 1) Append the user’s message
    const userMsg = document.createElement("p");
    userMsg.innerHTML = `<strong>You:</strong> ${text}`;
    messages.appendChild(userMsg);
    input.value = "";

    // 2) After a short pause, await the async reply
    setTimeout(async () => {
      //needs to be async because it needs to wait for generatePetReply(text) to load. this gives the actual string instead of going past it with no promise.
      const replyText = await generatePetReply(text);
      const aiMsg = document.createElement("p");
      aiMsg.innerHTML = `<strong>Pet:</strong> ${replyText}`;
      messages.appendChild(aiMsg);
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
