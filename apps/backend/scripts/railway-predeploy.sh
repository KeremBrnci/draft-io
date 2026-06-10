#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Link PostgreSQL to this service in Railway Variables."
  exit 1
fi

cd "$(dirname "$0")/.."
prisma db push --skip-generate
