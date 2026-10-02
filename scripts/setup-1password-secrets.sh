#!/bin/bash
# Setup 1Password secrets for Spiral Groove Records
# Usage: ./scripts/setup-1password-secrets.sh

set -e

echo "🔐 1Password Secrets Setup for Spiral Groove Records"
echo ""

# Check if op CLI is installed
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI not installed"
    echo ""
    echo "Install it:"
    echo "  macOS:   brew install 1password-cli"
    echo "  Linux:   https://1password.com/downloads/command-line/"
    echo "  Windows: https://1password.com/downloads/command-line/"
    exit 1
fi

echo "✅ 1Password CLI found"
echo ""

# Check if user is signed in
if ! op account list &> /dev/null; then
    echo "🔑 Sign in to 1Password..."
    eval $(op signin)
fi

echo "✅ Signed in to 1Password"
echo ""

# Item name in 1Password
ITEM_NAME="Spiral Groove - Environment Variables"
VAULT_NAME="Development"

# Check if item exists
if ! op item get "$ITEM_NAME" --vault "$VAULT_NAME" &> /dev/null; then
    echo "❌ Item '$ITEM_NAME' not found in vault '$VAULT_NAME'"
    echo ""
    echo "Create it in 1Password with these fields:"
    echo "  - MAKE_EMAIL_WEBHOOK_URL (password)"
    echo "  - MAKE_CONTACT_US_WEBHOOK_URL (password)"
    echo "  - MAKE_ALERTS_WEBHOOK_URL (password)"
    echo "  - SQUARE_ACCESS_TOKEN (password)"
    echo "  - SQUARE_LOCATION_ID (text)"
    echo "  - SQUARE_ENVIRONMENT (text)"
    echo "  - SGR_DATABASE_URL (password)"
    echo "  - WEBHOOK_SECRET (password)"
    exit 1
fi

echo "✅ Found '$ITEM_NAME' in 1Password"
echo ""

# Export to .env.local
echo "📝 Writing secrets to .env.local..."

op item get "$ITEM_NAME" --vault "$VAULT_NAME" --format json | \
  jq -r '.fields[] | select(.label != null and .value != null) | "\(.label)=\(.value)"' > .env.local

if [ -f .env.local ]; then
    echo "✅ Secrets written to .env.local"
    echo ""
    echo "Environment variables loaded:"
    cat .env.local | cut -d= -f1 | sed 's/^/  - /'
    echo ""
    echo "⚠️  .env.local is gitignored - safe from commits"
else
    echo "❌ Failed to create .env.local"
    exit 1
fi

echo ""
echo "✨ Setup complete! You can now run:"
echo "   npm run dev"
