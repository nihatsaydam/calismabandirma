// Global Değişkenler
let menuData = {};      // Menü verileri (JSON üzerinden yüklenecek)
let cart = [];          // Sepet dizisi
let botFlow = {};       // Bot akış verileri (opsiyonel)
let currentNode = "start";
let currentLanguage = "en"; // Varsayılan dil
let selectedCategory = "";
let selectedIssue = "";
let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  showItemList();
});
function showItemList() {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('item-list-section').style.display = 'block';
  showScreen('item-list-section');

  // LocalStorage'dan seçili dili al, yoksa varsayılan olarak 'english'
  const currentLanguage = localStorage.getItem('currentLanguage') || 'english';
  // Dosya yolunu oluşturun (örn: data/menu-english.json)
  const menuFile = `data/menu-${currentLanguage}.json`;

  fetch(menuFile)
    .then(response => {
      if (!response.ok) {
        throw new Error('JSON dosyası yüklenemedi');
      }
      return response.json();
    })
    .then(data => {
      const itemListDiv = document.getElementById('item-list');
      itemListDiv.innerHTML = '';

      data.menu.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.classList.add('dynamic-menu-option');

        const categoryImage = document.createElement('img');
        categoryImage.src = category.image;
        categoryImage.alt = category.name;
        categoryCard.appendChild(categoryImage);

        const optionDetails = document.createElement('div');
        optionDetails.classList.add('option-details');

        const title = document.createElement('h3');
        title.textContent = category.name;
        optionDetails.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = category.description;
        optionDetails.appendChild(desc);

        const button = document.createElement('button');
        button.textContent = 'Choose';
        button.addEventListener('click', () => {
          showCategoryItems(category);
        });
        optionDetails.appendChild(button);

        categoryCard.appendChild(optionDetails);
        itemListDiv.appendChild(categoryCard);
      });
    })
    .catch(error => {
      console.error('Menu yüklenirken hata oluştu:', error);
    });
}
var langButtons = document.querySelectorAll(".lang-btn");
langButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    var selectedLang = btn.getAttribute("data-lang");
    var langMapping = {
      en: "english",
      tr: "turkish",
      fr: "french",
      ar: "arabic",
    };
    var langValue = langMapping[selectedLang] || "english";
    localStorage.setItem("currentLanguage", langValue);
    
    // Dil değiştiğinde menüyü tekrar yükle
    showItemList();
  });
});


function showCategoryItems(category) {
  const itemListDiv = document.getElementById('item-list');
  itemListDiv.innerHTML = '';



  const itemsContainer = document.createElement('div');
  itemsContainer.classList.add('items-container');

  category.items.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');

    const itemName = document.createElement('h4');
    itemName.textContent = item.name;
    itemCard.appendChild(itemName);

    const itemDesc = document.createElement('p');
    itemDesc.textContent = item.description;
    itemCard.appendChild(itemDesc);

    // **Fiyat Bilgisini Ekleyin**
    if (item.price) {
      const itemPrice = document.createElement('p');
      itemPrice.textContent = `Price: ${item.price}`;
      itemPrice.classList.add('item-price');  // CSS için sınıf ekleyin
      itemCard.appendChild(itemPrice);
    }

    const chooseButton = document.createElement('button');
    chooseButton.textContent = 'Choose';
    chooseButton.addEventListener('click', () => {
      addToCart(item);
      showCartScreen();
    });
    itemCard.appendChild(chooseButton);

    itemsContainer.appendChild(itemCard);
  });

  itemListDiv.appendChild(itemsContainer);
}

function goBack() {
  if (previousScreens.length > 0) {
    const lastScreenId = previousScreens.pop(); // Son açılan ekranı al

    document.querySelectorAll('.screen-active').forEach(screen => {
      screen.style.display = 'none';
      screen.classList.remove('screen-active');
    });

    const previousScreen = document.getElementById(lastScreenId);
    if (previousScreen) {
      previousScreen.style.display = 'block';
      previousScreen.classList.add('screen-active');
    }
  } else {
    showScreen('menu'); // Eğer önceki ekran yoksa, ana ekrana dön
  }
}


// *****************
// Sepet İşlevleri
// *****************

function addToCart(product) {
  console.log("addToCart called with:", product);
  // Her eklemeyi ayrı bir kayıt olarak ekleyelim:
  let newProduct = { ...product, quantity: 1 };
  cart.push(newProduct);
  updateCartDisplay();
  showAddToCartNotification();
}

