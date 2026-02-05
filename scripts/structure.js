#!/usr/bin/env node

/**
 * Project Structure Overview
 * Run: node scripts/structure.js
 */

const fs = require('fs');
const path = require('path');

function listDir(dir, indent = '', prefix = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true })
    .filter(f => !f.name.startsWith('.'))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

  items.forEach((item, idx) => {
    const isLast = idx === items.length - 1;
    const icon = item.isDirectory() ? '📁' : '📄';
    const connector = isLast ? '└── ' : '├── ';
    const nextIndent = indent + (isLast ? '    ' : '│   ');

    console.log(`${indent}${connector}${icon} ${item.name}`);

    if (item.isDirectory() && !['node_modules', '.git', '.expo'].includes(item.name)) {
      listDir(path.join(dir, item.name), nextIndent);
    }
  });
}

console.log('\n📂 PROJECT STRUCTURE\n');
console.log('app/ (Expo Router Routes)');
listDir(path.join(__dirname, '..', 'app'), '  ');

console.log('\nsrc/ (Application Logic)');
listDir(path.join(__dirname, '..', 'src'), '  ');

console.log('\n✅ Ready for development!');
