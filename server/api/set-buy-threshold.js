import { createRouter, defineEventHandler, readBody } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playerId, buyThreshold } = body;

  if (
    !playerId ||
    typeof buyThreshold !== "number" ||
    !Number.isInteger(buyThreshold)
  ) {
    return {
      error:
        "Invalid input. Please provide a playerId and an integer buyThreshold value.",
    };
  }

  const db = new Database("./database/players_database.sqlite");

  try {
    const updateQuery = "UPDATE players SET buy_threshold = ? WHERE id = ?";
    const result = db.prepare(updateQuery).run(buyThreshold, playerId);

    if (result.changes === 0) {
      return { error: "Player not found or no changes made." };
    }

    return { success: true, message: "Buy threshold updated successfully." };
  } catch (error) {
    return { error: "An error occurred while updating the database." };
  } finally {
    db.close();
  }
});
