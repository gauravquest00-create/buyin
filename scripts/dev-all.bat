@echo off
start "BUYIN Backend (5000)" cmd /k "cd backend && npm run dev"
start "BUYIN Frontend (3000)" cmd /k "cd frontend && npm run dev"
start "BUYIN Dashboard (3001)" cmd /k "cd dashboard && npm run dev"
start "BUYIN SuperAdmin (3002)" cmd /k "cd superadmin && npm run dev"
echo Launched all 4 BUYIN applications in separate windows.
