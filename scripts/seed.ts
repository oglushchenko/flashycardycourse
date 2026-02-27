// scripts/seed.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { decksTable, cardsTable } from '../src/db/schema';

const USER_ID = 'user_3AFqNJKG2qYV2LnnSi4t0eQxvdT';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  console.log('Starting seed for FlashyCardyCourse...');

  // Optional: clear existing data so seeding is repeatable
  await db.delete(cardsTable);
  await db.delete(decksTable);

  // Insert two decks for the given user
  const insertedDecks = await db
    .insert(decksTable)
    .values([
      {
        userId: USER_ID,
        title: 'English to Spanish Basics',
        description: 'Common English words with their Spanish translations.',
      },
      {
        userId: USER_ID,
        title: 'British History Essentials',
        description: 'Key questions and answers about British history.',
      },
    ])
    .returning();

  const spanishDeck = insertedDecks[0];
  const historyDeck = insertedDecks[1];

  if (!spanishDeck || !historyDeck) {
    throw new Error('Failed to insert decks');
  }

  // 15 cards: English -> Spanish
  const spanishCards = [
    { front: 'Dog', back: 'Perro' },
    { front: 'Cat', back: 'Gato' },
    { front: 'House', back: 'Casa' },
    { front: 'Book', back: 'Libro' },
    { front: 'Water', back: 'Agua' },
    { front: 'Food', back: 'Comida' },
    { front: 'Hello', back: 'Hola' },
    { front: 'Thank you', back: 'Gracias' },
    { front: 'Please', back: 'Por favor' },
    { front: 'Good morning', back: 'Buenos días' },
    { front: 'Good night', back: 'Buenas noches' },
    { front: 'Car', back: 'Coche' },
    { front: 'Train', back: 'Tren' },
    { front: 'Street', back: 'Calle' },
    { front: 'School', back: 'Escuela' },
  ].map((card, index) => ({
    deckId: spanishDeck.id,
    front: card.front,
    back: card.back,
    position: index + 1,
  }));

  // 15 cards: British history Q&A
  const historyCards = [
    {
      front: 'When was the Battle of Hastings?',
      back: '1066',
    },
    {
      front: 'Which king signed Magna Carta?',
      back: 'King John in 1215',
    },
    {
      front: 'Which queen is known as the “Virgin Queen”?',
      back: 'Queen Elizabeth I',
    },
    {
      front: 'Which war was fought between the houses of Lancaster and York?',
      back: 'The Wars of the Roses',
    },
    {
      front: 'Who was the first Tudor monarch?',
      back: 'Henry VII',
    },
    {
      front: 'In which year did the Great Fire of London occur?',
      back: '1666',
    },
    {
      front: 'Which British king abdicated the throne in 1936?',
      back: 'Edward VIII',
    },
    {
      front: 'Who was the British prime minister during most of World War II?',
      back: 'Winston Churchill',
    },
    {
      front: 'What was the name of the period of rapid industrial change in Britain in the late 18th and 19th centuries?',
      back: 'The Industrial Revolution',
    },
    {
      front: 'Which act united the kingdoms of England and Scotland into Great Britain?',
      back: 'The Acts of Union 1707',
    },
    {
      front: 'Which famous document of 1689 limited the powers of the monarch?',
      back: 'The Bill of Rights 1689',
    },
    {
      front: 'Who was the longest-reigning British monarch before Queen Elizabeth II?',
      back: 'Queen Victoria',
    },
    {
      front: 'Which conflict between 1914 and 1918 heavily involved Britain?',
      back: 'World War I',
    },
    {
      front: 'What was the name of the Roman province that covered much of modern England and Wales?',
      back: 'Britannia',
    },
    {
      front: 'Which event in 1066 led to Norman rule over England?',
      back: 'The Norman Conquest after the Battle of Hastings',
    },
  ].map((card, index) => ({
    deckId: historyDeck.id,
    front: card.front,
    back: card.back,
    position: index + 1,
  }));

  await db.insert(cardsTable).values([...spanishCards, ...historyCards]);

  console.log('Seeding completed successfully.');
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });