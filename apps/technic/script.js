let botFlow;
let currentNode = "start";
const conversations = {}; // Kullanıcıların konuşmalarını saklamak için
let currentLanguage = "";

// Tüm DOM içeriği yüklendikten sonra çalışacak genel başlangıç fonksiyonu
document.addEventListener("DOMContentLoaded", function() {
  const inputField = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  
  // Enter tuşu ve gönder butonu için olay dinleyicileri
  if (inputField) {
    inputField.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
  }
  
  if (sendButton) {
    sendButton.addEventListener("click", function() {
      sendMessage();
    });
  }
  
  // LocalStorage'dan seçilen dili al
  const savedLanguage = localStorage.getItem("currentLanguage");

  if (savedLanguage) {
    // Eğer kullanıcı zaten dil seçtiyse, dil seçimi ekranını atlayıp sohbeti başlat
    const languageSelection = document.getElementById("language-selection");
    const chatbot = document.getElementById("chatbot");
    
    if (languageSelection && chatbot) {
      languageSelection.style.display = "none";
      chatbot.style.display = "block";
      startChat(savedLanguage);
    }
  }
  
  // Consent modal butonları
  const modal = document.getElementById("consent-modal");
  const consentYes = document.getElementById("consent-yes");
  const consentNo = document.getElementById("consent-no");
  
  if (consentYes) {
    // Kullanıcı Yes derse sohbeti başlat
    consentYes.addEventListener("click", function () {
      if (modal) modal.style.display = "none";
      startChat(currentLanguage); // Mevcut dilde sohbet başlat
    });
  }

  if (consentNo) {
    // Kullanıcı No derse teşekkür mesajı göster ve modalı kapat
    consentNo.addEventListener("click", function () {
      if (modal) modal.style.display = "none";
      alert("Thank you. If you change your mind, you can start the chat later.");
    });
  }
});

function startChat(language) {
  // Seçilen dili localStorage'a kaydet
  localStorage.setItem("currentLanguage", language);

  currentLanguage = language;
  document.getElementById("language-selection").style.display = "none";
  document.getElementById("chatbot").style.display = "block";

  // JSON dosyasını seçilen dile göre belirleme
  let jsonFile;
  switch (language) {
      case "english":
          jsonFile = "english_botflow.json";
          break;
      case "turkish":
          jsonFile = "turkish_botflow.json";
          break;
      case "arabic":
          jsonFile = "arabic_botflow.json";
          break;
      case "french":
          jsonFile = "french_botflow.json";
          break;
      default:
          console.error("Invalid language selected!");
          return;
  }

  fetch(jsonFile)
      .then((response) => response.json())
      .then((data) => {
          botFlow = data;
          currentNode = "start"; // JSON'daki başlangıç düğümü
          const initialMessage = botFlow[currentNode]?.question || "Welcome to Keepsty!";
          addBotMessage(initialMessage); // İlk mesajı hemen yazdır
          renderChat(); // İlk seçenekleri oluştur

          // 📌 Buraya ekliyoruz: Dil dosyasını yükle
          loadLanguage(language);
      })
      .catch((error) => console.error("Error loading JSON:", error));
}

function addMessageToChat(message, sender) {
  const chatBox = document.getElementById("chat-box");
  const messageElement = document.createElement("div");
  messageElement.className = `message ${sender}`; // Doğru template literal kullanımı
  
  // Mesaj içeriğini ekle
  const messageContent = document.createElement("p");
  messageContent.innerText = message; // Mesaj metni burada eklenir
  messageElement.appendChild(messageContent);

  // Kullanıcı mesajlarına özel animasyon ekle
  if (sender === "user") {
    messageElement.style.animation = "moveFromInput 1s ease-out";
  }

  // Mesajı sohbet kutusuna ekle
  chatBox.appendChild(messageElement);

  // Sohbet kutusunu aşağı kaydır
  scrollToBottom();
  // Konuşmaları gruplandır
  if (!conversations[currentLanguage]) {
    conversations[currentLanguage] = []; // Yeni konuşma başlat
  }
  conversations[currentLanguage].push({ message, sender }); // Mesajı gruplara ekle

  // Konuşmayı veritabanına kaydet
  saveMessageToDatabase(message, sender); // "human" yerine dinamik olarak sender geçiliyor
}

function renderChatList() {
  const chatItems = document.getElementById("chat-items");
  chatItems.innerHTML = ""; // Listeyi temizle

  Object.keys(conversations).forEach((username) => {
    const listItem = document.createElement("li");
    listItem.textContent = username; // Kullanıcı adı
    listItem.className = "chat-item";
    listItem.onclick = () => loadConversation(username); // Konuşmayı yükle
    chatItems.appendChild(listItem);
  });
}

