import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// A deck of flashcards created by a specific user (Clerk userId).
export const decksTable = pgTable('decks', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Individual flashcards that belong to a deck.
export const cardsTable = pgTable('cards', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id')
    .notNull()
    .references(() => decksTable.id, { onDelete: 'cascade' }),
  front: text('front').notNull(), // e.g. "Dog" or "When was the battle of Hastings?"
  back: text('back').notNull(), // e.g. "Anjing" or "1066"
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

