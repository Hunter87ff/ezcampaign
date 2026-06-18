#!/bin/bash

# Setup script for EzCampaign

echo "============================================="
echo "       Initializing EzCampaign Project       "
echo "============================================="

# Detect runtime
if command -v bun &> /dev/null; then
  RUNTIME="bun"
  INSTALL_CMD="bun install"
elif command -v npm &> /dev/null; then
  RUNTIME="npm"
  INSTALL_CMD="npm install"
else
  echo "Error: Neither 'bun' nor 'npm' was found on your system."
  echo "Please install Bun (https://bun.sh) or Node.js (https://nodejs.org) to proceed."
  exit 1
fi

echo "Detected Package Manager: $RUNTIME"

# Setup Server
echo ""
echo "---------------------------------------------"
echo "1. Setting up Server dependencies..."
echo "---------------------------------------------"
cd server || exit 1
if [ ! -f .env ]; then
  echo "Creating .env template file in server..."
  cat <<EOT >> .env
PORT=8000
ENDPOINT=http://localhost:8000
DEBUG_MODE=true
DB_URI=mongodb://localhost:27017/ezcampaign
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES=24h

# Twilio Credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_HOOK_ENDPOINT=your_ngrok_endpoint_url
TWILIO_WHATSAPP=whatsapp:+916291745601
TWILIO_PHONE_NUMBER=your_twilio_phone_number
EOT
  echo ".env created. Please configure it with your actual Twilio and MongoDB credentials."
else
  echo ".env file already exists in server, skipping creation."
fi
$INSTALL_CMD
cd ..

# Setup Client
echo ""
echo "---------------------------------------------"
echo "2. Setting up Client dependencies..."
echo "---------------------------------------------"
cd client || exit 1
$INSTALL_CMD
cd ..

echo ""
echo "============================================="
echo "Setup Completed Successfully!"
echo "============================================="
echo "To run the application:"
echo "  - In server directory: $RUNTIME run dev"
echo "  - In client directory: $RUNTIME run dev"
echo "============================================="
