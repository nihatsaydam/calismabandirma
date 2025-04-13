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
  // İlk yükleme olayında dil seçimi ve ardından menü yüklenir
  try {
    // İlk olarak DOM hazır mı kontrol et
    if (document.readyState === 'loading') {
      console.log("DOM henüz hazır değil, yükleme beklenecek");
    } else {
      console.log("DOM hazır, dil seçimi ve menü yükleniyor");
    }
  
    // Dil seçimi ekranını yükle
    loadLanguageSelection();
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
      showCartScreen();
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
  if (!languageContainer) {
    console.error("Dil seçim konteyneri bulunamadı!");
    return;
  }
  
  // Dilleri tanımla
  const languages = [
    { name: "English", code: "english" },
    { name: "Türkçe", code: "turkish" }, 
    { name: "Français", code: "french" },
    { name: "العربية", code: "arabic" }
  ];
  
  // Dil butonlarını oluştur
  languages.forEach(lang => {
    const button = document.createElement("button");
    button.textContent = lang.name;
    button.addEventListener("click", () => {
      // Seçilen dili kaydet
      localStorage.setItem("currentLanguage", lang.code);
      // Dil seçim ekranını gizle
      document.getElementById("language-selection").style.display = "none";
      // Menüyü göster
      showItemList();
    });
    languageContainer.appendChild(button);
  });
  
  // Daha önce seçilmiş dil varsa dil seçim ekranını gösterme
  const savedLanguage = localStorage.getItem("currentLanguage");
  if (savedLanguage) {
    document.getElementById("language-selection").style.display = "none";
    showItemList();
  } else {
    document.getElementById("language-selection").style.display = "flex";
  }
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

