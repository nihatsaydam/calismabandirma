// ============================
// Global Değişkenler
// ============================
let menuData = {};      // Menü verileri (JSON üzerinden yüklenecek)
let cart = [];          // Sepet dizisi
let botFlow = {};       // Bot akış verileri (opsiyonel)
let currentNode = "start";
let currentLanguage = localStorage.getItem("currentLanguage") || "en"; // Eğer daha önce seçtiyse, onu al; yoksa İngilizce yap
let selectedCategory = "";
let selectedIssue = "";
let chatHistory = [];

// Önceki ekranları kaydetmek için dizi
let previousScreens = []; 

// ============================
// Mobil Yatay Kaydırma İyileştirmesi
// ============================
document.addEventListener("DOMContentLoaded", function() {
  // Ana sayfa yüklendikten sonra menü container'ını merkeze al
  centerMenuContainers();
  
  // Sayfa yüklendiğinde mobil kaydırma fonksiyonlarını başlat
  enableMobileHorizontalScroll();
  
  // Ekran boyutu değiştiğinde tekrar kontrol et
  window.addEventListener('resize', function() {
    enableMobileHorizontalScroll();
    centerMenuContainers();
  });
  
  // Orientation değişikliğinde özel olarak kontrol et
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      centerMenuContainers();
    }, 300);
  });
});

// Disable scroll indicators setup function - we no longer want these
function setupScrollIndicators() {
  // Function disabled - no longer showing scroll indicators
}

function enableMobileHorizontalScroll() {
  // Sadece mobil cihazlarda çalış
  if (window.innerWidth <= 600) {
    // Tüm yatay kaydırma alanlarını belirle
    const scrollContainers = [
      '.menu-options',
      '.category-cards-container'
    ];
    
    scrollContainers.forEach(selector => {
      const containers = document.querySelectorAll(selector);
      
      containers.forEach(container => {
        // Dokunma olayları için scroll kontrolü ekle
        if (!container.getAttribute('scroll-enabled')) {
          // Touch başlama pozisyonu
          let startX, startY;
          let isScrolling = false;
          
          // container.addEventListener('touchstart', function(e) {
          //   startX = e.touches[0].clientX;
          //   startY = e.touches[0].clientY;
          //   isScrolling = false;
          // }, { passive: true });
          
          // container.addEventListener('touchmove', function(e) {
          //   if (!startX || !startY) return;
          //   
          //   const currentX = e.touches[0].clientX;
          //   const currentY = e.touches[0].clientY;
          //   
          //   // Yatay hareket miktarı dikey hareketten fazlaysa, sayfa kaydırmayı engelle
          //   const diffX = Math.abs(startX - currentX);
          //   const diffY = Math.abs(startY - currentY);
          //   
          //   if (diffX > diffY) {
          //     if (!isScrolling) {
          //       isScrolling = true;
          //     }
          //     
          //     e.preventDefault();
          //     
          //     // Özel dokunmatik kaydırma - daha hızlı
          //     const moveX = startX - currentX;
          //     container.scrollLeft += moveX * 2.0; // Increased scroll sensitivity
          //     startX = currentX;
          //   }
          // }, { passive: false });
          // 
          // container.addEventListener('touchend', function() {
          //   if (isScrolling) {
          //     // Kaydırma momentumunu düzgün yavaşlat
          //     const containerRect = container.getBoundingClientRect();
          //     const itemWidth = containerRect.width * 0.5; // Bir öğe genişliği tahmini
          //     
          //     // En yakın öğeye kaydır
          //     const remainder = container.scrollLeft % itemWidth;
          //     let targetScroll;
          //     
          //     if (remainder > itemWidth / 2) {
          //       targetScroll = container.scrollLeft + (itemWidth - remainder);
          //     } else {
          //       targetScroll = container.scrollLeft - remainder;
          //     }
          //     
          //     container.scrollTo({
          //       left: targetScroll,
          //       behavior: 'auto'
          //     });
          //   }
          //   
          //   startX = null;
          //   startY = null;
          //   isScrolling = false;
          // }, { passive: true });
          
          // Kaydırma özelliği eklendiğini işaretle
          container.setAttribute('scroll-enabled', 'true');
        }
      });
    });
  }
}

