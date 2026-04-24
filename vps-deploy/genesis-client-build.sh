# Set the API URL for the Genesis client
VITE_API_URL="" 
cd /var/www/ai-image-generator/client
npm run build
echo "Genesis client rebuilt with API_URL="$VITE_API_URL