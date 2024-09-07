import { createRouter, defineEventHandler, readBody } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playerId, isBought } = body;

  if (!playerId || typeof isBought !== "boolean") {
    return {
      error:
        "Invalid input. Please provide a playerId and a boolean isBought value.",
    };
  }

  const db = new Database("./database/players_database.sqlite");

  try {
    let updateQuery;
    let params;

    if (isBought) {
      updateQuery = "UPDATE players SET bought = ? WHERE id = ?";
      params = [1, playerId];
    } else {
      updateQuery =
        "UPDATE players SET bought = ?, amount_paid = ? WHERE id = ?";
      params = [0, 0, playerId];
    }

    const result = db.prepare(updateQuery).run(...params);

    if (result.changes === 0) {
      return { error: "Player not found or no changes made." };
    }

    return { success: true, message: "Bought status updated successfully." };
  } catch (error) {
    return { error: "An error occurred while updating the database." };
  } finally {
    db.close();
  }
});
