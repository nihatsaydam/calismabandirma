// Global Değişkenler
let menuData = {};
let cart = [];
let botFlow = {};
let currentNode = "start";
let selectedCategory = "";
let selectedIssue = "";
let chatHistory = [];
// Zaman seçimi ile ilgili global değişken artık kullanılmıyor:
let selectedTime = null;

//
// Dil Seçimi ve Hoş Geldiniz Popup'ı
//
function loadLanguageSelection() {
  const languageDiv = document.getElementById("languages");
  const languages = [
    { code: "en", name: "English", icon: "assets/images/english.png" },
    { code: "tr", name: "Türkçe", icon: "assets/images/turkish.png" },
    { code: "fr", name: "Français", icon: "assets/images/french.png" },
    { code: "ar", name: "العربية", icon: "assets/images/arabic.png" }
  ];

  languages.forEach(lang => {
    const button = document.createElement("button");
    button.className = "language-option";
    button.innerHTML = `<img src="${lang.icon}" alt="${lang.name}"><span>${lang.name}</span>`;
    button.onclick = () => selectLanguage(lang.code);
    languageDiv.appendChild(button);
  });
}

function selectLanguage(langCode) {
  currentLanguage = langCode;
  localStorage.setItem("currentLanguage", langCode); // Dili kaydediyoruz
  document.getElementById("language-selection").style.display = "none";
  showWelcomePopup(); // Hoş geldin mesajı açılıyor
}


function showWelcomePopup() {
  const messages = {
    en: `
      Welcome to Keepsty Housekeeping! I’m here to make your stay as comfortable and seamless as possible.
      Whether you need fresh towels, room cleaning, or any other housekeeping services, I’m just a message away.
    `,
    tr: `
      Keepsty Housekeeping'e hoş geldiniz! Konaklamanızı mümkün olduğunca konforlu ve sorunsuz hale getirmek için buradayım.
      Taze havlular, oda temizliği veya diğer hizmetlere ihtiyacınız olursa, yalnızca bir mesaj uzağınızdayım.
    `,
    fr: `
      Bienvenue à Keepsty Housekeeping ! Je suis ici pour rendre votre séjour aussi confortable et fluide que possible.
    `,
    ar: `
      مرحبًا بكم في Keepsty Housekeeping! أنا هنا لجعل إقامتكم مريحة وسلسة قدر الإمكان.
    `
  };

  const message = messages[currentLanguage] || messages.en;
  const popup = document.createElement("div");
  popup.id = "welcome-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <div class="popup-buttons">
        <button id="popup-yes">Continue</button>
        <button id="popup-no">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("popup-yes").onclick = () => {
    document.body.removeChild(popup);
    document.getElementById("app").style.display = "block";
  };

  document.getElementById("popup-no").onclick = () => {
    document.body.removeChild(popup);
    alert("Thank you!");
  };
}

//
// Zaman Popup İşlemleri (Zaman seçimi kaldırıldı, sadece onay popup'ı olarak kullanılıyor)
//
function showTimePopup() {
    // Seçili dili localStorage'dan al (Varsayılan "en" olsun)
    const selectedLanguage = localStorage.getItem("currentLanguage") || "en";

    // Popuptaki başlığı güncelle
    document.querySelector("#time-popup h3").innerText = translations[selectedLanguage].popupMessage;

      // Butonları güncelle
    document.getElementById("confirm-time").innerText = translations[selectedLanguage].confirm;
    document.getElementById("cancel-time").innerText = translations[selectedLanguage].cancel;

    // Popup'ı aç
    document.getElementById("time-popup").style.display = "block";
}

function cancelTimePopup() {
  document.getElementById("time-popup").style.display = "none";
  selectedTime = null;
}

//
// Global function to handle different request types.
//
let currentRequestType = "";
function handleLuggageRequest(requestType) {
  currentRequestType = requestType;
  // Zaman seçimi yapmadan, onay popup'ını gösteriyoruz.
  showTimePopup();
}


