document.addEventListener("DOMContentLoaded", () => {
  const chatItems = document.getElementById("chat-items");
  const chatContent = document.getElementById("chat-content");
  const chatUsername = document.getElementById("chat-username");
  const userMessageContent = document.getElementById("user-message-content"); // Sağ panel için

  // Sayfa yüklendiğinde oda numarasını sor
  const roomNumber = prompt("Please enter your room number:");
  if (roomNumber) {
    fetchRoomMessages(roomNumber);
  } else {
    alert("Room number is required!");
  }

  // Sol panel: Oda numaralarını listele
  fetch('http://localhost:3000/getChatLogs')
    .then(response => response.json())
    .then(data => {
      chatItems.innerHTML = ''; // Listeyi temizle

      // Her oda için bir liste öğesi oluştur
      data.forEach(group => {
        const listItem = document.createElement('li');
        listItem.textContent = `Room: ${group._id}`; // Oda numarasını göster
        listItem.className = 'room-item';
        listItem.onclick = () => loadMessages(group.messages); // Tıklanınca mesajları yükle
        chatItems.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Error fetching chat logs:', error);
      chatItems.innerHTML = '<li>Error loading rooms. Please try again later.</li>';
    });

  // Sağ ve orta panel: Oda mesajlarını getir
  function fetchRoomMessages(roomNumber) {
    fetch(`http://localhost:3000/getChatLogsByRoom/${roomNumber}`)
      .then(response => response.json())
      .then(data => {
        loadMessages(data); // Mesajları yükle
      })
      .catch(error => console.error('Error fetching messages:', error));
  }

  // Orta ve sağ paneli mesajlarla doldur
  function loadMessages(messages) {
    const chatContent = document.getElementById('chat-content');
    const userMessageContent = document.getElementById('user-message-content'); // Sağ panel
    const chatUsername = document.getElementById('chat-username');
  
    chatContent.innerHTML = ''; // Orta paneli temizle
    userMessageContent.innerHTML = ''; // Sağ paneli temizle
  
    if (messages.length > 0) {
      chatUsername.textContent = `Room: ${messages[0].roomNumber}`; // Oda numarasını göster
    } else {
      chatUsername.textContent = "No messages found for this room.";
    }
  
    // Her mesaj için bir baloncuk oluştur
    messages.forEach(message => {
      // Orta panel için mesaj ekleme
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${message.sender}`;
      messageDiv.textContent = `${message.sender}: ${message.message}`;
      chatContent.appendChild(messageDiv);
  
      // Sağ panel için sadece önemli kullanıcı mesajlarını göster
      if (message.sender === "user" && isImportantMessage(message.message)) {
        const userMessageDiv = document.createElement("div");
        userMessageDiv.className = "message user";
        userMessageDiv.textContent = message.message;
        userMessageContent.appendChild(userMessageDiv);
      }
    });
  }
  
  // Önemli mesajları belirleyen fonksiyon
  function isImportantMessage(message) {
    // Sıradan kelimeleri filtrelemek için
    const ignoredKeywords = ["next", "yes", "ok", "agree", "sure", "no", "thanks", "hello"];
    const trimmedMessage = message.toLowerCase().trim();
  
    // Eğer mesaj sıradan bir kelime içeriyorsa false döner
    if (ignoredKeywords.includes(trimmedMessage)) {
      return false;
    }
  
    // Mesajın uzunluğu en az 5 karakter olmalı
    if (trimmedMessage.length < 5) {
      return false;
    }
  
    // Ekstra bir kontrol: Önemli bir anahtar kelime içeriyor mu?
    const importantKeywords = ["help", "urgent", "reservation", "transfer", "booking", "need"];
    if (importantKeywords.some(keyword => trimmedMessage.includes(keyword))) {
      return true;
    }
  
    // Diğer her durumda false
    return false;
  }
  
    
  }
);