// Yatay kaydırma için yardımcı fonksiyon (Bu fonksiyon artık kullanılmıyor)
// Scroll indicators ve oklarını kaldırdık
function scrollMenuHorizontally(direction) {
  // Bu fonksiyon artık kullanılmıyor
}

// ============================
// Dil Seçimi ve Hoş Geldiniz Popup'ı
// ============================
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
  localStorage.setItem("currentLanguage", langCode);
  currentLanguage = langCode;
  location.reload();
}

function showWelcomePopup() {
  const messages = {
    en: `
      Welcome to Keepsty Housekeeping! I'm here to make your stay as comfortable and seamless as possible.
      Whether you need fresh towels, room cleaning, or any other housekeeping services, I'm just a message away.
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
    document.getElementById("app").style.display = "block"; // Menü ekranını göster
  };

  document.getElementById("popup-no").onclick = () => {
    document.body.removeChild(popup);
    alert("Thank you!");
  };
}

// ============================
// Temizlik Pop-up İşlemleri (Opsiyonel)
// ============================
function showTimePopup() {
  document.getElementById("time-popup").style.display = "flex";
}

function hideTimePopup() {
  document.getElementById("time-popup").style.display = "none";
}

function setQuickOption(minutes) {
  const currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() + minutes);
  const hours = currentDate.getHours();
  const minutesPadded = String(currentDate.getMinutes()).padStart(2, "0");
  const selectedTime = `${hours}:${minutesPadded}`;
  alert(`Selected Time: ${selectedTime}`);
}

let selectedCleanOption = "";
function selectCleanOption(optionName) {
  selectedCleanOption = optionName;
  console.log("✅ Seçilen Temizlik Seçeneği:", selectedCleanOption);
  
  // Tüm butonlardan selected sınıfını kaldır
  const buttons = document.querySelectorAll("#clean-options button");
  buttons.forEach(button => {
    button.classList.remove("selected");
  });
  
  // Tıklanan butona selected sınıfını ekle - içerik yerine data-option kullanarak dil bağımsız çalışır
  buttons.forEach(button => {
    // getText kullanımı dil bağımsız çalışması için
    const buttonText = button.textContent.trim();
    const dataOption = button.getAttribute('data-option');
    
    // İçeriğe veya data-option'a göre eşleştir (böylece eski ve yeni kod birlikte çalışır)
    if (buttonText === optionName || 
        (dataOption && dataOption.toLowerCase() === optionName.toLowerCase().replace(/\s+/g, '')) ||
        button.textContent === optionName) {
      button.classList.add("selected");
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const confirmButton = document.getElementById("confirm-time");
  if (confirmButton) {
    confirmButton.addEventListener("click", function() {
      if (!selectedCleanOption) {
        alert("Please select a cleaning option!");
        return;
      }
      
      // Sepete eklemek yerine direkt başarı mesajı göster
      hideTimePopup();
      showCleaningConfirmation(selectedCleanOption);
    });
  }
  
  // Ensure cancel button works correctly
  const cancelButton = document.getElementById("cancel-time");
  if (cancelButton) {
    cancelButton.addEventListener("click", hideTimePopup);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const timeOptionsOutside = document.querySelectorAll(".quick-options-outside");
  timeOptionsOutside.forEach(option => (option.style.display = "none"));
});

// ============================
// Menü ve Kategori İşlemleri
// ============================
function showItemList() {
  // Mevcut aktif ekranı previousScreens'e kaydet
  const currentActive = document.querySelector('.screen-active');
  if (currentActive && currentActive.id !== 'item-list-section') {
    previousScreens.push(currentActive.id);
    currentActive.style.display = 'none';
    currentActive.classList.remove('screen-active');
  }

  document.getElementById('menu').style.display = 'none';
  document.getElementById('item-list-section').style.display = 'block';
  document.getElementById('item-list-section').classList.add('screen-active');
  
  console.log("🔍 previousScreens (showItemList):", previousScreens);
  
  let currentLanguage = localStorage.getItem("currentLanguage") || "en";
  console.log(`🌍 Yüklenen Menü Dili: ${currentLanguage}`);
  fetch(`data/menu-${currentLanguage}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`JSON dosyası yüklenemedi: data/menu-${currentLanguage}.json`);
      }
      return response.json();
    })
    .then(data => {
      console.log("✅ Yüklenen Menü JSON:", data);
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
      
      // Ekran konumunu ayarla - merkeze
      centerMenuContainers();
      
      // Kategorileri gösterdikten sonra mobil kaydırma özelliklerini etkinleştir
      setTimeout(() => {
        enableMobileHorizontalScroll();
        setupCategoryCardsDragScroll();
      }, 100);
    })
    .catch(error => {
      console.error('⚠ Menü yüklenirken hata oluştu:', error);
    });
}

// Add touch/mouse drag scrolling for category cards container
function setupCategoryCardsDragScroll() {
  const categoryCardsContainers = document.querySelectorAll('.category-cards-container');
  
  categoryCardsContainers.forEach(container => {
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Mouse events
    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseup', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });
    
    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      container.scrollLeft = scrollLeft - walk;
    });
    
    // Touch events
    container.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    }, { passive: true });
    
    container.addEventListener('touchend', () => {
      isDown = false;
    });
    
    container.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  });
}

function showCategoryItems(category) {
  // Kategori içinde kalıp başka kategorilere mi gidiyor?
  const isAlreadyInItemList = document.querySelector('.screen-active')?.id === 'item-list-section';
  
  // Eğer zaten ürün listesindeyse, bir daha previousScreens'e ekleme yapma
  if (!isAlreadyInItemList) {
    const currentActive = document.querySelector('.screen-active');
    if (currentActive) {
      previousScreens.push(currentActive.id);
      console.log("📝 Kaydedilen ekran:", currentActive.id);
    }
  } else {
    console.log("🔍 Zaten item-list içindeyiz, previousScreens'e eklemiyoruz");
  }

  const itemListDiv = document.getElementById('item-list');
  itemListDiv.innerHTML = ''; // Önceki içeriği temizle
  
  // items-container'ı benzersiz bir ID ile oluştur
  const containerID = "category-" + (category.id || category.name || "category").replace(/\s+/g, '-').toLowerCase();
  const itemsContainer = document.createElement('div');
  itemsContainer.classList.add('items-container');
  itemsContainer.id = containerID;
  
  // Aktif ekranı güncelle
  document.querySelectorAll('.screen-active').forEach(screen => {
    screen.classList.remove('screen-active');
  });
  
  document.getElementById('item-list-section').classList.add('screen-active');
  
  console.log("🔍 previousScreens (showCategoryItems):", previousScreens);
  
  // Mobil cihaz kontrolü
  const isMobile = window.innerWidth <= 600;
  
  category.items.forEach(item => {
    item.quantity = item.quantity || 0;
    const itemCard = document.createElement('div');
    itemCard.classList.add('item-card');
    
    // İtem adı ve miktar kontrolleri için container
    const itemContent = document.createElement('div');
    itemContent.className = 'item-content';
    
    const itemName = document.createElement('h4');
    itemName.textContent = item.name;
    
    if (isMobile) {
      itemContent.appendChild(itemName);
      itemCard.appendChild(itemContent);
    } else {
      itemCard.appendChild(itemName);
    }
    
    const quantityContainer = document.createElement('div');
    quantityContainer.classList.add('quantity-container');
    
    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '–';
    decreaseButton.addEventListener('click', () => {
      if (item.quantity > 0) {
        item.quantity--;
        quantityDisplay.textContent = item.quantity;
        removeFromCart(item);
      }
    });
    
    const quantityDisplay = document.createElement('span');
    quantityDisplay.textContent = item.quantity;
    quantityDisplay.classList.add('quantity-display');
    
    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.addEventListener('click', () => {
      item.quantity++;
      quantityDisplay.textContent = item.quantity;
      addToCart(item);
    });
    
    quantityContainer.appendChild(decreaseButton);
    quantityContainer.appendChild(quantityDisplay);
    quantityContainer.appendChild(increaseButton);
    
    if (isMobile) {
      itemCard.appendChild(quantityContainer);
    } else {
      itemCard.appendChild(quantityContainer);
    }
    
    itemsContainer.appendChild(itemCard);
  });
  
  itemListDiv.appendChild(itemsContainer);
  
  // Ekran konumunu ayarla - merkeze
  centerMenuContainers();
  
  // Mobil kullanım için kaydırma etkinleştirme
  setTimeout(() => enableMobileHorizontalScroll(), 100);
  
  // After updating the DOM, setup the scroll functionality again
  setTimeout(() => {
    setupCategoryCardsDragScroll();
  }, 100);
}

function goBack() {
  console.log(" Back tuşuna basıldı. Mevcut previousScreens:", previousScreens);
  
  if (previousScreens.length > 0) {
    const lastScreenId = previousScreens.pop(); // Son açılan ekranı al
    console.log(`⬅️ Önceki ekrana dönülüyor: ${lastScreenId}`);

    // Aktif ekranları gizle
    document.querySelectorAll('.screen-active').forEach(screen => {
      screen.style.display = 'none';
      screen.classList.remove('screen-active');
    });

    // Önceki ekranı göster
    const previousScreen = document.getElementById(lastScreenId);
    if (previousScreen) {
      previousScreen.style.display = 'block';
      previousScreen.classList.add('screen-active');
      console.log(`Ekran gösterildi: ${lastScreenId}`);
    } else {
      console.log(`Önceki ekran bulunamadı: ${lastScreenId}`);
      
      // Eğer önceki ekran bulunamazsa - kategori içinde miyiz kontrol et
      const itemListDiv = document.getElementById('item-list');
      const itemsContainer = itemListDiv.querySelector('.items-container');
      
      if (itemsContainer) {
        // Kategori içindeyiz, ana kategori listesine dönelim
        console.log("Kategori içinden ana listeye dönülüyor");
        showItemList();
      } else {
        // Değilse ana menüye dön
        console.log("Ana menüye dönülüyor");
        document.getElementById('item-list-section').style.display = 'none';
        document.getElementById('menu').style.display = 'block';
        document.getElementById('menu').classList.add('screen-active');
      }
    }
  } else {
    // Önceki ekran yoksa, ana menüye dön
    console.log("🏠 previousScreens boş, ana menüye dönülüyor");
    document.getElementById('item-list-section').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    document.getElementById('menu').classList.add('screen-active');
  }
  
  // Sepet ekranını kapat
  hideCartScreen();
}

// ============================
// Sepet İşlevleri
// ============================

// Sepete ekleme
function addToCart(item) {
  console.log("addToCart called with:", item);
  
  // Öğe kimliği veya isim kontrolü - her ürün için benzersiz tanımlayıcı oluştur
  const itemIdentifier = item.id || item.name;
  
  let existingItem = cart.find(cartItem => 
    (cartItem.id && cartItem.id === item.id) || 
    (cartItem.name && cartItem.name === item.name)
  );
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Yeni bir kopya oluştur ve sepete ekle
    const newItem = { ...item, quantity: 1 };
    cart.push(newItem);
    console.log("New item added to cart:", newItem);
  }
  
  updateCartDisplay();
}

// Sepetten çıkarma
function removeFromCart(item) {
  let existingItem = cart.find(cartItem => cartItem.id === item.id || cartItem.name === item.name);
  if (existingItem) {
    existingItem.quantity--;
    if (existingItem.quantity <= 0) {
      cart = cart.filter(cartItem => cartItem.id !== item.id);
    }
  }
  updateCartDisplay();
}

// Sepeti güncelleme ekranı
function updateCartDisplay() {
  let total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = `Cart (${total})`;
  }
  console.log("Cart updated:", cart);
}

// Sepet verilerini sunucuya kaydeden fonksiyon (MongoDB'ye POST)
async function saveCartData() {
  const username = localStorage.getItem("username") || "defaultUsername";
  const roomNumber = localStorage.getItem("roomNumber") || "defaultRoomNumber";
  try {
    const response = await fetch('https://keepstyback.onrender.com/save-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        roomNumber: roomNumber,
        cartItems: cart
      })
    });
    if (!response.ok) {
      throw new Error('Failed to save cart data.');
    }
    const result = await response.json();
    console.log("✅ Cart data saved to MongoDB:", result);
    return result;
  } catch (error) {
    console.error("❌ Error saving cart data:", error);
    throw error;
  }
}

// Sepet ekranını gösteren fonksiyon
function showCartScreen() {
  const cartScreen = document.getElementById('cart-screen');
  cartScreen.style.display = 'flex';
  cartScreen.innerHTML = '';  // Önceki içerikleri temizle

  // Üst kısım: Başlık ve Kapatma Butonu
  const header = document.createElement('div');
  header.className = 'cart-header';
  const title = document.createElement('h2');
  title.textContent = 'Your Care Basket';
  header.appendChild(title);
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.textContent = 'X';
  closeButton.addEventListener('click', hideCartScreen);
  header.appendChild(closeButton);
  cartScreen.appendChild(header);

  // Orta kısım: Sepet ürünlerini listeleyecek alan
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'cart-items-container';
  
  if (cart.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Cart is currently empty.';
    itemsContainer.appendChild(emptyMessage);
  } else {
    // Sepetin içeriğini konsola yazdır (debug için)
    console.log("Cart contents:", JSON.stringify(cart));
    
    cart.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      
      // Ürünleri benzersiz numaralarla göster
      const itemName = item.name || `Item ${index+1}`;
      itemDiv.innerHTML = `
        <p>${itemName} (x${item.quantity})</p>
        <div class="cart-item-controls">
          <button class="remove-item" onclick="removeItemFromCart(${index})">Remove</button>
        </div>
      `;
      itemsContainer.appendChild(itemDiv);
    });
  }
  cartScreen.appendChild(itemsContainer);

  // "Request" butonu: Sepet verilerini kaydet ve ekranı kapat
  const requestButton = document.createElement('button');
  requestButton.id = 'request-btn';
  requestButton.textContent = 'Request';
  requestButton.addEventListener('click', async () => {
    console.log("🟢 Request button clicked!");
    try {
      const saveResult = await saveCartData();
      console.log("✅ Sepet başarıyla kaydedildi:", saveResult);
      showConfirmationPopup();
      cart = [];
      updateCartDisplay();
      hideCartScreen();
    } catch (error) {
      console.error("❌ Sepet kaydedilemedi:", error);
      alert("Failed to save cart data, please try again later.");
    }
  });
  cartScreen.appendChild(requestButton);
}

// Sepetten öğe silme - yeni fonksiyon
function removeItemFromCart(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    updateCartDisplay();
    showCartScreen(); // Sepet görünümünü yenile
  }
}

function hideCartScreen() {
  const cartScreen = document.getElementById('cart-screen');
  if (cartScreen) {
    cartScreen.style.display = 'none';
  }
}

// ============================
// Confirmation Popup
// ============================
function showConfirmationPopup() {
  document.body.style.backdropFilter = "blur(5px)";
  document.body.style.overflow = "hidden";
  const successPopup = document.createElement('div');
  successPopup.id = 'success-popup';
  successPopup.classList.add('popup-overlay');
  successPopup.style.display = 'flex';
  successPopup.style.alignItems = 'center';
  successPopup.style.justifyContent = 'center';
  successPopup.style.position = 'fixed';
  successPopup.style.top = '0';
  successPopup.style.left = '0';
  successPopup.style.width = '100%';
  successPopup.style.height = '100%';
  successPopup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  successPopup.innerHTML = `
    <div class="popup-content success" style="
      background: white; 
      padding: 20px; 
      border-radius: 15px;
      text-align: center;
      max-width: 350px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    ">
      <img src="assets/images/keepsty-logo.png" alt="Keepsty Logo" class="keepsty-logo" style="width: 120px; height: auto;">
      <h3 class="success-title" style="margin-top: 10px; font-size: 18px;">You are all set!</h3>
    </div>
  `;
  document.body.appendChild(successPopup);
  setTimeout(closeSuccessPopup, 3000);
}

function closeSuccessPopup() {
  const popup = document.getElementById('success-popup');
  if (popup) {
    popup.remove();
  }
  document.body.style.backdropFilter = "none";
  document.body.style.overflow = "auto";
}

// ============================
// Genel Menü Gösterimi
// ============================
function showMainMenu() {
  document.getElementById('item-list-section').style.display = 'none';
  document.getElementById('chatbot').style.display = 'none';
  document.getElementById('cart-screen').style.display = 'none';
  document.getElementById('time-popup').style.display = 'none';
  document.getElementById('menu').style.display = 'block';
  hideCartScreen();
}

// ============================
// Temizlik talebi için özel onay popup'ı
// ============================
function showCleaningConfirmation(cleaningType) {
  document.body.style.backdropFilter = "blur(5px)";
  document.body.style.overflow = "hidden";
  const successPopup = document.createElement('div');
  successPopup.id = 'success-popup';
  successPopup.classList.add('popup-overlay');
  successPopup.style.display = 'flex';
  successPopup.style.alignItems = 'center';
  successPopup.style.justifyContent = 'center';
  successPopup.style.position = 'fixed';
  successPopup.style.top = '0';
  successPopup.style.left = '0';
  successPopup.style.width = '100%';
  successPopup.style.height = '100%';
  successPopup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  successPopup.innerHTML = `
    <div class="popup-content success" style="
      background: white; 
      padding: 20px; 
      border-radius: 15px;
      text-align: center;
      max-width: 350px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    ">
      <img src="assets/images/keepsty-logo.png" alt="Keepsty Logo" class="keepsty-logo" style="width: 120px; height: auto;">
      <h3 class="success-title" style="margin-top: 10px; font-size: 18px;">You are all set!</h3>
      <p>Your ${cleaningType} cleaning request has been received.</p>
    </div>
  `;
  document.body.appendChild(successPopup);
  setTimeout(closeSuccessPopup, 3000);
}

// ============================
// DOMContentLoaded: Başlangıç İşlemleri
// ============================
document.addEventListener("DOMContentLoaded", () => {
  let currentLanguage = localStorage.getItem("currentLanguage") || "en";
  console.log(`🌍 Kullanıcının Seçtiği Dil: ${currentLanguage}`);
  
  // Load the main menu dynamically
  loadMainMenu(currentLanguage); 
  
  // Load other translations
  translatePopupTexts(currentLanguage);

  // Cart butonuna olay dinleyicisi ekle
  const cartActionItem = document.getElementById('cart-action');
  if (cartActionItem) {
    cartActionItem.addEventListener('click', showCartScreen);
    console.log('Cart action listener eklendi.');
  } else {
    console.error('Cart action öğesi bulunamadı!');
  }
  // Kapatma butonu (varsa) için
  const closeBtn = document.querySelector('.close-btn');
  const cartScreen = document.getElementById('cart-screen');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      cartScreen.style.display = 'none';
    });
  }
});

function translatePopupTexts(language) {
  fetch(`data/menu-${language}.json`)
    .then(response => response.json())
    .then(data => {
      // Check if the 'popup' key exists specific to this app's structure
      // If not, it might be using the guide structure, so don't error out
      if (data.popup) { 
        // Popup başlık ve alt başlıkları
        const timePopupTitle = document.querySelector("#time-popup h3");
        const cleanOptionsTitle = document.querySelector("#clean-options h4");
        if (timePopupTitle) timePopupTitle.textContent = data.popup.cleaningTitle;
        if (cleanOptionsTitle) cleanOptionsTitle.textContent = data.popup.cleaningOptions;
        
        // Temizlik seçenekleri butonları - data-option değerlerini koru
        const roomBtn = document.querySelector("#clean-options button[data-option='room']");
        const bathroomBtn = document.querySelector("#clean-options button[data-option='bathroom']");
        const wholeRoomBtn = document.querySelector("#clean-options button[data-option='wholeroom']");
        const refreshBtn = document.querySelector("#clean-options button[data-option='refresh']");
        
        // Butonların metinlerini güncelle
        if (roomBtn) roomBtn.textContent = data.popup.room;
        if (bathroomBtn) bathroomBtn.textContent = data.popup.bathroom;
        if (wholeRoomBtn) wholeRoomBtn.textContent = data.popup.wholeRoom;
        if (refreshBtn) refreshBtn.textContent = data.popup.refresh;
        
        // onclick handler'ları güncelle (Ensure keys exist before setting attributes)
        if (roomBtn && data.popup.room) roomBtn.setAttribute('onclick', `selectCleanOption('${data.popup.room}')`);
        if (bathroomBtn && data.popup.bathroom) bathroomBtn.setAttribute('onclick', `selectCleanOption('${data.popup.bathroom}')`);
        if (wholeRoomBtn && data.popup.wholeRoom) wholeRoomBtn.setAttribute('onclick', `selectCleanOption('${data.popup.wholeRoom}')`);
        if (refreshBtn && data.popup.refresh) refreshBtn.setAttribute('onclick', `selectCleanOption('${data.popup.refresh}')`);
        
        // Onay ve İptal butonları
        const confirmBtn = document.getElementById("confirm-time");
        const cancelBtn = document.getElementById("cancel-time");
        if (confirmBtn) confirmBtn.textContent = data.popup.confirm;
        if (cancelBtn) cancelBtn.textContent = data.popup.cancel;
      } else {
         // If 'popup' doesn't exist, maybe log a warning or handle gracefully
         console.warn(`"popup" key not found in data/menu-${language}.json. Skipping popup text translation.`);
      }
    })
    .catch(error => console.error("⚠ Error loading popup texts:", error));
}

// NEW FUNCTION to load main menu options dynamically
function loadMainMenu(language) {
  fetch(`data/menu-${language}.json`)
    .then(response => {
      if (!response.ok) {
        // Try fetching the default english menu as a fallback
        console.warn(`Could not load menu-${language}.json. Trying menu-english.json as fallback.`);
        return fetch(`data/menu-english.json`);
      }
      return response; // Pass the original response if OK
    })
    .then(response => { // Process the response (original or fallback)
        if (!response.ok) {
             throw new Error(`JSON file could not be loaded: data/menu-${language}.json (and fallback failed)`);
        }
        return response.json();
    })
    .then(data => {
      if (!data.guide || !data.guide.sections) {
        console.error(`"guide" or "guide.sections" not found in loaded menu JSON (lang: ${language}). Cannot load main menu.`);
        return;
      }
      
      const menuOptionsDiv = document.querySelector("#menu .menu-options");
      if (!menuOptionsDiv) {
         console.error("Menu options container (#menu .menu-options) not found in HTML.");
         return;
      }
      menuOptionsDiv.innerHTML = ''; // Clear existing hardcoded options

      // Add the main title for the guide if it exists and a place for it exists
      const menuContainer = document.querySelector("#menu .menu-container"); // Find a suitable parent
      const existingHeader = document.getElementById('menu-header');
        if (existingHeader) {
            existingHeader.remove(); // Remove old header if it exists
        }
      if (data.guide.title && menuContainer) {
         const menuHeader = document.createElement('div');
         menuHeader.id = 'menu-header'; // Assign an ID for styling
         menuHeader.innerHTML = `<h2>${data.guide.title}</h2>`;
         // Prepend the title inside the menu container, before the options
         menuContainer.insertBefore(menuHeader, menuOptionsDiv); 
         console.log("Guide Title Loaded:", data.guide.title);
      }


      data.guide.sections.forEach(section => {
        const menuOption = document.createElement('div');
        menuOption.classList.add('menu-option');
        
        // Basic icon assignment based on key - replace with actual icons later
        let iconSrc = 'assets/icons/default.png'; // Default icon
        if (section.key === 'restaurants_and_bars') iconSrc = 'assets/icons/restaurants.png';
        else if (section.key === 'tv_channel_list') iconSrc = 'assets/icons/tv.png';
        else if (section.key === 'meeting_rooms') iconSrc = 'assets/icons/meeting.png';
        // Add more else if clauses here if new sections are added with specific icons

        // Create description text, handling cases where it might be missing
        const descriptionText = section.description ? section.description : 'Select to view details.'; // Default description if none provided

        menuOption.innerHTML = `
          <img src="${iconSrc}" alt="${section.title || section.key}">
          <h3>${section.title || section.key}</h3>
          <p>${descriptionText}</p> 
          <button onclick="showGuideSection('${section.key}')">Choose</button>
        `;
        menuOptionsDiv.appendChild(menuOption);
      });

       // After loading, setup scrolling if needed
       setTimeout(() => {
          enableMobileHorizontalScroll();
          setupCategoryCardsDragScroll(); // Ensure drag scroll is also set up for the main menu options
       }, 100);

    })
    .catch(error => console.error("Error loading main menu:", error));
}