document.getElementById("confirm-time").addEventListener("click", function () {
  const confirmButton = document.getElementById("confirm-time");
  confirmButton.disabled = true;
  
  // Zaman seçimi yapılmadığı için selectedTime değeri null olarak gönderiliyor.
  sendBellboyRequest(currentRequestType, '', null);
  
  const successPopup = document.getElementById("success-popup");
  if (successPopup) {
    successPopup.style.display = "block";
  } else {
    const sp = document.createElement("div");
    sp.id = "success-popup";
    sp.innerHTML = `
      <div class="popup-content">
        <img src="assets/icons/bellboy.png" alt="Keepsty Character" class="keepsty-character">
        <p class="success-message">You are all set!</p>
      </div>
    `;
    document.body.appendChild(sp);
  }
  
  setTimeout(() => {
    document.getElementById("success-popup").style.display = "none";
    document.getElementById("menu").style.display = "block";
    document.getElementById("time-popup").style.display = "none";
    selectedTime = null;
    confirmButton.disabled = false;
  }, 5000);
});

document.addEventListener('DOMContentLoaded', () => {
  loadLanguageSelection();
});
// LocalStorage'dan currentLanguage bilgisini çekiyoruz, yoksa varsayılan "en" kullanılıyor.
let currentLanguage = localStorage.getItem("currentLanguage") || "en";

const translations = {
  english: {
    checkIn: "Check-In Luggage Delivery",
    checkInDesc: "Select the time",
    checkOut: "Check-Out Luggage Delivery",
    checkOutDesc: "Select the time.",
    roomKey: "Room Key Request",
    roomKeyDesc: "Select the time.",
    choose: "Choose",
    popupMessage: "Would you like to send your request?",
    confirm: "Confirm",
    cancel: "Cancel"
  },
  turkish: {
    checkIn: "Check-In Bagaj Teslimatı",
    checkInDesc: "Zamanı seçiniz",
    checkOut: "Check-Out Bagaj Teslimatı",
    checkOutDesc: "Zamanı seçiniz.",
    roomKey: "Oda Anahtarı İsteği",
    roomKeyDesc: "Zamanı seçiniz.",
    choose: "Seç",
    popupMessage: "Talebinizi göndermek istiyor musunuz?",
    confirm: "Onayla",
    cancel: "İptal",
  },
  french: {
    checkIn: "Livraison de bagages pour l'enregistrement",
    checkInDesc: "Sélectionnez l'heure",
    checkOut: "Livraison de bagages pour le départ",
    checkOutDesc: "Sélectionnez l'heure.",
    roomKey: "Demande de clé de chambre",
    roomKeyDesc: "Sélectionnez l'heure.",
    choose: "Choisir",
    popupMessage: "Voulez-vous envoyer votre demande ?",
    confirm: "Confirmer",
    cancel: "Annuler"
  },
  arabic: {
    checkIn: "توصيل الأمتعة لتسجيل الوصول",
    checkInDesc: "حدد الوقت",
    checkOut: "توصيل الأمتعة لتسجيل المغادرة",
    checkOutDesc: "حدد الوقت.",
    roomKey: "طلب مفتاح الغرفة",
    roomKeyDesc: "حدد الوقت.",
    choose: "اختيار",
    popupMessage: "هل تريد إرسال طلبك؟",
    confirm: "تأكيد",
    cancel: "إلغاء"
  }
};


// Fonksiyon: Menü metinlerini güncelle
function updateMenuTexts() {
  document.getElementById("checkin-title").textContent = translations[currentLanguage].checkIn;
  document.getElementById("checkin-desc").textContent = translations[currentLanguage].checkInDesc;
  document.getElementById("checkin-btn").textContent = translations[currentLanguage].choose;

  document.getElementById("checkout-title").textContent = translations[currentLanguage].checkOut;
  document.getElementById("checkout-desc").textContent = translations[currentLanguage].checkOutDesc;
  document.getElementById("checkout-btn").textContent = translations[currentLanguage].choose;

  document.getElementById("roomkey-title").textContent = translations[currentLanguage].roomKey;
  document.getElementById("roomkey-desc").textContent = translations[currentLanguage].roomKeyDesc;
  document.getElementById("roomkey-btn").textContent = translations[currentLanguage].choose;
}

// Sayfa yüklendiğinde dil seçim ve metin güncelleme işlemleri
document.addEventListener('DOMContentLoaded', () => {
  // Diğer başlangıç işlemleri...
  updateMenuTexts();
});