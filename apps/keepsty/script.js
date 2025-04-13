// Varsayılan dil (dilerseniz URL parametresi veya başka bir yöntemle değiştirebilirsiniz)
let currentLanguage = localStorage.getItem('currentLanguage') || "turkish";

// Oda numarasını localStorage'dan alıyoruz (örnek olarak, girişte kaydedilmiş olduğunu varsayalım)
let roomNumber = localStorage.getItem('roomNumber') || "default_room"; // Gerçek uygulamada dinamik olmalı

// Her dil için anahtar kelime ve yanıt sözlükleri
const keywordResponses = {
  "turkish": {
    "kahvaltı": "Merhaba, kahvaltımız her gün sabah *07:00 - 10:00* saatleri arasında sunulmaktadır. Kahvaltı servisimiz otelin zemin katında yer alan kafemizdedir. Yardımcı olabileceğim başka bir konu var mı?",
    "giriş": "Giriş işlemlerimiz *14:00* itibarıyla başlamakta, çıkış (check-out) ise en geç *12:00*'de yapılmaktadır.",
    "wifi": "Evet, otelimizde tüm alanlarda ücretsiz Wi-Fi hizmetimiz mevcuttur. Bağlanmak için ağa 'Hotel54' üzerinden giriş yapabilir, şifre olarak *54hotel54* kullanabilirsiniz.",
    "otopark": "Evet, otelimizin konuklarına özel bir otoparkı bulunmaktadır ve tamamen *ücretsizdir*.",
    "oda servisi": "Merhaba, oda servisimiz *10:00 - 22:00* saatleri arasında hizmet vermektedir. Menüden dilediğiniz içecek ve tatlıları sipariş verebilirsiniz. Yardımcı olabileceğim başka bir konu var mı?",
    "menü": "Elbette! Keepsty uygulaması üzerinden *Room Service* seçeneğine tıklayarak menümüze ulaşabilir ve dilediğiniz içecekleri ve tatlıları kolayca sipariş verebilirsiniz. Yardıma ihtiyacınız olursa her zaman buradayım!",
    "havlu": "Elbette! Keepsty uygulamasındaki Housekeeping bölümünden ekstra havlu veya yastık talebinde bulunabilirsiniz. Talebinizi ilettikten sonra en kısa sürede odanıza teslim edeceğiz. Yardımcı olabileceğim başka bir şey var mı?",
    "temizlik": "Tabii ki! Odanızın temizlenmesini isterseniz *Keepsty uygulamasından Housekeeping* seçeneğine tıklayarak temizlik talebinde bulunabilirsiniz. Ekibimiz en kısa sürede odanıza gelecektir. Başka bir konuda yardımcı olabilir miyim?",
    "çamaşırhane": "Evet, otelimizde çamaşırhane ve ütü hizmeti mevcuttur. Hizmetlerimiz *ücretlidir* ve fiyat listesine *Keepsty uygulamasındaki Laundry* bölümünden ulaşabilirsiniz. Talep oluşturduğunuzda, ekibimiz çamaşırlarınızı almak için odanıza gelir. Yardıma ihtiyacınız olursa buradayım.",
    "klima": "Bu durum için üzgünüz! Klima arızasını çözmek için lütfen *Keepsty uygulamasından Technic* bölümüne girip arıza talebi oluşturun. Teknik ekibimiz en kısa sürede odanıza yönlendirilecektir. Başka bir konuda yardımcı olabilir miyim?",
    "spa": "Üzgünüz, otelimizde spa, masaj veya sauna hizmeti bulunmamaktadır. Başka bir konuda size yardımcı olabilirim.",
    "çocuk": "Üzgünüz, otelimizde şu anda çocuklar için özel bir oyun alanı veya etkinlik programı bulunmamaktadır. Başka bir konuda size yardımcı olabilirim."
  },
  "english": {
    "breakfast": "Hello! Our breakfast is served daily between *07:00 AM and 10:00 AM*. You can enjoy it at our café located on the ground floor of the hotel. Is there anything else I can assist you with?",
    "Check-in": "Check-in starts from *2:00 PM*, and check-out must be completed by *12:00 PM* at the latest.",
    "Wifi": "Yes, we offer free Wi-Fi throughout the entire hotel. You can connect by selecting the 'Hotel54' network and using the password *54hotel54*.",
    "Park": "Yes, we have a private parking area for our guests, and it is completely *free of charge*.",
    "Room Service": "Hello! Our room service is available between *10:00 AM and 10:00 PM*. You can order your preferred drinks and desserts from the menu. Is there anything else I can help you with?",
    "Menu": "Of course! You can access our menu and easily order your favorite drinks and desserts by selecting the *Room Service* option on the Keepsty app. I'm always here if you need assistance!",
    "Towel": "Absolutely! You can request extra towels or pillows through the *Housekeeping* section on the Keepsty app. Once your request is submitted, we will deliver it to your room as soon as possible. Can I help you with anything else?",
    "Cleaning": "Sure! If you would like your room to be cleaned, please go to the *Housekeeping* section on the Keepsty app and submit a cleaning request. Our team will arrive shortly. Is there anything else I can assist you with?",
    "Laundry": "Yes, we provide laundry and pressing services at our hotel. These services are *chargeable*, and you can view the pricing in the *Laundry* section on the Keepsty app. Once you submit a request, our team will come to your room to collect the laundry. Let me know if you need any further assistance.",
    "Pressing": "Yes, we provide laundry and ironing services at our hotel. These services are *chargeable*, and you can view the pricing in the *Laundry* section on the Keepsty app. Once you submit a request, our team will come to your room to collect the laundry. Let me know if you need any further assistance.",
    "AC": "We're sorry for the inconvenience! Please report the air conditioning issue by submitting a request in the *Technic* section on the Keepsty app. Our technical team will attend to your room as soon as possible. Is there anything else I can assist you with?",
    "Spa": "We're sorry, but our hotel does not offer spa, massage, or sauna services. Please let me know if there is anything else I can assist you with.",
    "Children": "We're sorry, but our hotel currently does not have a dedicated play area or activity program for children. Please let me know if I can help you with anything else."
  },
  "french": {
    "petit-déjeuner": "Bonjour ! Le petit-déjeuner est servi tous les jours de *07h00 à 10h00*. Vous pouvez le déguster dans notre café situé au rez-de-chaussée de l'hôtel. Puis-je vous aider pour autre chose ?",
    "check-in": "L'enregistrement commence à partir de *14h00* et le départ (check-out) doit être effectué au plus tard à *12h00*.",
    "Wifi": "Oui, nous proposons une connexion Wi-Fi gratuite dans tout l'hôtel. Connectez-vous au réseau 'Hotel54' et utilisez le mot de passe *54hotel54*.",
    "Stationnement": "Oui, un parking privé est à la disposition de nos clients et il est entièrement *gratuit*.",
    "Service en chambre": "Bonjour ! Le service en chambre est disponible de *10h00 à 22h00*. Vous pouvez commander vos boissons et desserts préférés depuis le menu. Puis-je vous aider pour autre chose ?",
    "Menu": "Bien sûr ! Vous pouvez consulter notre menu et commander facilement vos boissons et desserts préférés via l'option *Room Service* dans l'application Keepsty. Je suis toujours là si vous avez besoin d'aide !",
    "serviettes": "Avec plaisir ! Vous pouvez demander des serviettes ou oreillers supplémentaires dans la section *Housekeeping* de l'application Keepsty. Une fois la demande envoyée, nous les livrerons dans votre chambre dans les plus brefs délais. Puis-je vous aider pour autre chose ?",
    "Nettoyage": "Bien entendu ! Si vous souhaitez que votre chambre soit nettoyée, veuillez faire une demande via la section *Housekeeping* de l'application Keepsty. Notre équipe interviendra rapidement. Puis-je vous aider pour autre chose ?",
    "Blanchisserie": "Oui, nous proposons un service de blanchisserie et de repassage. Ces services sont *payants*, et vous pouvez consulter les tarifs dans la section *Laundry* de l'application Keepsty. Une fois la demande effectuée, notre équipe viendra récupérer votre linge dans votre chambre. N'hésitez pas à me solliciter si besoin.",
    "Climatisation": "Nous sommes désolés pour ce désagrément ! Veuillez signaler le problème de climatisation via la section *Technic* de l'application Keepsty. Notre équipe technique interviendra dans votre chambre dès que possible. Puis-je vous aider pour autre chose ?",
    "Spa": "Nous sommes désolés, mais notre hôtel ne propose pas de service de spa, massage ou sauna. Puis-je vous aider pour autre chose ?",
    "Enfants": "Nous sommes désolés, mais notre hôtel ne dispose pas actuellement d'un espace de jeux ou de programme d'activités pour enfants. Puis-je vous aider pour autre chose ?"
  },
  "arabic": {
    "kahvalti": "صباح الخير! يتم تقديم وجبة الإفطار يوميًا من الساعة *07:00* صباحًا حتى *10:00* صباحًا. يمكنكم الاستمتاع بها في المقهى الواقع في الطابق الأرضي من الفندق. هل يمكنني مساعدتك في شيء آخر؟",
    "giriş": "تبدأ إجراءات تسجيل الدخول من الساعة *14:00*، ويجب إنهاء تسجيل الخروج (Check-out) في موعد أقصاه الساعة *12:00* ظهرًا.",
    "wifi": "نعم، تتوفر خدمة الواي فاي المجانية في جميع أنحاء الفندق. يمكنك الاتصال بشبكة 'Hotel54' واستخدام كلمة المرور *54hotel54*.",
    "otopark": "نعم، لدينا موقف سيارات خاص لنزلائنا وهو *مجاني تمامًا*.",
    "oda servisi": "مرحبًا! خدمة الغرف متاحة من الساعة *10:00* صباحًا حتى *22:00* مساءً. يمكنك طلب المشروبات والحلويات التي ترغب بها من قائمة الطعام. هل يمكنني مساعدتك في شيء آخر؟",
    "menü": "بالطبع! يمكنك الوصول إلى قائمتنا وطلب المشروبات والحلويات المفضلة لديك بسهولة من خلال خيار *Room Service* في تطبيق Keepsty. أنا هنا دائمًا إذا كنت بحاجة إلى أي مساعدة!",
    "havlu": "بكل سرور! يمكنك طلب مناشف أو وسائد إضافية من خلال قسم *Housekeeping* في تطبيق Keepsty. بعد إرسال الطلب، سنقوم بإيصالها إلى غرفتك في أقرب وقت ممكن. هل يمكنني مساعدتك في شيء آخر؟",
    "temizlik": "بالتأكيد! إذا كنت ترغب في تنظيف غرفتك، يرجى الدخول إلى قسم *Housekeeping* في تطبيق Keepsty وإرسال طلب التنظيف. سيصل فريقنا إلى غرفتك في أقرب وقت. هل يمكنني مساعدتك في أمر آخر؟",
    "çamaşırhane": "نعم، يتوفر في الفندق خدمة غسيل وكي الملابس. هذه الخدمة *مدفوعة* ويمكنك الاطلاع على قائمة الأسعار من خلال قسم *Laundry* في تطبيق Keepsty. بعد إرسال الطلب، سيقوم فريقنا بالقدوم إلى غرفتك لأخذ الملابس. أنا هنا إذا كنت بحاجة لأي مساعدة إضافية.",
    "klima": "نعتذر عن الإزعاج! يرجى تقديم طلب صيانة لمشكلة التكييف من خلال قسم *Technic* في تطبيق Keepsty، وسيتوجه فريقنا الفني إلى غرفتك في أقرب وقت. هل يمكنني مساعدتك في شيء آخر؟",
    "spa": "نأسف، لا توجد خدمات سبا أو تدليك أو ساونا في الفندق. هل يمكنني مساعدتك في شيء آخر؟",
    "çocuk": "نعتذر، لا يوجد حاليًا في الفندق منطقة ألعاب أو برنامج أنشطة مخصص للأطفال. هل يمكنني مساعدتك في أمر آخر؟"
  }
};


