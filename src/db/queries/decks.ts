import { asc, and, eq } from "drizzle-orm";
import { db, connectDb } from "@/db";
import { decksTable } from "@/db/schema";

export type Deck = typeof decksTable.$inferSelect;
export type NewDeck = Pick<typeof decksTable.$inferInsert, "title" | "description">;
export type UpdateDeck = Pick<typeof decksTable.$inferInsert, "title" | "description">;

export async function getDecksByUserId(userId: string): Promise<Deck[]> {
  await connectDb();
  return db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(asc(decksTable.createdAt));
}

export async function getDeckById(
  userId: string,
  deckId: number,
): Promise<Deck | undefined> {
  await connectDb();
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
  return deck;
}

export async function insertDeck(
  userId: string,
  data: NewDeck,
): Promise<Deck> {
  await connectDb();
  const [deck] = await db
    .insert(decksTable)
    .values({
      userId,
      title: data.title,
      description: data.description ?? null,
    })
    .returning();
  return deck;
}

export async function updateDeck(
  userId: string,
  deckId: number,
  data: UpdateDeck,
): Promise<Deck | undefined> {
  await connectDb();
  const [deck] = await db
    .update(decksTable)
    .set({
      title: data.title,
      description: data.description ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();
  return deck;
}

export async function deleteDeck(
  userId: string,
  deckId: number,
): Promise<boolean> {
  await connectDb();
  const [deleted] = await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning({ id: decksTable.id });
  return !!deleted;
}
