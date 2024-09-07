import { createRouter, defineEventHandler } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const dbPath = path.join(process.cwd(), "database/players_database.sqlite");
  const db = new Database(dbPath, { readonly: true });
  const query = "SELECT * FROM players";
  const result = db.prepare(query).all();
  db.close();
  return result;
});
