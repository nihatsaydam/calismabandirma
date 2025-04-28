#!/bin/bash

# Keepsty Admin Panel Deployment Script

# Renkli output için
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}Keepsty Admin Panel Deployment Tool${NC}"
echo -e "${BLUE}====================================${NC}"

# config.json dosyasından otel ID'sini oku
if [ -f "config.json" ]; then
  HOTEL_ID=$(grep -o '"hotelId": *"[^"]*"' config.json | cut -d'"' -f4)
  HOTEL_NAME=$(grep -o '"hotelName": *"[^"]*"' config.json | cut -d'"' -f4)
  echo -e "${GREEN}Otel ID:${NC} $HOTEL_ID"
  echo -e "${GREEN}Otel Adı:${NC} $HOTEL_NAME"
else
  echo -e "${RED}HATA: config.json dosyası bulunamadı!${NC}"
  exit 1
fi

# Google Cloud Service Name (Otel ID'sinden oluşturulur)
SERVICE_NAME="keepsty-admin-${HOTEL_ID}"
LOWERCASE_SERVICE_NAME=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]' | tr '_' '-')

echo -e "${YELLOW}Google Cloud service name:${NC} $LOWERCASE_SERVICE_NAME"
echo -e "${YELLOW}Bu service name ile deploy işlemi yapılacak.${NC}"

# Devam etmek için onay al
read -p "Devam etmek istiyor musunuz? (e/h): " confirm
if [[ $confirm != "e" && $confirm != "E" ]]; then
  echo -e "${YELLOW}İşlem iptal edildi.${NC}"
  exit 0
fi

# NPM paketlerini yükle
echo -e "\n${BLUE}NPM paketleri yükleniyor...${NC}"
npm install

if [ $? -ne 0 ]; then
  echo -e "${RED}NPM paketleri yüklenirken hata oluştu!${NC}"
  exit 1
fi

# Mevcut app.yaml dosyasını yedekle
cp app.yaml app.yaml.bak

# app.yaml dosyasını güncelle
echo -e "\n${BLUE}app.yaml dosyası güncelleniyor...${NC}"
sed -i.bak "s/service: .*/service: $LOWERCASE_SERVICE_NAME/" app.yaml

# Google Cloud App Engine'e deploy et
echo -e "\n${BLUE}Google Cloud App Engine'e deploy ediliyor...${NC}"
echo -e "${YELLOW}Bu işlem birkaç dakika sürebilir...${NC}"

gcloud app deploy --project=YOUR_GCP_PROJECT_ID --quiet

if [ $? -ne 0 ]; then
  echo -e "${RED}Deploy işlemi başarısız oldu!${NC}"
  # Yedeklenen app.yaml dosyasını geri yükle
  mv app.yaml.bak app.yaml
  exit 1
fi

# Başarılı mesajı göster
echo -e "\n${GREEN}Deploy işlemi başarıyla tamamlandı!${NC}"
echo -e "${BLUE}URL:${NC} https://$LOWERCASE_SERVICE_NAME-dot-YOUR_GCP_PROJECT_ID.appspot.com"

# Temizlik
rm app.yaml.bak

echo -e "\n${BLUE}====================================${NC}"
echo -e "${GREEN}İşlem tamamlandı.${NC}" 