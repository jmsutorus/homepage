import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "homepage.db");

const db = new Database(dbPath);

console.log("Users in database:\n");
const users = db.prepare("SELECT id, email, name FROM user").all();

users.forEach(user => {
  console.log(`ID: ${user.id}`);
  console.log(`Email: ${user.email}`);
  console.log(`Name: ${user.name}`);
  console.log("---");
});

console.log(`\nTotal users: ${users.length}`);

db.close();
