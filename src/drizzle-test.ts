import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db, connectDb } from './db';
import { decksTable, cardsTable } from './db/schema';

async function main() {
  await connectDb();

  const userId =
    process.env.DRIZZLE_TEST_USER_ID ??
    'user_3AFqNJKG2qYV2LnnSi4t0eQxvdT';

  const newDeck: typeof decksTable.$inferInsert = {
    userId,
    title: 'Test Deck from drizzle-test.ts',
    description: 'Temporary deck created by drizzle-test.ts to verify DB access.',
  };

  const [insertedDeck] = await db
    .insert(decksTable)
    .values(newDeck)
    .returning();

  console.log('Inserted deck:', insertedDeck);

  const cards: (typeof cardsTable.$inferInsert)[] = [
    {
      deckId: insertedDeck.id,
      front: 'Front 1',
      back: 'Back 1',
      position: 1,
    },
    {
      deckId: insertedDeck.id,
      front: 'Front 2',
      back: 'Back 2',
      position: 2,
    },
  ];

  await db.insert(cardsTable).values(cards);
  console.log('Inserted cards for test deck.');

  const fetchedDecks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
  console.log('Decks for user:', fetchedDecks);

  const updatedTitle = 'Updated Test Deck Title';
  await db
    .update(decksTable)
    .set({ title: updatedTitle })
    .where(eq(decksTable.id, insertedDeck.id));
  console.log('Updated deck title.');

  const fetchedCards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, insertedDeck.id));
  console.log('Cards for test deck:', fetchedCards);

  await db
    .delete(decksTable)
    .where(eq(decksTable.id, insertedDeck.id));
  console.log(
    'Deleted test deck (cards should be cascade-deleted due to foreign key).',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

