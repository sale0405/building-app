#!/usr/bin/env node
const { createRequire } = require('module');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const req = createRequire(path.join(rootDir, 'backend/package.json'));
const pkgPath = req.resolve('@prisma/client/package.json');
const pkgDir = pkgPath.replace(/\/package\.json$/, '');
const modulesDir = path.dirname(path.dirname(pkgDir));
const clientDir = path.join(modulesDir, '.prisma/client');

process.stdout.write(`${pkgDir}|${clientDir}`);
