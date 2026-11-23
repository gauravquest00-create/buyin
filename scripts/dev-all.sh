#!/usr/bin/env bash
set -e
(cd backend && npm run dev) &
(cd frontend && npm run dev) &
(cd dashboard && npm run dev) &
(cd superadmin && npm run dev) &
wait
