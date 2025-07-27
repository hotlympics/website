#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -n "Installing dependencies ..."
    if npm install > /dev/null 2>&1; then
        echo -e " ${GREEN}[PASSED]${NC}"
    else
        echo -e " ${RED}[FAILED]${NC}"
        npm install
        exit 1
    fi
fi

# Run formatter with auto-fix
echo -n "Checking code formatting ..."
if npm run format > /dev/null 2>&1; then
    echo -e " ${GREEN}[PASSED]${NC}"
else
    echo -e " ${RED}[FAILED]${NC}"
    npm run format
    exit 1
fi

# Run linter with auto-fix
echo -n "Running ESLint ..."
if npm run lint:fix > /dev/null 2>&1; then
    echo -e " ${GREEN}[PASSED]${NC}"
else
    echo -e " ${RED}[FAILED]${NC}"
    npm run lint:fix
    exit 1
fi

# Run build (includes TypeScript check)
echo -n "Running build (TypeScript check) ..."
if npm run build > /dev/null 2>&1; then
    echo -e " ${GREEN}[PASSED]${NC}"
else
    echo -e " ${RED}[FAILED]${NC}"
    npm run build
    exit 1
fi