// Global Değişkenler
let menuData = {};      // Menü verileri (JSON üzerinden yüklenecek)
let cart = [];          // Sepet dizisi
let botFlow = {};       // Bot akış verileri (opsiyonel)
let currentNode = "start";
let currentLanguage = "en"; // Varsayılan dil
let selectedCategory = "";
let selectedIssue = "";
let chatHistory = [];
let translations = {}; // Global scope for translations


document.addEventListener('DOMContentLoaded', async () => {
  // Fetch translations first
  await fetchTranslations();

  // Then load language selection or apply saved language
  try {
    // İlk olarak DOM hazır mı kontrol et
    if (document.readyState === 'loading') {
      console.log("DOM henüz hazır değil, yükleme beklenecek");
    } else {
      console.log("DOM hazır, dil seçimi ve menü yükleniyor");
    }
    
    // Determine the language to use
    currentLanguage = localStorage.getItem("currentLanguage") || "en"; // Get saved or default to 'en'
    console.log("Current language on load:", currentLanguage);

    // Apply translations to splash screen *before* showing language selection potentially
    applySplashScreenTranslations(currentLanguage);

    // Check if language needs to be selected or if we proceed with saved language
    const savedLanguage = localStorage.getItem("currentLanguage");
    if (!savedLanguage) {
        loadLanguageSelection(); // Show selection if no language is saved
    } else {
        // Hide language selection and show item list if language is already saved
        document.getElementById("language-selection").style.display = "none";
        showItemList(); // Proceed with the saved language
    }

    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const acceptButton = document.getElementById('accept-button');
    const rejectButton = document.getElementById('reject-button');

    if (splashScreen && mainContent && acceptButton && rejectButton) {
        acceptButton.addEventListener('click', () => {
            splashScreen.style.display = 'none';
            mainContent.style.display = 'block'; // Or 'flex', 'grid', etc., depending on your layout
            // Initialize the rest of the application if necessary
            // For example, call a function like initializeApp();
        });

        rejectButton.addEventListener('click', () => {
            // Redirect to the main screen (adjust the path if needed)
            // Assuming the main screen is index.html in the parent directory
            window.location.href = '../../index.html'; // Go two levels up for main index.html
        });
    } else {
        console.error('Splash screen elements not found!');
        // Optionally display main content anyway or show an error
        if (mainContent) mainContent.style.display = 'block';
    }
  } catch (error) {
    console.error("Başlangıç yüklemesinde hata:", error);
    // Hata durumunda varsayılan olarak item list'i göster
    try {
      showItemList();
    } catch (err) {
      console.error("Hata kurtarma işlemi de başarısız:", err);
      alert("Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.");
    }
  }

  // Cart butonuna olay dinleyicisi ekleyin
  const cartActionItem = document.getElementById('cart-action');
  if (cartActionItem) {
    cartActionItem.addEventListener('click', showCartScreen);
    console.log('Cart action listener eklendi.');
  } else {
    console.error('Cart action öğesi bulunamadı!');
  }
});

