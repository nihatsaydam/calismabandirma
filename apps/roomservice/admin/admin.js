// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Tab switching functionality
  const tabs = document.querySelectorAll('.sidebar li');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Initialize the menu management panel
  initMenuManagement();
  
  // Initialize language management
  initLanguageManagement();
  
  // Initialize product form
  initProductForm();
});

// Global variables to store menu data
let currentMenuData = {};
let selectedCategory = null;
let selectedProduct = null;

// Initialize Menu Management
function initMenuManagement() {
  const languageSelect = document.getElementById('language-select');
  
  // Load menu when language is changed
  languageSelect.addEventListener('change', () => {
    loadMenu(languageSelect.value);
  });
  
  // Initial load with default language (Turkish)
  loadMenu('tr');
}

// Load menu data for a specific language
function loadMenu(lang) {
  // Absolute path kullanarak API'ye erişim
  const baseUrl = window.location.origin;
  fetch(`${baseUrl}/api/menu/${lang}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load menu_${lang}.json (Status: ${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      currentMenuData = data;
      
      // Populate categories
      renderCategories(data.menu);
      
      // Clear products until a category is selected
      document.getElementById('products-container').innerHTML = '<p>Lütfen bir kategori seçin</p>';
      
      // Update category dropdown in the product form
      updateCategoryDropdown(data.menu);
    })
    .catch(error => {
      console.error('Error loading menu:', error);
      alert(`Menü yüklenirken hata oluştu: ${error.message}`);
    });
}

// Render categories in the category list
function renderCategories(categories) {
  const categoriesContainer = document.getElementById('categories-container');
  categoriesContainer.innerHTML = '';
  
  categories.forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
      <div class="category-name">${category.name}</div>
      <div class="item-actions">
        <button class="edit-btn" data-key="${category.key}">Düzenle</button>
        <button class="delete-btn" data-key="${category.key}">Sil</button>
      </div>
    `;
    
    // Show products when a category is clicked
    categoryItem.querySelector('.category-name').addEventListener('click', () => {
      selectedCategory = category;
      renderProducts(category.items, category.key);
      
      // Highlight selected category
      document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('selected');
      });
      categoryItem.classList.add('selected');
    });
    
    // Edit category button
    categoryItem.querySelector('.edit-btn').addEventListener('click', () => {
      // Implement category editing
      const newName = prompt('Kategori adını düzenleyin:', category.name);
      if (newName && newName.trim() !== '') {
        // Update category name in the current data
        category.name = newName.trim();
        // Re-render categories
        renderCategories(currentMenuData.menu);
        // Save changes
        saveMenuChanges();
      }
    });
    
    // Delete category button
    categoryItem.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) {
        // Remove category from data
        const index = currentMenuData.menu.findIndex(c => c.key === category.key);
        if (index !== -1) {
          currentMenuData.menu.splice(index, 1);
          // Re-render categories
          renderCategories(currentMenuData.menu);
          // Clear products
          document.getElementById('products-container').innerHTML = '<p>Lütfen bir kategori seçin</p>';
          // Save changes
          saveMenuChanges();
        }
      }
    });
    
    categoriesContainer.appendChild(categoryItem);
  });
}

// Render products for a selected category
function renderProducts(products, categoryKey) {
  const productsContainer = document.getElementById('products-container');
  productsContainer.innerHTML = '';
  
  if (!products || products.length === 0) {
    productsContainer.innerHTML = '<p>Bu kategoride ürün bulunmamaktadır</p>';
    return;
  }
  
  products.forEach((product, index) => {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.innerHTML = `
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.price}</div>
      </div>
      <div class="item-actions">
        <button class="edit-btn" data-index="${index}">Düzenle</button>
        <button class="delete-btn" data-index="${index}">Sil</button>
      </div>
    `;
    
    // Edit product button
    productItem.querySelector('.edit-btn').addEventListener('click', () => {
      // Get category and populate the form
      const category = currentMenuData.menu.find(c => c.key === categoryKey);
      populateProductForm(product, categoryKey, index);
      
      // Switch to add product tab
      document.querySelectorAll('.sidebar li').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      document.querySelector('[data-tab="add-product"]').classList.add('active');
      document.getElementById('add-product').classList.add('active');
    });
    
    // Delete product button
    productItem.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm(`"${product.name}" ürününü silmek istediğinize emin misiniz?`)) {
        // Find the category and remove the product
        const category = currentMenuData.menu.find(c => c.key === categoryKey);
        if (category && category.items) {
          category.items.splice(index, 1);
          // Re-render products
          renderProducts(category.items, categoryKey);
          // Save changes
          saveMenuChanges();
        }
      }
    });
    
    productsContainer.appendChild(productItem);
  });
}

// Populate the product form for editing
function populateProductForm(product, categoryKey, productIndex) {
  document.getElementById('edit-language').value = document.getElementById('language-select').value;
  document.getElementById('category-select').value = categoryKey;
  document.getElementById('new-category').value = '';
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-description').value = product.description || '';
  
  // Set product ID as a data attribute to identify when saving
  document.getElementById('product-id').value = JSON.stringify({
    categoryKey: categoryKey,
    productIndex: productIndex
  });
}

