import { createRouter, defineEventHandler, readBody } from "h3";
import Database from "better-sqlite3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playerId, amountPaid } = body;

  if (
    !playerId ||
    typeof amountPaid !== "number" ||
    !Number.isInteger(amountPaid)
  ) {
    return {
      error:
        "Invalid input. Please provide a playerId and an integer amountPaid value.",
    };
  }

  const db = new Database("../database/players_database.sqlite");

  try {
    const updateQuery = "UPDATE players SET amount_paid = ? WHERE id = ?";
    const result = db.prepare(updateQuery).run(amountPaid, playerId);

    if (result.changes === 0) {
      return { error: "Player not found or no changes made." };
    }

    return { success: true, message: "Amount paid updated successfully." };
  } catch (error) {
    return { error: "An error occurred while updating the database." };
  } finally {
    db.close();
  }
});
