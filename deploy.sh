#!/usr/bin/env bash
set -e
cd ~/plasm
git pull origin main
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart plasm-api
cd ../frontend
npm install
npm run build
echo "deploy ok: $(git -C ~/plasm log -1 --oneline)"
