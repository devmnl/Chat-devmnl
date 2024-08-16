// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const header = document.querySelector(".header")
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]



const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")

    div.classList.add("message--self")
    div.innerHTML = content

    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data)

    const message =
        userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message)

    scrollScreen()
}

const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"
    header.style.display = "flex"

    websocket = new WebSocket("wss://chat-backend-wr3t.onrender.com")
    websocket.onmessage = processMessage
}

const sendMessage = (event) => {
    event.preventDefault()

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }

    websocket.send(JSON.stringify(message))

    chatInput.value = ""
}

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)


//service
if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('sw.js')
  }
  const CACHE_NAME = 'cool-cache';

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = [
'/assets/',
'/src/'
]

// Listener for the install event - pre-caches our assets list on service worker install.
self.addEventListener('install', event => {
event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll(PRECACHE_ASSETS);
})());
});

self.addEventListener('activate', event => {
event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
event.respondWith(async () => {
  const cache = await caches.open(CACHE_NAME);

  // match the request to our cache
  const cachedResponse = await cache.match(event.request);

  // check if we got a valid response
  if (cachedResponse !== undefined) {
      // Cache hit, return the resource
      return cachedResponse;
  } else {
    // Otherwise, go to the network
      return fetch(event.request)
  };
});
});