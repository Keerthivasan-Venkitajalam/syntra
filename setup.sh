#!/bin/bash

# Syntra Setup Script

echo "🔷 Syntra — Company Twins for Continuous Intelligence"
echo "======================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Install Node.js 18+ first."
    exit 1
fi
echo "✅ Node.js $(node --version)"
echo ""

# Create .env.local if missing
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  Fill in .env.local before running a live report:"
    echo "   LINKUP_API_KEY          — https://app.linkup.so (€5 free credits)"
    echo "   OPENAI_API_KEY          — https://platform.openai.com"
    echo "   NEXT_PUBLIC_BASE_URL    — http://localhost:3000 for local dev"
    echo ""
    echo "   Leave SYNTRA_DEMO_MODE=false for live mode."
    echo "   Set SYNTRA_DEMO_MODE=true to use fixture data with no API calls."
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Verify demo fixtures
echo "🔍 Verifying demo fixtures..."
npm run demo:check
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Ready. Choose a mode:"
echo ""
echo "  DEMO (no API keys needed):"
echo "    npm run demo:dev"
echo "    → Open http://localhost:3000"
echo "    → Type 'stripe.com' — instant fixture report"
echo "    → See demo_e2e.md for the full script + Easter eggs"
echo ""
echo "  LIVE (requires API keys in .env.local):"
echo "    npm run dev"
echo "    → Open http://localhost:3000"
echo "    → Type any domain → 9 engines run in parallel"
echo ""
echo "  TEST DOMAINS:"
echo "    stripe.com           — PLG fintech (Buy)"
echo "    figma.com            — Post-Adobe design tool (Buy)"
echo "    acme-batteries.in    — India EV vendor, Udyam mismatch (Pass)"
echo ""
