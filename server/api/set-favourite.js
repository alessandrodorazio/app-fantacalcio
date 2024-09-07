import { createRouter, defineEventHandler, readBody } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playerId, isFavourite } = body;

  if (!playerId || typeof isFavourite !== "boolean") {
    return {
      error:
        "Invalid input. Please provide a playerId and a boolean isFavourite value.",
    };
  }

  const db = new Database("database/players_database.sqlite");

  try {
    const updateQuery = "UPDATE players SET favourite = ? WHERE id = ?";
    const result = db.prepare(updateQuery).run(isFavourite ? 1 : 0, playerId);

    if (result.changes === 0) {
      return { error: "Player not found or no changes made." };
    }

    return { success: true, message: "Favourite status updated successfully." };
  } catch (error) {
    return { error: "An error occurred while updating the database." };
  } finally {
    db.close();
  }
});