function showItemList() {
  console.log("showItemList çağrıldı");
  
  try {
    // Ekranları kontrol et ve güvenli bir şekilde değiştir
    const menuElement = document.getElementById('menu');
    const itemListSection = document.getElementById('item-list-section');
    
    if (!menuElement) {
      console.error("'menu' elementi bulunamadı!");
    } else {
      menuElement.style.display = 'none';
    }
    
    if (!itemListSection) {
      console.error("'item-list-section' elementi bulunamadı!");
    } else {
      itemListSection.style.display = 'block';
    }
    
    showScreen('item-list-section');

    // localStorage'dan dil kodunu al (örneğin, "english", "turkish")
    let currentLanguage = localStorage.getItem('currentLanguage') || 'english'; // Varsayılan İngilizce
    console.log("Aktif dil:", currentLanguage);

    // Dil kodunu dosya adı için uygun hale getir (en, tr, fr, ar)
    const langCodeMap = {
        english: 'en',
        turkish: 'tr',
        french: 'fr',
        arabic: 'ar'
    };
    let langCode = langCodeMap[currentLanguage] || 'en'; // Varsayılan 'en'

    // Doğru JSON dosyasının yolunu oluştur
    const jsonFilePath = `data/menu_${langCode}.json`;
    console.log("Menü dosyası yükleniyor:", jsonFilePath);

    fetch(jsonFilePath)  // Doğru dosyayı yükle
      .then(response => {
        if (!response.ok) {
          throw new Error(`JSON dosyası yüklenemedi: ${jsonFilePath}`);
        }
        return response.json();
      })
      .then(data => {
        const itemListDiv = document.getElementById('item-list');
        if (!itemListDiv) {
          console.error("'item-list' elementi bulunamadı!");
          return;
        }
        itemListDiv.innerHTML = '';

        if (!data || !data.menu || !Array.isArray(data.menu)) {
          console.error("Menü verisi geçerli bir format değil:", data);
          return;
        }

        data.menu.forEach(category => {
          const categoryCard = document.createElement('div');
          categoryCard.classList.add('dynamic-menu-option');

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
        console.error('Menü yüklenirken hata oluştu:', error);
        // Burada kullanıcıya hata mesajı gösterebilirsin
        alert(`Menü yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin. Hata: ${error.message}`);
      });
  } catch (error) {
    console.error("showItemList fonksiyonunda hata:", error);
    alert("Menü gösterilirken bir hata oluştu. Lütfen sayfayı yenileyin.");
  }
}

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
      // showCartScreen(); // Artık sepet ekranına yönlendirmiyoruz
      // Sadece ürünü sepete ekliyoruz ve kullanıcı kategori sayfasında kalıyor
    });
    itemCard.appendChild(chooseButton);

    itemsContainer.appendChild(itemCard);
  });

  itemListDiv.appendChild(itemsContainer);
}