// Ekran geçişlerini yönetmek için showScreen fonksiyonu
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
}

// Menü container'larını merkeze alma fonksiyonu
function centerMenuContainers() {
  if (window.innerWidth <= 600) {
    const headerHeight = document.querySelector('.header-container').offsetHeight || 80;
    const actionHeight = document.getElementById('action-container').offsetHeight || 50;
    const windowHeight = window.innerHeight;
    const availableHeight = windowHeight - headerHeight - actionHeight;
    
    // Menü konteynerlerini düzenle - tam ekran için
    const menuContainer = document.querySelector('.menu-container');
    const itemListSection = document.getElementById('item-list-section');
    
    if (menuContainer) {
      menuContainer.style.height = `${availableHeight}px`;
      menuContainer.style.top = `${headerHeight}px`;
    }
    
    if (itemListSection) {
      itemListSection.style.height = `${availableHeight}px`;
      itemListSection.style.top = `${headerHeight}px`;
    }
  }
}

// Function to display guide sections from menu JSON
function showGuideSection(sectionKey) {
  console.log(`🔍 Showing guide section: ${sectionKey}`);
  
  // Save current screen to previousScreens
  const currentActive = document.querySelector('.screen-active');
  if (currentActive) {
    previousScreens.push(currentActive.id);
    console.log("📝 Kaydedilen ekran:", currentActive.id);
  }
  
  // Hide menu and show item-list-section
  document.getElementById('menu').style.display = 'none';
  document.getElementById('item-list-section').style.display = 'block';
  document.getElementById('item-list-section').classList.add('screen-active');
  
  let currentLanguage = localStorage.getItem("currentLanguage") || "en";
  
  fetch(`data/menu-${currentLanguage}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`JSON dosyası yüklenemedi: data/menu-${currentLanguage}.json`);
      }
      return response.json();
    })
    .then(data => {
      console.log("✅ Loaded guide JSON:", data);
      const section = data.guide.sections.find(s => s.key === sectionKey);
      
      if (!section) {
        console.error(`⚠️ Section not found: ${sectionKey}`);
        return;
      }
      
      const itemListDiv = document.getElementById('item-list');
      itemListDiv.innerHTML = '';
      
      // Create section header
      const sectionHeader = document.createElement('div');
      const sectionTitle = document.createElement('h2');
      sectionTitle.textContent = section.title || sectionKey;
      itemListDiv.appendChild(sectionHeader);
      
      // Special handling for TV channels
      if (sectionKey === 'tv_channel_list') {
        // Create a container for all TV channel columns
        const tvChannelsContainer = document.createElement('div');
        tvChannelsContainer.id = 'tv-channels-container';
        itemListDiv.appendChild(tvChannelsContainer);
        
        // Create a single column for all channels
        const columnCard = document.createElement('div');
        columnCard.classList.add('tv-channel-vertical');
        
        // Add all channels to the single container
        section.items.forEach(channelItem => {
          const channelElement = document.createElement('div');
          channelElement.classList.add('tv-channel-item');
          channelElement.textContent = channelItem;
          columnCard.appendChild(channelElement);
        });
        
        tvChannelsContainer.appendChild(columnCard);
      } else {
        // Regular handling for other sections
        // Display items based on their format (string or object)
        section.items.forEach(item => {
          const itemCard = document.createElement('div');
          itemCard.classList.add('guide-item-card');
          
          if (typeof item === 'string') {
            // For simple string items
            itemCard.textContent = item;
          } else {
            // For complex items with name/description
            const itemName = document.createElement('h4');
            itemName.textContent = item.name;
            itemCard.appendChild(itemName);
            
            if (item.description) {
              const itemDesc = document.createElement('p');
              itemDesc.textContent = item.description;
              itemCard.appendChild(itemDesc);
            }
          }
          
          itemListDiv.appendChild(itemCard);
        });
      }
      
      // Center menu containers and enable mobile scrolling
      centerMenuContainers();
      setTimeout(() => {
        enableMobileHorizontalScroll();
      }, 100);
    })
    .catch(error => {
      console.error('⚠ Error loading guide content:', error);
    });
}
