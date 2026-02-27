import { asc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db, connectDb } from "@/db";
import { decksTable } from "@/db/schema";

export type Deck = typeof decksTable.$inferSelect;
export type NewDeck = Pick<typeof decksTable.$inferInsert, "title" | "description">;

export async function getDecksByUserId(userId: string): Promise<Deck[]> {
  await connectDb();
  return db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(asc(decksTable.createdAt));
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