function loadConversation(username) {
  const chatContent = document.getElementById("chat-content");
  const chatUsername = document.getElementById("chat-username");

  // Sağ tarafta kullanıcı adını göster
  chatUsername.textContent = username;

  // Kullanıcının mesajlarını göster
  const messages = conversations[username] || [];
  chatContent.innerHTML = ""; // Önceki mesajları temizle

  messages.forEach(({ message, sender }) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = message;
    chatContent.appendChild(messageDiv);
  });
}

// Botun yazıyor... mesajını ekler
function addTypingMessage() {
  const chatBox = document.getElementById("chat-box");
  const typingMessage = document.createElement("div");
  typingMessage.className = "message typing-message";
  typingMessage.id = "typing-message";

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "dots";

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    dotsContainer.appendChild(dot);
  }

  typingMessage.appendChild(dotsContainer);
  chatBox.appendChild(typingMessage);

  scrollToBottom(); // Yazıyor mesajı eklendiğinde kaydır
}

// Botun yazıyor... mesajını kaldırır
function removeTypingMessage() {
  const typingMessage = document.getElementById("typing-message");
  if (typingMessage) {
    typingMessage.remove();
  }
}

function addBotMessage(message) {
  const chatBox = document.getElementById("chat-box");
  const botMessage = document.createElement("div");
  botMessage.className = "message bot";

  const messageContent = document.createElement("p");
  botMessage.appendChild(messageContent);
  chatBox.appendChild(botMessage);

  // HTML uyumlu yazı efekti ile mesaj
  typeWriterEffect(messageContent, message, 5, () => {
    scrollToBottom(); // Mesaj tamamlarken sohbeti kaydır
    //mango
    saveMessageToDatabase(message, "bot");
  });
}

function typeWriterEffect(element, html, speed = 60, callback = null) {
  let tempDiv = document.createElement("div"); // Geçici bir div oluştur
  tempDiv.innerHTML = html; // HTML içeriği yükle
  const nodes = Array.from(tempDiv.childNodes); // Tüm düğümleri al

  element.innerHTML = ""; // Başlangıçta boşalt

  function processNode(nodeIndex) {
    if (nodeIndex < nodes.length) {
      const node = nodes[nodeIndex];

      if (node.nodeType === Node.TEXT_NODE) {
        typeText(node.textContent, element, speed, () => processNode(nodeIndex + 1));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const newElement = document.createElement(node.tagName);
        Array.from(node.attributes).forEach(attr =>
          newElement.setAttribute(attr.name, attr.value)
        );
        element.appendChild(newElement);
        typeWriterEffect(newElement, node.innerHTML, speed, () => processNode(nodeIndex + 1));
      }
    } else if (callback) {
      callback(); // Tüm düğümler işlendiğinde callback'i çağır
    }
  }

  processNode(0);
}

function typeText(text, element, speed, callback) {
  let index = 0;

  function addCharacter() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      scrollToBottom(); // Her karakter eklendiğinde sohbeti aşağı kaydır
      setTimeout(addCharacter, speed);
    } else if (callback) {
      callback();
    }
  }

  addCharacter();
}

function scrollToBottom() {
  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function handleUserChoice(userMessage, nextNode) {
  addMessageToChat(userMessage, "user"); // Kullanıcı mesajını hemen ekle

  hideOptions(); // Butonları gizle

  addTypingMessage(); // Bot yazıyor mesajını göster

  setTimeout(() => {
    removeTypingMessage(); // Bot yazıyor animasyonunu kaldır
    if (nextNode === "endChat") {
      displayEndMessage(); // End Chat mesajını göster
    } else {
      currentNode = nextNode; // Sonraki düğüme geç
      const botResponse = botFlow[currentNode]?.question || "Something went wrong.";
      addBotMessage(botResponse); // Bot mesajını göster
      renderChat(); // Seçenekleri yeniden oluştur
      showOptions(); // Yeni seçenekleri tekrar göster
    }
  }, 1500); // 1.5 saniye gecikme
}

function displayEndMessage() {
  // Chat kutusunu temizle
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = ""; // Sohbet içeriğini temizle

  // Logo ve mesajı göster
  const endMessageContainer = document.createElement("div");
  endMessageContainer.id = "end-message-container";
  endMessageContainer.style.display = "flex"; // Görünür yap
  endMessageContainer.style.flexDirection = "column";
  endMessageContainer.style.alignItems = "center";
  endMessageContainer.style.justifyContent = "center";
  endMessageContainer.style.height = "100%"; // Tam kutuyu kapla

  // Logo ekle
  const logo = document.createElement("img");
  logo.src = "avatars/keepsty-logo.png"; // Logonuzun yolu
  logo.alt = "Keepsty Logo";
  logo.style.width = "150px"; // Logo boyutu
  logo.style.height = "auto"; // Oranları koru
  logo.style.marginBottom = "20px"; // Mesaj ile logo arasına boşluk

  // Mesaj ekle
  const endMessage = document.createElement("p");
  endMessage.innerText = "You are all set!";
  endMessage.style.fontFamily = "'Poppins', sans-serif";
  endMessage.style.fontSize = "1.5rem";
  endMessage.style.fontWeight = "bold";
  endMessage.style.color = "#7a6c5e";
  endMessage.style.textAlign = "center";
  endMessage.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.2)";

  // Elemanları birleştir ve chat kutusuna ekle
  endMessageContainer.appendChild(logo);
  endMessageContainer.appendChild(endMessage);
  chatBox.appendChild(endMessageContainer);
}

