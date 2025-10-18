#!/bin/bash
# Simple script to replace secrets with placeholders

if [ -f ".env.example" ]; then
    # Replace database password
    sed -i.bak 's/npg_D1gvZUEscu2r/your-postgres-password/g' .env.example
    # Replace database username
    sed -i.bak 's/neondb_owner/your-postgres-username/g' .env.example
    # Replace database host
    sed -i.bak 's/ep-crimson-brook-adme5jk2/your-postgres-host/g' .env.example
    # Replace database name
    sed -i.bak 's/neondb/your-postgres-database/g' .env.example
    # Clean up backup files
    rm -f .env.example.bak
fi

if [ -f "jest.setup.js" ]; then
    # Replace test secrets
    sed -i.bak 's/test-secret/test-nextauth-secret-for-testing-only/g' jest.setup.js
    sed -i.bak 's/test-jwt-secret/test-jwt-secret-for-testing-only/g' jest.setup.js
    # Clean up backup files
    rm -f jest.setup.js.bak
fi