function showAddToCartNotification() {
  const notification = document.getElementById('add-to-cart-notification');
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000); // Bildirim 3 saniye sonra kaybolur
}

function updateCartDisplay() {
  let total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = `Cart (${total})`;
  }
  console.log("Cart updated:", cart);
}

function showCartScreen() {
  const cartScreen = document.getElementById('cart-screen');
  cartScreen.style.display = 'flex';
  cartScreen.innerHTML = '';  // Önceki içerikleri temizle
  showScreen('cart-screen');
  // **Kapatma Butonu**
  const closeButton = document.createElement('button');
  closeButton.className = 'close-btn';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', hideCartScreen);
  cartScreen.appendChild(closeButton);

  // **Başlık**
  const header = document.createElement('h2');
  header.textContent = 'Your Cart';
  cartScreen.appendChild(header);

  // **Sepet Ürünleri**
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'cart-items-container';

  if (cart.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Cart is currently empty.';
    itemsContainer.appendChild(emptyMessage);
  } else {
    let totalPrice = 0;

    cart.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';

      const itemPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      const itemTotalPrice = itemPrice * item.quantity;
      totalPrice += itemTotalPrice;

      itemDiv.innerHTML = `
        <p>${item.name} (x${item.quantity})</p>
        <p class="cart-price">Unit Price: ${item.price}</p>
        <p class="cart-total">Total: $${itemTotalPrice.toFixed(2)}</p>
      `;

      itemsContainer.appendChild(itemDiv);
    });

    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total-container';
    totalDiv.innerHTML = `<h3>Total Price: ₺${totalPrice.toFixed(2)}</h3>`;
    itemsContainer.appendChild(totalDiv);
  }

  cartScreen.appendChild(itemsContainer);

  // **Talep Butonu (Request)**
  const requestButton = document.createElement('button');
  requestButton.id = 'request-btn';
  requestButton.textContent = 'Request';
  requestButton.addEventListener('click', showTimeSelectionPopup);
  cartScreen.appendChild(requestButton);
}

function hideCartScreen() {
  const cartScreen = document.getElementById('cart-screen');
  if (cartScreen) {
    cartScreen.style.display = 'none';
  }
}


// *****************
// Genel Menü Gösterimi
// *****************

function showMainMenu() {
  document.getElementById('item-list-section').style.display = 'none';
  document.getElementById('chatbot').style.display = 'none';
  document.getElementById('cart-screen').style.display = 'none';
  document.getElementById('time-popup').style.display = 'none';
  document.getElementById('menu').style.display = 'block';
  hideCartScreen();
}

function showScreen(newScreenId) {
  const currentScreen = document.querySelector('.screen-active'); // Şu an açık olan ekranı bul

  if (currentScreen) {
    previousScreens.push(currentScreen.id); // Önceki ekranı kaydet
    currentScreen.style.display = 'none';
    currentScreen.classList.remove('screen-active');
  }

  const newScreen = document.getElementById(newScreenId);
  if (newScreen) {
    newScreen.style.display = 'block';
    newScreen.classList.add('screen-active');
  }

  // **Dil seçim ekranını tekrar açmasını engelle**
  const languageSelection = document.getElementById("language-selection");
  if (languageSelection) {
    languageSelection.style.display = "none"; // Dil ekranını her zaman gizli tut
  }
}

let previousScreens = []; // Önceki ekranları kaydetmek için dizi

// *****************
// Zaman Seçim ve Talep İşlemleri
// *****************

