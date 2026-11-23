#!/usr/bin/env bash
set -e
(cd backend && npm run lint:syntax)
(cd dashboard && npm run build)
(cd superadmin && npm run build)
(cd frontend && npm run build)
echo "Production builds completed for all BUYIN applications!"
