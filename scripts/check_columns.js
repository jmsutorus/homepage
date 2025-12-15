
const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'homepage/data/homepage.db');
const db = sqlite3(dbPath);

const info = db.pragma('table_info(account)');
console.log('Account table columns:', info);
