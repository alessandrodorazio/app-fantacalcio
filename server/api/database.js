import { createRouter, defineEventHandler } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const db = new Database("../database/players_database.sqlite");
  const query = "SELECT * FROM players";
  const result = db.prepare(query).all();
  db.close();
  return result;
});