function goBack() {
  // Önce geçerli ekranı kontrol edelim
  const currentScreen = document.querySelector('.screen-active');
  console.log("Back tuşuna basıldı, aktif ekran:", currentScreen ? currentScreen.id : "bulunamadı");
  console.log("Önceki ekranlar:", JSON.stringify(previousScreens));
  
  if (previousScreens.length > 0) {
    const lastScreenId = previousScreens.pop(); // Son açılan ekranı al
    console.log("Önceki ekrana dönülüyor:", lastScreenId);
    
    // Şu an aktif olan tüm ekranları gizle
    document.querySelectorAll('.screen-active').forEach(screen => {
      screen.style.display = 'none';
      screen.classList.remove('screen-active');
    });
    
    // 'menu' yerine doğrudan item-list-section'a dön - bu daha güvenli
    if (lastScreenId === 'menu') {
      showItemList(); // Menu boş olduğu için direk item liste dön
    } else {
      // Önceki ekranı bul ve göster
      const previousScreen = document.getElementById(lastScreenId);
      if (previousScreen) {
        previousScreen.style.display = 'block';
        previousScreen.classList.add('screen-active');
        console.log(`Returning to screen: ${lastScreenId}`);
      } else {
        console.error(`Previous screen not found: ${lastScreenId}`);
        showItemList(); // Eğer önceki ekran bulunamazsa ana liste ekranına dön
      }
    }
  } else {
    console.log('No previous screens in history, showing item list');
    showItemList(); // Eğer önceki ekran yoksa, ana ekrana dön
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
  // Mevcut bildirimi temizle (eğer varsa)
  const existingNotification = document.getElementById('add-to-cart-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Yeni bildirimi oluştur
  const notification = document.createElement('div');
  notification.id = 'add-to-cart-notification';
  notification.classList.add('notification');
  notification.textContent = 'Ürün sepetinize eklendi!';
  
  // Bildirimin stilini ayarla
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#9b795c'; // İstenen kahverengi ton
  notification.style.color = 'white';
  notification.style.padding = '15px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  notification.style.zIndex = '9999';
  notification.style.fontWeight = 'bold';
  
  // Bildirimi DOM'a ekle
  document.body.appendChild(notification);
  
  // Bildirimi 3 saniye sonra gizle
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    
    // 0.5 saniye sonra tamamen kaldır
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 3000);
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
  
  // İki adet cart-screen elementinden sadece birini seçmemiz gerekiyor
  if (cartScreen) {
    // Eğer varsa önceki içeriği temizle
    cartScreen.innerHTML = '';
    
    // Sepet ekranını göster
    cartScreen.style.display = 'flex';
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
          <p class="cart-total">Total: ₺${itemTotalPrice.toFixed(2)}</p>
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
    
    console.log("Cart screen displayed");
  } else {
    console.error("Cart screen element not found!");
  }
}

function hideCartScreen() {
  const cartScreen = document.getElementById('cart-screen');
  if (cartScreen) {
    cartScreen.style.display = 'none';
    console.log("Cart screen hidden");
    
    // Geri düğmesinde doğru çalışabilmesi için son ekrana dönelim
    if (previousScreens.length > 0) {
      const lastScreenId = previousScreens[previousScreens.length - 1];
      showScreen(lastScreenId);
    } else {
      showItemList();
    }
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
    const currentScreenId = currentScreen.id;
    // Mevcut ekran ile yeni ekran aynı değilse, önceki ekranı kaydet
    if (currentScreenId !== newScreenId) {
      console.log(`Pushing screen to history: ${currentScreenId}`);
      previousScreens.push(currentScreenId); // Önceki ekranı kaydet
    }
    currentScreen.style.display = 'none';
    currentScreen.classList.remove('screen-active');
  }

  const newScreen = document.getElementById(newScreenId);
  if (newScreen) {
    console.log(`Showing screen: ${newScreenId}`);
    newScreen.style.display = 'block';
    newScreen.classList.add('screen-active');
  } else {
    console.error(`Screen not found: ${newScreenId}`);
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
  // Zaman seçme pop-up'ını oluştur
  const timePopup = document.createElement('div');
  timePopup.id = 'time-selection-popup';
  timePopup.classList.add('popup-overlay');
  timePopup.innerHTML = `
    <div class="popup-content">
      <h3>What time would you like to get a service?</h3>
      <div class="time-options">
        <button id="btn-30">In 30 minutes</button>
        <button id="btn-60">In 1 hour</button>
        <button id="btn-120">In 2 hours</button>
        <button id="btn-240">In 4 hours</button>
      </div>
    </div>
  `;
  document.body.appendChild(timePopup);

  // Butonlara tıklama olaylarını ekleyin ve seçilen etiketi gönderin
  document.getElementById('btn-30').addEventListener('click', () => confirmServiceTime(30, 'In 30 minutes'));
  document.getElementById('btn-60').addEventListener('click', () => confirmServiceTime(60, 'In 1 hour'));
  document.getElementById('btn-120').addEventListener('click', () => confirmServiceTime(120, 'In 2 hours'));
  document.getElementById('btn-240').addEventListener('click', () => confirmServiceTime(240, 'In 4 hours'));
}
function confirmServiceTime(minutes, label) {
  // Zaman seçimi pop-up'ını kaldır (mevcut kod)
  const timePopup = document.getElementById('time-selection-popup');
  if (timePopup) {
    timePopup.remove();
  }

  // Şu anki saati al
  const now = new Date();
  const currentHour = now.getHours();

   // Hizmet verilmeyen saat aralığını kontrol et (00:00 ile 09:00 arası)
   if (currentHour >= 22 && currentHour < 10) {
    alert("We are currently not providing service. Our service hours are between 09:00 and 00:00.");
    return; // Fonksiyondan erken çık, kaydetme işlemini yapma
}


  console.log(`Service time set to ${minutes} minutes, option: ${label}`);

  // Seçilen zamanı localStorage'ye kaydet (dakika ve etiket) - mevcut kod
  localStorage.setItem('selectedServiceTime', minutes);
  localStorage.setItem('selectedServiceLabel', label);

  // Başarı mesajı pop-up'ını göster - mevcut kod
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
      <img src="assets/icons/keepsty-character.png" alt="Keepsty Logo" class="keepsty-logo">
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

// Sepet verilerini veritabanına kaydeden fonksiyon
function saveCartToDB(cart) {
  console.log("Sepet verileri kaydediliyor:", cart);
  // Burada gerçek bir veritabanı işlemi yapılabilir
  // Örneğin, localStorage veya bir API kullanılabilir
  try {
    localStorage.setItem('roomservice_cart', JSON.stringify(cart));
    console.log("Sepet verileri başarıyla kaydedildi.");
  } catch (error) {
    console.error("Sepet verileri kaydedilirken hata oluştu:", error);
  }
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

// Dil seçim ekranını gösteren fonksiyon
function loadLanguageSelection() {
  console.log("Dil seçimi yükleniyor");
  const languageContainer = document.getElementById("languages");
  const languageSelectionDiv = document.getElementById("language-selection");

  if (!languageContainer || !languageSelectionDiv) {
    console.error("Dil seçim konteyneri veya bölümü bulunamadı!");
    return;
  }
  languageContainer.innerHTML = ''; // Clear previous buttons
  languageSelectionDiv.style.display = "flex"; // Make sure it's visible

  // Dilleri tanımla (eşleşmeyi sağlamak için kodları kullan)
  const languages = [
    { name: "English", code: "en" },
    { name: "Türkçe", code: "tr" },
    { name: "Français", code: "fr" },
    { name: "العربية", code: "ar" }
  ];

  // Dil butonlarını oluştur
  languages.forEach(lang => {
    const button = document.createElement("button");
    button.textContent = lang.name;
    button.addEventListener("click", () => {
      currentLanguage = lang.code; // Set the current language
      localStorage.setItem("currentLanguage", currentLanguage); // Seçilen dili kaydet

      // Apply translations to splash screen *after* selection
      applySplashScreenTranslations(currentLanguage);

      languageSelectionDiv.style.display = "none"; // Dil seçim ekranını gizle
      showItemList(); // Menüyü göster (veya sonraki adımı tetikle)
    });
    languageContainer.appendChild(button);
  });
}

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

// Function to fetch translations
async function fetchTranslations() {
    try {
        const response = await fetch('translations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        console.log("Translations loaded:", translations);
    } catch (error) {
        console.error("Could not load translations:", error);
    }
}

// Function to apply translations to splash screen buttons
function applySplashScreenTranslations(lang) {
    const acceptButton = document.getElementById('accept-button');
    const rejectButton = document.getElementById('reject-button');

    if (translations[lang] && acceptButton && rejectButton) {
        acceptButton.textContent = translations[lang]['accept'] || 'Accept';
        rejectButton.textContent = translations[lang]['reject'] || 'Reject';
        console.log(`Splash screen buttons translated to ${lang}`);
    } else {
        console.warn(`Translations for language '${lang}' not found or buttons missing.`);
        // Fallback to default English text if translation missing
        if (acceptButton) acceptButton.textContent = 'Accept';
        if (rejectButton) rejectButton.textContent = 'Reject';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const formScreen = document.getElementById("form-screen");
    const languageScreen = document.getElementById("language-screen");
    const cardScreen = document.getElementById("card-screen");
    const userForm = document.getElementById("user-form");
    const langButtons = document.querySelectorAll(".lang-btn");
    const cards = document.querySelectorAll(".card");
  
    console.log(formScreen, languageScreen, cardScreen); // Debug için ID'lerin doğruluğunu kontrol et
    
    // URL parametrelerini analiz et
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('hotel') || 'demo-hotel'; // varsayılan demo-hotel
    
    // Hotel ID'yi localStorage'a kaydet
    localStorage.setItem("currentHotelId", hotelId);
    
    console.log("Aktif Otel ID:", hotelId);
  
    // 🟢 1️⃣ Form Gönderildiğinde Dil Seçim Ekranına Geçiş
    userForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Sayfanın yenilenmesini engelle
  
      const name = document.getElementById("name").value;
      const room = document.getElementById("room").value;
  
      if (name && room) {
        console.log(
          "✅ Form başarıyla dolduruldu, dil seçim ekranına geçiş yapılıyor."
        );
  
        // Hataları tespit etmek için ekran değişikliğini test edelim
        console.log("📢 Form ekranı kapanıyor, dil seçimi açılıyor.");
  
        // Giriş formunu gizle, dil seçim ekranını aç
        formScreen.style.display = "none"; // Form ekranını tamamen gizle
        languageScreen.style.display = "block"; // Dil seçim ekranını görünür yap
      } else {
        alert("Please fill in all fields!"); // Eksik bilgi girildiğinde uyarı
      }
    });
  
    // 🟢 2️⃣ Dil Seçildiğinde Kart Ekranına Geçiş
    langButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedLang = button.getAttribute("data-lang");
        localStorage.setItem("selectedLanguage", selectedLang);
        console.log(`🌍 Seçilen Dil: ${selectedLang}`);
  
        loadLanguage(selectedLang);
  
        // Dil seçim ekranını gizle, kart ekranını göster
        languageScreen.style.display = "none";
        cardScreen.style.display = "block";
      });
    });
  
    // 🟢 3️⃣ JSON Dosyasından Dil Verilerini Yükleme
    function loadLanguage(lang) {
      fetch(`languages/${lang}.json`)
        .then((response) => response.json())
        .then((data) => {
          document.querySelectorAll("[data-app]").forEach((card) => {
            const appName = card.getAttribute("data-app");
            card.querySelector("h3").textContent = data[appName] || appName;
          });
        })
        .catch((error) =>
          console.error("⚠️ Dil dosyası yüklenirken hata oluştu:", error)
        );
    }
  
    // 🟢 4️⃣ Önceden Seçilen Dil Varsa Yükle
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
      loadLanguage(savedLang);
    }
  });
  
  // Kart (servis) tıklama işlemleri
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      // Tıklanan karta 'clicked' sınıfını ekle (animasyon için)
      card.classList.add("clicked");
  
      // Hangi uygulamanın seçildiğini data-app attribute'u ile al
      const appName = card.getAttribute("data-app");
  
      // Eğer appName tanımlı değilse hata ver ve işlemi durdur
      if (!appName) {
        console.error("⚠️ Yönlendirme başarısız: 'data-app' değeri bulunamadı!");
        return;
      }
      
      // Otel ID bilgisini al
      const hotelId = localStorage.getItem("currentHotelId") || 'demo-hotel';
  
      console.log(
        `🛎️ Kart tıklandı, yönlendiriliyor: apps/${appName}/index.html?hotel=${hotelId}`
      );
  
      // 1.2 saniye sonra ilgili uygulamaya yönlendir (otel ID parametresi ile)
      setTimeout(() => {
        window.location.href = `apps/${appName}/index.html?hotel=${hotelId}`;
      }, 1200);
    });
  });
  function showScreen(screenId) {
    // Tüm ekranları gizle
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.add("hidden");
    });
  
    // İlgili ekranı göster
    document.getElementById(screenId).classList.remove("hidden");
  
    // Sayfayı en üste kaydır
    window.scrollTo(0, 0);
  }
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", function () {
      showScreen("card-screen"); // Dil seçildikten sonra kart ekranına git
    });
  });
  // public/script.js
  
  // Form submit olayını dinleyin
  document.getElementById("user-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
  
    // Formdaki input değerlerini oku
    const name = document.getElementById("name").value;
    const room = document.getElementById("room").value;
  
    // Alınan verileri localStorage'ye kaydet
    localStorage.setItem("username", name);
    localStorage.setItem("roomNumber", room);
  
    console.log("Kullanıcı adı:", name, "Oda numarası:", room);
  
    // Sohbet ekranını başlatan fonksiyonu çağırın
    processStep("start");
  });
  
  // kaymayı engellemek için bu kod kanka
  let initialHeight = window.innerHeight;
  
  window.addEventListener("resize", () => {
    document.body.style.height = initialHeight + "px";
    document.documentElement.style.height = initialHeight + "px";
    window.scrollTo(0, 0);
  });
  
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("focus", () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    });
  });

