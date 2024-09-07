import { createRouter, defineEventHandler, readBody } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playerId, valuation } = body;

  if (
    !playerId ||
    typeof valuation !== "number" ||
    valuation < 0 ||
    valuation > 5
  ) {
    return {
      error:
        "Invalid input. Please provide a playerId and a valuation between 0 and 5.",
    };
  }

  const db = new Database("./database/players_database.sqlite");

  try {
    const updateQuery = "UPDATE players SET my_valuation = ? WHERE id = ?";
    const result = db.prepare(updateQuery).run(valuation, playerId);

    if (result.changes === 0) {
      return { error: "Player not found or no changes made." };
    }

    return { success: true, message: "Valuation updated successfully." };
  } catch (error) {
    return { error: "An error occurred while updating the database." };
  } finally {
    db.close();
  }
});