// Initialize product form
function initProductForm() {
  const productForm = document.getElementById('product-form');
  
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const language = document.getElementById('edit-language').value;
    const categoryKey = document.getElementById('category-select').value;
    const newCategory = document.getElementById('new-category').value.trim();
    const productName = document.getElementById('product-name').value.trim();
    const productPrice = document.getElementById('product-price').value.trim();
    const productDescription = document.getElementById('product-description').value.trim();
    const productIdData = document.getElementById('product-id').value;
    
    // Create product object
    const product = {
      name: productName,
      price: productPrice
    };
    
    if (productDescription) {
      product.description = productDescription;
    }
    
    // Check if we're editing or adding a new product
    if (productIdData) {
      // Editing existing product
      try {
        const { categoryKey, productIndex } = JSON.parse(productIdData);
        const category = currentMenuData.menu.find(c => c.key === categoryKey);
        
        if (category && category.items) {
          category.items[productIndex] = product;
          alert('Ürün başarıyla güncellendi!');
        }
      } catch (error) {
        console.error('Error parsing product ID:', error);
      }
    } else {
      // Adding new product
      if (newCategory) {
        // Create a new category
        const newCategoryKey = newCategory.toLowerCase().replace(/\s+/g, '-');
        const existingCategory = currentMenuData.menu.find(c => c.key === newCategoryKey);
        
        if (existingCategory) {
          // Add to existing category
          existingCategory.items.push(product);
        } else {
          // Create new category
          currentMenuData.menu.push({
            key: newCategoryKey,
            name: newCategory,
            image: "",
            items: [product]
          });
        }
        
        alert('Yeni kategori ve ürün başarıyla eklendi!');
      } else {
        // Add to selected category
        const category = currentMenuData.menu.find(c => c.key === categoryKey);
        
        if (category) {
          category.items.push(product);
          alert('Ürün başarıyla eklendi!');
        }
      }
    }
    
    // Save changes
    saveMenuChanges();
    
    // Reset form
    productForm.reset();
    document.getElementById('product-id').value = '';
    
    // Reload menu
    loadMenu(language);
    
    // Switch back to menu management tab
    document.querySelectorAll('.sidebar li').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    document.querySelector('[data-tab="menu-management"]').classList.add('active');
    document.getElementById('menu-management').classList.add('active');
  });
}

// Update category dropdown in the product form
function updateCategoryDropdown(categories) {
  const categorySelect = document.getElementById('category-select');
  categorySelect.innerHTML = '';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.key;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// Save menu changes to the JSON file
function saveMenuChanges() {
  const language = document.getElementById('language-select').value;
  const baseUrl = window.location.origin;
  
  // API endpoint'i kullanarak değişiklikleri kaydet
  fetch(`${baseUrl}/api/menu/${language}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(currentMenuData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to save menu changes (Status: ${response.status})`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Menu saved successfully:', data);
  })
  .catch(error => {
    console.error('Error saving menu:', error);
    alert(`Değişiklikler kaydedilirken bir hata oluştu: ${error.message}`);
  });
}

// Initialize Language Management
function initLanguageManagement() {
  const translationLanguage = document.getElementById('translation-language');
  
  translationLanguage.addEventListener('change', () => {
    loadTranslations(translationLanguage.value);
  });
  
  // Initial load with default language
  loadTranslations('tr');
}

// Load translations for a specific language
function loadTranslations(lang) {
  const baseUrl = window.location.origin;
  fetch(`${baseUrl}/api/translations`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load translations.json (Status: ${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      renderTranslations(data, lang);
    })
    .catch(error => {
      console.error('Error loading translations:', error);
      alert(`Çeviriler yüklenirken hata oluştu: ${error.message}`);
    });
}

// Render translations for editing
function renderTranslations(data, lang) {
  const translationsContainer = document.getElementById('translations-container');
  translationsContainer.innerHTML = '';
  
  const langData = data[lang] || {};
  
  // Create input fields for each translation key
  Object.entries(langData).forEach(([key, value]) => {
    const translationItem = document.createElement('div');
    translationItem.className = 'translation-item';
    translationItem.innerHTML = `
      <label for="trans-${key}">${key}:</label>
      <input type="text" id="trans-${key}" data-key="${key}" value="${value}">
    `;
    
    translationsContainer.appendChild(translationItem);
  });
  
  // Add save button event listener
  document.getElementById('save-translations').addEventListener('click', () => {
    // Collect all translation values
    const updatedTranslations = {};
    
    document.querySelectorAll('#translations-container input').forEach(input => {
      const key = input.getAttribute('data-key');
      updatedTranslations[key] = input.value;
    });
    
    // Update data object
    data[lang] = updatedTranslations;
    
    // Save translations
    saveTranslations(data);
  });
}

// Save translations to the JSON file
function saveTranslations(data) {
  const baseUrl = window.location.origin;
  fetch(`${baseUrl}/api/translations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to save translations (Status: ${response.status})`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Translations saved successfully:', data);
    alert('Çeviriler başarıyla kaydedildi!');
  })
  .catch(error => {
    console.error('Error saving translations:', error);
    alert(`Çeviriler kaydedilirken bir hata oluştu: ${error.message}`);
  });
} 