import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

async function checkAdmins() {
  if (!url) {
    console.error("DATABASE_URL is not defined");
    return;
  }

  const client = createClient({ url, authToken });

  try {
    const result = await client.execute(`
      SELECT u.email, ur.role 
      FROM user u 
      LEFT JOIN user_roles ur ON u.id = ur.userId
    `);
    
    console.log("Users and their roles:");
    console.table(result.rows);
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    client.close();
  }
}

checkAdmins();
