import { getDatabase } from './lib/db';

(async () => {
  const db = getDatabase();
  const result = await db.execute('SELECT * FROM allowed_users');
  const users = result.rows;
  console.log('Allowed Users:', users);
})();
