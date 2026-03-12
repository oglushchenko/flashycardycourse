import { and, asc, eq } from "drizzle-orm";
import { db, connectDb } from "@/db";
import { cardsTable } from "@/db/schema";

export type Card = typeof cardsTable.$inferSelect;
export type NewCard = Pick<typeof cardsTable.$inferInsert, "front" | "back">;

export async function getCardsByDeckId(deckId: number): Promise<Card[]> {
  await connectDb();
  return db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(asc(cardsTable.position), asc(cardsTable.createdAt));
}

export async function insertCard(
  deckId: number,
  data: NewCard,
): Promise<Card> {
  await connectDb();
  const existing = await db
    .select({ position: cardsTable.position })
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(asc(cardsTable.position));

  const nextPosition =
    existing.length > 0 ? existing[existing.length - 1].position + 1 : 0;

  const [card] = await db
    .insert(cardsTable)
    .values({ deckId, front: data.front, back: data.back, position: nextPosition })
    .returning();
  return card;
}

export async function bulkInsertCards(
  deckId: number,
  cards: NewCard[],
): Promise<Card[]> {
  await connectDb();
  const existing = await db
    .select({ position: cardsTable.position })
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(asc(cardsTable.position));

  const startPosition =
    existing.length > 0 ? existing[existing.length - 1].position + 1 : 0;

  const values = cards.map((card, i) => ({
    deckId,
    front: card.front,
    back: card.back,
    position: startPosition + i,
  }));

  return db.insert(cardsTable).values(values).returning();
}

export async function deleteCard(cardId: number, deckId: number): Promise<void> {
  await connectDb();
  await db
    .delete(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)));
}

export async function updateCard(cardId: number, deckId: number, data: NewCard): Promise<Card> {
  await connectDb();
  const [card] = await db
    .update(cardsTable)
    .set({ front: data.front, back: data.back })
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.deckId, deckId)))
    .returning();
  return card;
}