function renderChat() {
  if (!botFlow || !botFlow[currentNode]) {
    console.error("Invalid bot flow or current node.");
    return;
  }

  const node = botFlow[currentNode];
  const chatOptions = document.getElementById("chat-options");
  const inputField = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  // Seçenekleri temizle
  chatOptions.innerHTML = "";

  if (node.options && node.options.length > 0) {
    const inputOption = node.options.find(option => option.input); // Girdi seçeneğini kontrol et

    if (inputOption) {
      // Input alanını güncelle
      inputField.placeholder = inputOption.text || "Enter your input";
      inputField.type = inputOption.input || "text"; 
      inputField.name = inputOption.name || "";
      
      // sendButton zaten DOMContentLoaded'de global olarak tanımlandı
      // buraya özel bir şey yapmaya gerek yok
    } else {
      // Eğer input seçeneği yoksa diğer seçenekleri oluştur
      setTimeout(() => {
        node.options.forEach((option) => {
          const button = document.createElement("button");
          button.className = "option";
          button.innerText = option.text;
          button.onclick = () => handleUserChoice(option.text, option.next);
          chatOptions.appendChild(button);
        });
        showOptions(); // Seçenekleri göster
      }, 500); // Mesaj tamamlanınca kısa bir gecikme
    }
  }
}

function hideOptions() {
  const chatOptions = document.getElementById("chat-options");
  if (chatOptions) {
    chatOptions.classList.add("hidden"); // Gizleme sınıfı ekle
  }
}

function showOptions() {
  const chatOptions = document.getElementById("chat-options");
  if (chatOptions) {
    chatOptions.classList.remove("hidden"); // Gizleme sınıfını kaldır
  }
}

function setInputPlaceholder(name) {
  const inputField = document.getElementById("message-input");
  // Placeholder belirleme
  inputField.placeholder =
    name === "reservation_date"
      ? "Enter the date (dd.mm.yyyy)"
      : name === "request"
      ? "Enter your request"
      : name === "reservation_time"
      ? "Enter the reservation time (hh:mm)"
      : name === "number_of_people"
      ? "Enter the number of people"
      : name === "full_name"
      ? "Enter your full name"
      : name === "phone_number"
      ? "Enter your phone number (including country code)"
      : name === "adet"
      ? "Kaç Adet İstediğinizi Girin"
      : name === "adres"
      ? "Lütfen Konumu girin"
      : name === "oda"
      ? "Lütfen Oda Numarası Girin"
      : name === "describe_your_request"
      ? "Please briefly describe your request"
      : name === "starting_address"
      ? "Enter the terminal address"
      : "Enter your input";
}

function sendMessage() {
  const inputField = document.getElementById("message-input");
  const userMessage = inputField.value.trim();

  if (userMessage) {
    addMessageToChat(userMessage, "user");
    inputField.value = ""; // Alanı temizle
    
    // Eğer bu bir serbest metin girişiyse, handleInput'u çağır
    if (botFlow[currentNode] && botFlow[currentNode].options) {
      const inputOption = botFlow[currentNode].options.find(option => option.input);
      if (inputOption && inputOption.next) {
        // Message is already added, so we pass the next node directly
        handleSubmit(inputOption.next);
      }
    }
  }
}

function handleInput(nextNode) {
  const inputField = document.getElementById("message-input");
  const userInput = inputField.value.trim();

  if (userInput) {
    addMessageToChat(userInput, "user"); // Kullanıcı girdisini ekle
    inputField.value = ""; // Input alanını temizle
    handleSubmit(nextNode);
  } else {
    alert("Lütfen bir şey yazın!"); // Kullanıcı boş bırakırsa uyarı göster
  }
}