function showTimeSelectionPopup() {
  // Kullanıcının seçtiği dili al (Varsayılan: "english")
  const selectedLanguage = localStorage.getItem("currentLanguage") || "english";

  // JSON dosyasını belirle
  const langFile = `data/menu-${selectedLanguage}.json`;

  // JSON'dan çeviri verilerini al
  fetch(langFile)
    .then(response => {
      if (!response.ok) {
        throw new Error("JSON dosyası yüklenemedi");
      }
      return response.json();
    })
    .then(data => {
      const translations = data.popup; // JSON içindeki "popup" kısmını alıyo kanksssss
      console.log("✅ Çeviri verileri yüklendi:", translations);

      // Popup HTML kodunu oluştur
      const timePopup = document.createElement("div");
      timePopup.id = "time-selection-popup";
      timePopup.classList.add("popup-overlay");
      timePopup.innerHTML = `
        <div class="popup-content">
          <h3>${translations.popupMessage}</h3>
          <div class="time-options">
            <button id="btn-30">${translations.time30}</button>
            <button id="btn-60">${translations.time60}</button>
            <button id="btn-120">${translations.time120}</button>
            <button id="btn-240">${translations.time240}</button>
          </div>
        </div>
      `;

      document.body.appendChild(timePopup);

      // Butonlara tıklama olaylarını ekleyelim
      document.getElementById("btn-30").addEventListener("click", () => confirmServiceTime(30, translations.time30));
      document.getElementById("btn-60").addEventListener("click", () => confirmServiceTime(60, translations.time60));
      document.getElementById("btn-120").addEventListener("click", () => confirmServiceTime(120, translations.time120));
      document.getElementById("btn-240").addEventListener("click", () => confirmServiceTime(240, translations.time240));
    })
    .catch(error => {
      console.error("Çeviri verileri yüklenirken hata oluştu:", error);
    });
}
function confirmServiceTime(minutes, label) {
  // Zaman seçimi pop-up'ını kaldır
  const timePopup = document.getElementById('time-selection-popup');
  if (timePopup) {
    timePopup.remove();
  }
  
  console.log(`Service time set to ${minutes} minutes, option: ${label}`);
  
  // Seçilen zamanı localStorage'ye kaydet (dakika ve etiket)
  localStorage.setItem('selectedServiceTime', minutes);
  localStorage.setItem('selectedServiceLabel', label);

  // Ayrı bir API çağrısı yapmadan, bu bilgiler daha sonra laundry verileri ile birlikte payload içinde gönderilecek
  // Örneğin, saveCartToDB fonksiyonunda bu değerleri okuyarak laundry payload'unuza ekleyebilirsiniz.

  // Başarı mesajı pop-up'ını göster
  showSuccessPopup();
}





function showSuccessPopup() {
  console.log("Popup açılıyor");
  // Başarı mesajını gösteren pop-up
  const successPopup = document.createElement('div');
  successPopup.id = 'success-popup';
  successPopup.classList.add('popup-overlay');
  successPopup.innerHTML = `
    <div class="popup-content success">
      <img src="assets/icons/laundry.png" alt="Keepsty Logo" class="keepsty-logo">
      <p class="success-message">
        You are all set!<br>
      </p>
    </div>
  `;
  document.body.appendChild(successPopup);

  // 10 saniye sonra pop-up otomatik kapanır
  setTimeout(closeSuccessPopup, 3000);
}
function closeSuccessPopup() {
  // Başarı pop-up'ını kaldır
  const successPopup = document.getElementById('success-popup');
  if (successPopup) successPopup.remove();

  // **Önce sepet verisini kaydedin**
  saveCartToDB(cart);

  // Sepeti temizle ve ana ekrana dön
  cart = [];           // Sepeti boşalt
  updateCartDisplay(); // Sepet sayacını güncelle
  hideCartScreen();    // Sepet ekranını gizle
  showItemList();      // Ana menüyü göster
}

// *****************
// DOMContentLoaded: Başlangıç İşlemleri
// *****************

document.addEventListener('DOMContentLoaded', () => {
  loadLanguageSelection();

  // Cart butonuna olay dinleyicisi ekleyin
  const cartActionItem = document.getElementById('cart-action');
  if (cartActionItem) {
    cartActionItem.addEventListener('click', showCartScreen);
    console.log('Cart action listener eklendi.');
  } else {
    console.error('Cart action öğesi bulunamadı!');
  }
});

// Kapatma butonunu seç (eğer varsa)
const closeBtn = document.querySelector('.close-btn');
const cartScreen = document.getElementById('cart-screen');
if (closeBtn && cartScreen) {
  closeBtn.addEventListener('click', () => {
    cartScreen.style.display = 'none';
  });
}

// Sepeti açan fonksiyon (örnek olarak)
function openCart() {
  cartScreen.style.display = 'flex'; // CSS'de flex olarak ayarlandığı için
}

