#!/usr/bin/env bash
set -e
(cd backend && npm install)
(cd dashboard && npm install)
(cd superadmin && npm install)
(cd frontend && npm install)
echo "All 4 BUYIN applications installed!"
