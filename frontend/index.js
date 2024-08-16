let selectedChat = "general"
var tempElement;
var temp2Element;

const roomName = document.getElementById("roomName")
const chatroomText = document.getElementById("chatroomText")
const usernameTitle = document.getElementById("usernameTitle")
const usernameText = document.getElementById("usernameText")

class Event {
  constructor(type, payload, from) {
    this.type = type;
    this.payload = payload;
    this.from = from;
  }
}

function routeEvent(event) {
  if (event.type === undefined) {
    alert("no type field specified in event");
  }

  switch (event.type) {
    case "new_message":
      createMessage(event.payload, event.from, "fa-user")
      break;
    case "set_room":
      setRoom(event.payload)
      break;
    default:
      alert("unsupported message type.");
      break;
  }
}

function clearMessages() {
  while (messageList.children.length > 0) {
    messageList.removeChild(messageList.lastChild);
  }
}

function sendEvent(eventName, payload, from) {
  const event = new Event(eventName, payload, from)
  conn.send(JSON.stringify(event));
}

function changeChatRoom() {
  let newChat = chatroomText.value;
  if (newChat == "") {
    newChat = "general"
  }
  sendEvent("change_room", newChat, localStorage.getItem("username"))
}

function setRoom(name) {
  selectedChat = name
  roomName.innerText = selectedChat;
  roomIcon.innerText = selectedChat.trim()[0].toUpperCase()
  messageText.placeholder = `Message #${name}`
  clearMessages()
  createMessage(`Welcome to the discussion in #${name}, @${localStorage.getItem("username")}!`, "SERVER", "fa-robot")
  document.title = `#${name} | Gochat`
}

function createMessage(text, from, iconClass) {
  const newMessageDom = document.createElement("div");
  const msgLeft = document.createElement("div");
  const msgRight = document.createElement("div");
  const newMessageText = document.createElement("p");
  const newMessageIcon = document.createElement("i");
  const newMessageFrom = document.createElement("p");

  newMessageText.classList.add("messageText")
  newMessageText.innerText = text

  newMessageIcon.classList.add("messageIcon")
  newMessageIcon.classList.add("fa-solid", iconClass)

  newMessageFrom.classList.add("messageFrom")
  newMessageFrom.innerText = from

  msgLeft.append(newMessageIcon)
  msgRight.append(newMessageFrom, newMessageText)
  msgLeft.classList.add("messageLeft")
  msgRight.classList.add("messageRight")

  newMessageDom.classList.add("message")
  newMessageDom.append(msgLeft, msgRight)
  messageList.appendChild(newMessageDom)
  messageList.scrollTop = messageList.scrollHeight
}

function sendMessage() {
  const newMessage = messageText.value;
  messageText.value = "";
  messageText.focus();
  if (newMessage.trim() != "") {
    sendEvent("send_message", newMessage, localStorage.getItem("username"))
  }
}

function changeUsername() {
  localStorage.setItem("username", usernameText.value)
  usernameTitle.innerText = `@${usernameText.value}`
}

window.onload = function() {
  messageText.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      messageSend.click()
    }
  })
  usernameText.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && !y) {
      changeUsernameBtn.click()
      messageText.focus()
      usernameText.value = ""
      usernameText.replaceWith(temp2Element)
    }
  })
  var x = false;
  var y = false;
  chatroomText.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && !x) {
      x = true
      chatroomJoin.click()
      messageText.focus()
      roomName.textContent = chatroomText.value;
      chatroomText.replaceWith(tempElement)
      x = false
    }
  })

  roomName.onclick = () => {
    tempElement = roomName;
    chatroomText.value = roomName.textContent;
    roomName.replaceWith(chatroomText);
    chatroomText.style.display = "inline-block";
    chatroomText.focus();
  }
  usernameTitle.onclick = () => {
    temp2Element = usernameTitle;
    usernameText.value = localStorage.getItem("username")
    usernameTitle.replaceWith(usernameText)
    usernameText.style.display = "inline-block";
    usernameText.focus()
  }
  usernameText.addEventListener("focusout", () => {
    if (!y) {
      y = true
      changeUsernameBtn.click()
      messageText.focus()
      usernameText.replaceWith(temp2Element)
      y = false
    }
  })

  chatroomText.addEventListener("focusout", () => {
    if (!x) {
      x = true
      chatroomJoin.click()
      messageText.focus()
      roomName.textContent = chatroomText.value;
      chatroomText.replaceWith(tempElement)
      x = false
    }
  })
  if (localStorage.getItem("username")) {
    usernameTitle.innerText = `@${localStorage.getItem("username")}`
  } else {
    localStorage.setItem("username", "Guest")
  }
  if (window.WebSocket) {
    console.log("wss available");
    // create the websocket
    conn = new WebSocket("wss://" + document.location.host + "/ws");
    conn.onmessage = (e) => {
      const eventData = JSON.parse(e.data)
      const event = Object.assign(new Event, eventData)

      routeEvent(event)
    }
    conn.onopen = () => {
      changeChatRoom()
      loadingScreen.style.display = "none";
    };
    conn.onclose = function(e) {
      console.log("WS connection closed: ", e);
      alert("The server closed the connection.")
    }
  } else {
    alert("What, is your browser, built before Jesus?")
  }
}
