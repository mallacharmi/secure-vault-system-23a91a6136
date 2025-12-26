#!/bin/sh
set -e

echo "🔧 Installing & compiling contracts..."
npx hardhat compile

echo "🚀 Deploying contracts to local network..."
npx hardhat run scripts/deploy.js --network localhost

echo "🎉 Deployment completed successfully"
