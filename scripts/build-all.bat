@echo off
cd backend && call npm run lint:syntax && cd ..
cd dashboard && call npm run build && cd ..
cd superadmin && call npm run build && cd ..
cd frontend && call npm run build && cd ..
echo Production builds completed for all BUYIN applications!
