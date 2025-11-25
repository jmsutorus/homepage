import { getDatabase } from './lib/db';

const db = getDatabase();
const users = db.prepare('SELECT * FROM allowed_users').all();
console.log('Allowed Users:', users);