function handleSubmit(nextNode) {
  addTypingMessage(); // Bot yazıyor mesajını göster
  
  setTimeout(() => {
    removeTypingMessage(); // Bot yazıyor mesajını kaldır
    
    // Bot cevabını tetikleme
    if (botFlow[nextNode]) {
      currentNode = nextNode;
      const botResponse = botFlow[currentNode]?.question || "Default bot message.";
      addBotMessage(botResponse);
      renderChat(); // Seçenekleri güncelle
    } else {
      console.error("Geçersiz nextNode: ", nextNode);
    }
  }, 1000);
}

// Mesajları veritabanına kaydetme fonksiyonu
function saveMessageToDatabase(message, sender) {
  // Bu fonksiyon şu anda sadece konsola loglama yapıyor
  // Gerçek bir veritabanına kaydetme işlemi burada eklenebilir
  console.log(`Message saved: ${sender}: ${message}`);
  
  // Örnek olarak localStorage'a kaydedebiliriz
  let savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  savedMessages.push({
    sender: sender,
    message: message,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('chatMessages', JSON.stringify(savedMessages));
}

function loadLanguage(lang) {
  fetch(`../../languages/${lang}.json`)
      .then(response => response.json())
      .then(data => {
          document.querySelector(".title").textContent = "Keepsty";
          document.querySelector(".subtitle").textContent = data.concierge || "Concierge";
          document.querySelector(".tagline").textContent = data.tagline || "Keep Your Stay, Keep Your Care";
      })
      .catch(error => console.error("Dil dosyası yüklenirken hata oluştu:", error));
}

function processStep(stepKey) {
  // Sadece adım taslağı, gerçek steps nesnesi yoksa bu fonksiyon çalışmaz
  if (typeof steps === 'undefined') {
    console.error("steps değişkeni tanımlanmamış!");
    return;
  }

  const step = steps[stepKey];
  if (!step) {
    console.error("Invalid step key:", stepKey);
    return;
  }
  
  // Varsayalım ki displayMessage fonksiyonu da tanımlanmış olacak
  if (typeof displayMessage === 'function') {
    displayMessage(step.question);
  } else {
    console.log(step.question);
  }
  
  if (step.next) {
    console.log("Next step is:", step.next);
    processStep(step.next); // Manuel olarak bir sonraki adıma geç
  }
}

function loadMessages(messages) {
  const chatContent = document.getElementById('chat-content');
  const chatUsername = document.getElementById('chat-username');
  
  if (!chatContent || !chatUsername) {
    console.error("Chat content veya username elemanları bulunamadı!");
    return;
  }
  
  chatContent.innerHTML = ''; // Sağ paneli temizle

  if (messages.length > 0) {
    chatUsername.textContent = `Room: ${messages[0].roomNumber}`; // Oda numarasını göster
  } else {
    chatUsername.textContent = "No messages found for this room.";
  }

  // Her mesaj için bir baloncuk oluştur
  messages.forEach(message => {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${message.sender}`;
    messageDiv.textContent = `${message.sender}: ${message.message}`;
    chatContent.appendChild(messageDiv);
  });
}

function openChatOptions() {
  const chatOptions = document.getElementById('chat-options');
  const hookButtonImg = document.querySelector('#hook-button img');
  
  if (!chatOptions || !hookButtonImg) {
    console.error("Chat options veya hook button img elemanları bulunamadı!");
    return;
  }

  // Modal ve görseli aç
  hookButtonImg.classList.remove('animate', 'reset'); // Görsel animasyonunu sıfırla
  chatOptions.style.display = 'flex'; // Modalı görünür yap
  setTimeout(() => {
    chatOptions.classList.add('open'); // Modalı aç
  }, 10);
}

function closeChatOptions() {
  const chatOptions = document.getElementById('chat-options');
  const hookButtonImg = document.querySelector('#hook-button img');
  
  if (!chatOptions || !hookButtonImg) {
    console.error("Chat options veya hook button img elemanları bulunamadı!");
    return;
  }

  // Modal kapanma animasyonu
  chatOptions.classList.add('closing');
  chatOptions.classList.remove('open');

  // Görsel düşme animasyonu
  hookButtonImg.classList.add('animate');

  // Animasyonların bitiş süresi (500ms) sonra sıfırla
  setTimeout(() => {
    chatOptions.style.display = 'none'; // Modalı gizle
    chatOptions.classList.remove('closing');
    hookButtonImg.classList.remove('animate'); // Animasyonu kaldır
    hookButtonImg.classList.add('reset'); // Görseli yukarı al
  }, 500);
}