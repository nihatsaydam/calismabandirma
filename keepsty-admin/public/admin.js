// Global değişkenler
let currentLanguage = 'tr';
let menuData = null;
let translations = null;
let selectedCategoryIndex = -1;

// DOM elementleri
const langButtons = document.querySelectorAll('.lang-btn');
const categoryList = document.getElementById('category-list');
const addCategoryBtn = document.getElementById('add-category-btn');
const initialMessage = document.getElementById('initial-message');
const menuEditor = document.getElementById('menu-editor');
const categoryName = document.getElementById('category-name');
const categoryNameInput = document.getElementById('category-name-input');
const categoryKeyInput = document.getElementById('category-key-input');
const categoryImageInput = document.getElementById('category-image-input');
const saveCategoryBtn = document.getElementById('save-category-btn');
const deleteCategoryBtn = document.getElementById('delete-category-btn');
const itemsList = document.getElementById('items-list');
const addItemBtn = document.getElementById('add-item-btn');

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Otel bilgisini yükleme (config.json'dan)
  fetch('/api/hotel')
    .then(response => response.json())
    .then(hotel => {
      console.log('Aktif Otel:', hotel);
      // Otel ID'sini göster (debugging için)
      if (document.getElementById('hotel-id')) {
        document.getElementById('hotel-id').textContent = hotel.id;
      }
    })
    .catch(error => {
      console.error('Otel bilgisi yüklenemedi:', error);
    });
  
  // Olay dinleyicilerini ayarla
  setupEventListeners();
});

// Olay dinleyicilerini ayarla
function setupEventListeners() {
  // Dil değiştiğinde
  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      langButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentLanguage = button.getAttribute('data-lang');
      
      loadMenuData();
    });
  });
  
  // Kategori ekle butonu
  addCategoryBtn.addEventListener('click', () => {
    if (!menuData) return;
    
    menuData.menu.push({
      key: `new-category-${Date.now()}`,
      name: 'Yeni Kategori',
      items: []
    });
    
    renderCategories();
    selectedCategoryIndex = menuData.menu.length - 1;
    renderCategoryDetails();
    saveMenuData();
  });
  
  // Kategori kaydet butonu
  saveCategoryBtn.addEventListener('click', () => {
    if (selectedCategoryIndex === -1 || !menuData) return;
    
    const category = menuData.menu[selectedCategoryIndex];
    category.name = categoryNameInput.value;
    category.key = categoryKeyInput.value;
    
    // Image değeri varsa ekle, yoksa undefined olarak bırak
    if (categoryImageInput.value) {
      category.image = categoryImageInput.value;
    }
    
    renderCategories();
    saveMenuData();
  });
  
  // Kategori sil butonu
  deleteCategoryBtn.addEventListener('click', () => {
    if (selectedCategoryIndex === -1 || !menuData) return;
    
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      menuData.menu.splice(selectedCategoryIndex, 1);
      selectedCategoryIndex = -1;
      renderCategories();
      menuEditor.classList.add('hidden');
      initialMessage.classList.remove('hidden');
      saveMenuData();
    }
  });
  
  // Ürün ekle butonu
  addItemBtn.addEventListener('click', () => {
    if (selectedCategoryIndex === -1 || !menuData) return;
    
    const newItem = {
      name: 'Yeni Ürün',
      price: '0 TL'
    };
    
    menuData.menu[selectedCategoryIndex].items.push(newItem);
    renderItems();
    saveMenuData();
  });
}

