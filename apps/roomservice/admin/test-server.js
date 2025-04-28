/**
 * Bu test dosyası, server.js için dosya yollarını doğrular
 */

const fs = require('fs');
const path = require('path');

console.log('======= Dosya Yolu Testi =======');
console.log('Çalışma dizini:', process.cwd());
console.log('__dirname:', __dirname);

// Ana dizindeki dosyaları listele
console.log('\n1. Ana dizindeki dosyalar:');
try {
  const files = fs.readdirSync(path.join(__dirname, '..'));
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${stats.isDirectory() ? 'Dizin' : 'Dosya'})`);
  });
} catch (error) {
  console.error('Ana dizin okunamadı:', error);
}

// translations.json dosyasını kontrol et
console.log('\n2. translations.json dosyası kontrolü:');
const translationsPath = path.join(__dirname, '..', 'translations.json');
if (fs.existsSync(translationsPath)) {
  console.log('translations.json dosyası bulundu!');
  try {
    const data = fs.readFileSync(translationsPath, 'utf8');
    const json = JSON.parse(data);
    console.log('Dosya içeriği doğru JSON formatında.');
    console.log('Diller:', Object.keys(json).join(', '));
  } catch (error) {
    console.error('Dosya okunamadı veya JSON formatında değil:', error);
  }
} else {
  console.error('translations.json dosyası bulunamadı!');
  console.log('Beklenen dosya yolu:', translationsPath);
}

// data/ dizinini kontrol et
console.log('\n3. data/ dizini kontrolü:');
const dataPath = path.join(__dirname, '..', 'data');
if (fs.existsSync(dataPath)) {
  console.log('data/ dizini bulundu!');

  // data/ dizinindeki dosyaları listele
  try {
    const dataFiles = fs.readdirSync(dataPath);
    console.log('data/ dizinindeki dosyalar:');
    dataFiles.forEach(file => {
      console.log(`- ${file}`);
    });

    // menu_tr.json dosyasını kontrol et
    const menuTrPath = path.join(dataPath, 'menu_tr.json');
    if (fs.existsSync(menuTrPath)) {
      console.log('\nmenu_tr.json dosyası bulundu!');
      try {
        const data = fs.readFileSync(menuTrPath, 'utf8');
        const json = JSON.parse(data);
        console.log('Dosya içeriği doğru JSON formatında.');
        console.log('Kategori sayısı:', json.menu ? json.menu.length : 'Bilinmiyor');
      } catch (error) {
        console.error('Dosya okunamadı veya JSON formatında değil:', error);
      }
    } else {
      console.error('menu_tr.json dosyası bulunamadı!');
    }
  } catch (error) {
    console.error('data/ dizini okunamadı:', error);
  }
} else {
  console.error('data/ dizini bulunamadı!');
  console.log('Beklenen dizin yolu:', dataPath);
}

console.log('\n======= Test Tamamlandı ======='); 