function saveCartToDB(cart) {
  // Toplam fiyatı hesaplayın
  let totalPrice = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + (price * item.quantity);
  }, 0);

  // LocalStorage'den oda numarası, kullanıcı adı ve servis zamanı bilgilerini alın
  const roomNumber = localStorage.getItem('roomNumber') || "default";
  const username = localStorage.getItem('username') || "Unknown";
  const serviceTime = parseInt(localStorage.getItem('selectedServiceTime')) || 0;
  const serviceTimeLabel = localStorage.getItem('selectedServiceLabel') || "No service time selected";

  // Tek bir payload oluşturun
  const payload = {
    roomNumber: roomNumber,
    username: username,
    items: cart,
    totalPrice: totalPrice,
    serviceTime: serviceTime,
    serviceTimeLabel: serviceTimeLabel
  };
  function loadLanguageData() {
    // localStorage'dan mevcut dili al, yoksa 'english' varsayılan olarak kullan
    const currentLanguage = localStorage.getItem("currentLanguage") || "english";
    // JSON dosyasının yolunu oluşturun (örneğin: locales/english.json)
    const langFile = `locales/${currentLanguage}.json`;
  
    fetch(langFile)
      .then(response => {
        if (!response.ok) {
          throw new Error("Dil dosyası yüklenemedi");
        }
        return response.json();
      })
      .then(data => {
        // data-i18n özniteliğine sahip tüm elementleri seç
        document.querySelectorAll("[data-i18n]").forEach(el => {
          const key = el.getAttribute("data-i18n");
          if (data[key]) {
            el.textContent = data[key];
          }
        });
      })
      .catch(error => console.error("Dil verileri yüklenirken hata oluştu:", error));
  }
  var langButtons = document.querySelectorAll(".lang-btn");
langButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    var selectedLang = btn.getAttribute("data-lang");
    // data-lang değerlerini, JSON dosyalarınızın isimleriyle eşleyin
    var langMapping = {
      en: "english",
      tr: "turkish",
      fr: "french",
      ar: "arabic",
    };
    var langValue = langMapping[selectedLang] || "english";
    // Seçilen dili localStorage'a kaydet
    localStorage.setItem("currentLanguage", langValue);
    
    // Sayfa içindeki metinleri güncelle
    loadLanguageData();function showTimeSelectionPopup() {
  // Kullanıcının seçtiği dili al (Varsayılan: "english")
  const selectedLanguage = localStorage.getItem("currentLanguage") || "english";

  // JSON dosyasını belirle
  const langFile = `data/menu-${selectedLanguage}.json`;

  // JSON'dan çeviri verilerini al
  fetch(langFile)
    .then(response => {
      if (!response.ok) {
        throw new Error("JSON dosyası yüklenemedi");
      }
      return response.json();
    })
    .then(data => {
      const translations = data.popup; // JSON içindeki "popup" kısmını alıyo kanksssss
      console.log("✅ Çeviri verileri yüklendi:", translations);

      // Popup HTML kodunu oluştur
      const timePopup = document.createElement("div");
      timePopup.id = "time-selection-popup";
      timePopup.classList.add("popup-overlay");
      timePopup.innerHTML = `
        <div class="popup-content">
          <h3>${translations.popupMessage}</h3>
          <div class="time-options">
            <button id="btn-30">${translations.time30}</button>
            <button id="btn-60">${translations.time60}</button>
            <button id="btn-120">${translations.time120}</button>
            <button id="btn-240">${translations.time240}</button>
          </div>
        </div>
      `;

      document.body.appendChild(timePopup);

      // Butonlara tıklama olaylarını ekleyelim
      document.getElementById("btn-30").addEventListener("click", () => confirmServiceTime(30, translations.time30));
      document.getElementById("btn-60").addEventListener("click", () => confirmServiceTime(60, translations.time60));
      document.getElementById("btn-120").addEventListener("click", () => confirmServiceTime(120, translations.time120));
      document.getElementById("btn-240").addEventListener("click", () => confirmServiceTime(240, translations.time240));
    })
    .catch(error => {
      console.error("Çeviri verileri yüklenirken hata oluştu:", error);
    });
}
  });
});

  
  // Sayfa yüklendiğinde dil verilerini yükleyin
  document.addEventListener("DOMContentLoaded", loadLanguageData);
  
  fetch('https://keepstyback.onrender.com/saveLaundry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Laundry saved:', data);
  })
  .catch(error => {
    console.error('Error saving laundry:', error);
  });
}