// Menü verilerini yükle
async function loadMenuData() {
  if (!currentLanguage) return;
  
  try {
    const response = await fetch(`/api/menu/${currentLanguage}`);
    
    if (!response.ok) {
      throw new Error(`Menü yüklerken hata: ${response.status}`);
    }
    
    menuData = await response.json();
    
    console.log('Menü verisi yüklendi:', menuData);
    
    renderCategories();
    initialMessage.classList.add('hidden');
    
    // Herhangi bir kategori yoksa başlangıç mesajını göster
    if (!menuData.menu || menuData.menu.length === 0) {
      initialMessage.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Menü verileri yüklenirken hata oluştu:', error);
    alert('Menü verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
  }
}

// Kategorileri render et
function renderCategories() {
  if (!menuData || !menuData.menu) return;
  
  categoryList.innerHTML = '';
  
  menuData.menu.forEach((category, index) => {
    const li = document.createElement('li');
    li.textContent = category.name;
    
    if (index === selectedCategoryIndex) {
      li.classList.add('active');
    }
    
    li.addEventListener('click', () => {
      selectedCategoryIndex = index;
      renderCategoryDetails();
      
      // Seçili kategoriyi vurgula
      document.querySelectorAll('#category-list li').forEach(item => {
        item.classList.remove('active');
      });
      li.classList.add('active');
      
      // Kategori düzenleme bölümünü göster
      initialMessage.classList.add('hidden');
      menuEditor.classList.remove('hidden');
    });
    
    categoryList.appendChild(li);
  });
}

// Seçili kategori detaylarını render et
function renderCategoryDetails() {
  if (selectedCategoryIndex === -1 || !menuData) return;
  
  const category = menuData.menu[selectedCategoryIndex];
  
  categoryName.textContent = category.name;
  categoryNameInput.value = category.name;
  categoryKeyInput.value = category.key;
  categoryImageInput.value = category.image || '';
  
  renderItems();
}

// Ürünleri render et
function renderItems() {
  if (selectedCategoryIndex === -1 || !menuData) return;
  
  const items = menuData.menu[selectedCategoryIndex].items;
  itemsList.innerHTML = '';
  
  items.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    
    const itemContent = `
      <div class="item-header">
        <h4>${item.name}</h4>
        <span class="price">${item.price}</span>
      </div>
      <div class="item-actions">
        <button class="edit-item" data-index="${index}">Düzenle</button>
        <button class="delete-item" data-index="${index}">Sil</button>
      </div>
    `;
    
    itemDiv.innerHTML = itemContent;
    
    // Ürün düzenleme butonu
    itemDiv.querySelector('.edit-item').addEventListener('click', () => {
      editItem(index);
    });
    
    // Ürün silme butonu
    itemDiv.querySelector('.delete-item').addEventListener('click', () => {
      deleteItem(index);
    });
    
    itemsList.appendChild(itemDiv);
  });
}

// Ürün düzenleme
function editItem(itemIndex) {
  if (selectedCategoryIndex === -1 || !menuData) return;
  
  const item = menuData.menu[selectedCategoryIndex].items[itemIndex];
  
  const namePrompt = prompt('Ürün Adı:', item.name);
  if (namePrompt === null) return;
  
  const pricePrompt = prompt('Fiyat:', item.price);
  if (pricePrompt === null) return;
  
  item.name = namePrompt;
  item.price = pricePrompt;
  
  renderItems();
  saveMenuData();
}

// Ürün silme
function deleteItem(itemIndex) {
  if (selectedCategoryIndex === -1 || !menuData) return;
  
  if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
    menuData.menu[selectedCategoryIndex].items.splice(itemIndex, 1);
    renderItems();
    saveMenuData();
  }
}

// Menü verilerini API'ye kaydet
async function saveMenuData() {
  if (!currentLanguage || !menuData) return;
  
  try {
    const response = await fetch(`/api/menu/${currentLanguage}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Menü başarıyla kaydedildi!');
    } else {
      console.error('Menü kaydedilirken hata oluştu:', data.error);
      alert(`Menü kaydedilemedi: ${data.error || 'Bilinmeyen bir hata oluştu.'}`);
    }
  } catch (error) {
    console.error('Menü kaydedilirken hata oluştu:', error);
    alert('Menü kaydedilemedi. Lütfen daha sonra tekrar deneyin.');
  }
}

// Varsayılan dil seçimini aktif et
langButtons[0].click(); 