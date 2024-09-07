import { createRouter, defineEventHandler, readBody } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playerId, isTaken } = body;

  if (!playerId || typeof isTaken !== "boolean") {
    return {
      error:
        "Invalid input. Please provide a playerId and a boolean isTaken value.",
    };
  }

  const db = new Database("database/players_database.sqlite");

  try {
    let updateQuery;
    let params;
    if (isTaken) {
      updateQuery = "UPDATE players SET taken = ? WHERE id = ?";
      params = [1, playerId];
    } else {
      updateQuery =
        "UPDATE players SET taken = ?, amount_paid = ? WHERE id = ?";
      params = [0, 0, playerId];
    }

    const result = db.prepare(updateQuery).run(...params);

    if (result.changes === 0) {
      return { error: "Player not found or no changes made." };
    }

    return { success: true, message: "Taken status updated successfully." };
  } catch (error) {
    return { error: "An error occurred while updating the database." };
  } finally {
    db.close();
  }
});