// Sayfa yüklendiğinde çalışacak işlemler
document.addEventListener("DOMContentLoaded", function() {
  // Eğer chatbot alanınız başlangıçta gizliyse, gösteriyoruz:
  const chatbot = document.getElementById("chatbot");
  if (chatbot) {
    chatbot.style.display = "block";
  }

  // Mesaj inputu ve gönderme butonları için dinleyiciler
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  
  if (messageInput) {
    messageInput.addEventListener("keypress", function(event) {
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

  // Dört dilde hoş geldiniz mesajları
  const welcomeMessages = {
    "turkish": "Ask Keepsty'ye hoş geldiniz! 👋 Konaklamanızı kolay ve keyifli hale getirmek için buradayım. Check-in & check-out saatleri, oda detayları, Wi-Fi erişimi, yemek seçenekleri, Housekeeping, spa hizmetleri veya yerel aktiviteler hakkında bilgi almak isterseniz sorunuzu iletebilirsiniz.",
    "english": "Welcome to Ask Keepsty! 👋 I'm here to make your stay seamless and enjoyable. Whether you need information about check-in & check-out times, room details, Wi-Fi access, dining options, housekeeping, spa services, or local attractions, just ask!",
    "french": "Bienvenue sur Ask Keepsty! 👋 Je suis ici pour rendre votre séjour agréable et sans souci. Que vous ayez besoin d'informations sur les horaires d'enregistrement et de départ, les détails de la chambre, l'accès au Wi-Fi, les options de restauration, le service d'étage, le spa ou les attractions locales, n'hésitez pas à demander!",
    "arabic": "مرحباً بكم في Ask Keepsty! 👋 أنا هنا لجعل إقامتكم سلسة وممتعة. سواء كنتم بحاجة إلى معلومات عن مواعيد تسجيل الوصول والمغادرة، تفاصيل الغرفة، الوصول إلى الواي فاي، خيارات الطعام، خدمة التنظيف، خدمات السبا، أو المعالم السياحية المحلية، فقط اسألوا!"
  };

  // Seçilen dilin hoş geldiniz mesajını alıyoruz
  const selectedWelcomeMessage = welcomeMessages[currentLanguage] || welcomeMessages["english"];
  addMessageToChat(selectedWelcomeMessage, "bot");
  
  // Bot hoşgeldin mesajını veritabanına kaydet
  const botPayload = {
    roomNumber: roomNumber,
    message: selectedWelcomeMessage,
    sender: "bot",
    status: "sent"
  };
  ask1(botPayload);
  
  // Typing göstergesini oluştur (eğer yoksa)
  const chatBox = document.getElementById("chat-box");
  if (chatBox && !document.getElementById("typing-indicator")) {
    const typingIndicator = document.createElement("div");
    typingIndicator.id = "typing-indicator";
    typingIndicator.className = "message bot typing";
    typingIndicator.innerHTML = "<div class='typing-dots'><span></span><span></span><span></span></div>";
    typingIndicator.style.display = "none";
    chatBox.appendChild(typingIndicator);
  }
});

// Fonksiyon: Kullanıcı mesajına göre uygun yanıtı bulur
function findResponseForMessage(userMessage) {
  const message = userMessage.toLowerCase();
  const responses = keywordResponses[currentLanguage];
  for (let keyword in responses) {
    if (message.includes(keyword.toLowerCase())) {
      return responses[keyword];
    }
  }
  // Eşleşen bir anahtar kelime bulunamadıysa varsayılan yanıtı döndür
  const defaultResponses = {
    "turkish": "Üzgünüm, sorunuza uygun bir yanıt bulamadım. Lütfen soruyu farklı şekilde ifade edebilir misiniz?",
    "english": "I'm sorry, I couldn't find a suitable answer. Could you please rephrase your question?",
    "french": "Je suis désolé, je n'ai pas trouvé de réponse appropriée. Pourriez-vous reformuler votre question ?",
    "arabic": "عذرًا، لم أتمكن من إيجاد إجابة مناسبة. هل يمكنك إعادة صياغة سؤالك؟"
  };
  return defaultResponses[currentLanguage] || defaultResponses["english"];
}

// Fonksiyon: Mesajı sohbet kutusuna ekler ve ekranı aşağı kaydırır
function addMessageToChat(message, sender) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.className = "message " + sender;
  messageDiv.innerText = message;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Fonksiyon: Kullanıcı mesajı gönderme işlemini gerçekleştirir
function sendMessage() {
  const inputField = document.getElementById("message-input");
  if (!inputField) return; // Input alanı yoksa hiçbir şey yapma
  
  const userMessage = inputField.value.trim();
  
  // Boş mesaj kontrolü - sadece gerçekten boşsa uyar
  if (userMessage === "") {
    return; // Sessizce çık, uyarı gösterme
  }
  
  // Kullanıcı mesajını ekle
  addMessageToChat(userMessage, "user");
  inputField.value = ""; // Input alanını temizle
  
  // Input alanını tekrar odaklı hale getir
  inputField.focus();

  // Kullanıcı mesajı için payload oluştur
  const userPayload = {
    roomNumber: roomNumber, // Oda numarasını dinamik olarak alıyoruz
    message: userMessage,
    sender: "user",
    timestamp: new Date().toISOString(),
    status: "sent"
  };
  ask1(userPayload); // Kullanıcı mesajını kaydet

  // Yazıyor animasyonu göster
  showTypingIndicator();

  // Bot yanıtı için gecikme
  setTimeout(() => {
    hideTypingIndicator();
    const botResponse = findResponseForMessage(userMessage);
    addMessageToChat(botResponse, "bot");

    // Bot yanıtı için payload oluştur
    const botPayload = {
      roomNumber: roomNumber, // Oda numarasını dinamik olarak alıyoruz
      message: botResponse,
      sender: "bot",
      timestamp: new Date().toISOString(),
      status: "sent"
    };
    ask1(botPayload); // Bot yanıtını kaydet
  }, 1500); // Daha gerçekçi bir deneyim için 1.5 saniye gecikme
}

// Fonksiyon: Yazıyor (typing) göstergesini açar
function showTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.style.display = "flex"; // Flexbox kullanarak daha iyi hizalama
  } else {
    // Eğer gösterge yoksa oluştur
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
      const typingIndicator = document.createElement("div");
      typingIndicator.id = "typing-indicator";
      typingIndicator.className = "message bot typing";
      typingIndicator.innerHTML = "<div class='typing-dots'><span></span><span></span><span></span></div>";
      typingIndicator.style.display = "flex";
      chatBox.appendChild(typingIndicator);
      
      // Sohbeti aşağı kaydır
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
}

// Fonksiyon: Yazıyor (typing) göstergesini kapatır
function hideTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.style.display = "none";
  }
}

// Keepsty modeline uygun mesaj kaydetme fonksiyonu (ask1)
function ask1(payload) {
  // Burada mesajları veritabanına kaydetme işlemi yapılabilir
  console.log("Mesaj kaydedildi:", payload);
  
  // Örnek olarak localStorage'a kaydediyoruz
  let messages = JSON.parse(localStorage.getItem('keepstyMessages') || '[]');
  messages.push({
    ...payload,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('keepstyMessages', JSON.stringify(messages));
  
  // Gerçek bir uygulamada, burada bir API çağrısı yapılabilir:
  /*
  fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch((error) => console.error('Error:', error));
  */
}

// Örnek: Mesajları yükleme fonksiyonu (uygulamanıza göre düzenleyin)
function loadMessages(messages) {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = ""; // Önceki mesajları temizle
  messages.forEach(msg => {
    addMessageToChat(msg.message, msg.sender);
  });
}