document.addEventListener("DOMContentLoaded", () => {
    const formScreen = document.getElementById("form-screen");
    const languageScreen = document.getElementById("language-screen");
    const cardScreen = document.getElementById("card-screen");
    const userForm = document.getElementById("user-form");
    const langButtons = document.querySelectorAll(".lang-btn");
    const cards = document.querySelectorAll(".card");
  
    console.log(formScreen, languageScreen, cardScreen); // Debug için ID'lerin doğruluğunu kontrol et
  
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
  
      console.log(
        `🛎️ Kart tıklandı, yönlendiriliyor: apps/${appName}/index.html`
      );
  
      // 1.2 saniye sonra ilgili uygulamaya yönlendir
      setTimeout(() => {
        window.location.href = `apps/${appName}/index.html`;
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