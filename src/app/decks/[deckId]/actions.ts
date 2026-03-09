"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { getDeckById } from "@/db/queries/decks";
import { insertCard, deleteCard, updateCard, bulkInsertCards } from "@/db/queries/cards";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

const generateAICardsSchema = z.object({
  deckId: z.number().int().positive(),
});

export type GenerateAICardsInput = z.infer<typeof generateAICardsSchema>;

export async function generateAICards(
  input: GenerateAICardsInput,
): Promise<ActionResult> {
  const { userId, has } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  if (!has({ feature: "ai_flashcard_generation" })) {
    return {
      success: false,
      error: "Upgrade to Pro to use AI flashcard generation.",
    };
  }

  const parsed = generateAICardsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const deck = await getDeckById(userId, parsed.data.deckId);
  if (!deck) return { success: false, error: "Deck not found" };

  const topic = deck.description
    ? `${deck.title}: ${deck.description}`
    : deck.title;

  const { output } = await generateText({
    model: openai("gpt-4o"),
    output: Output.object({
      schema: z.object({
        cards: z.array(
          z.object({
            front: z.string(),
            back: z.string(),
          }),
        ),
      }),
    }),
    prompt: `Generate 20 flashcards about: ${topic}. Each card should have a concise question on the front and a clear, accurate answer on the back.`,
  });

  await bulkInsertCards(parsed.data.deckId, output.cards);

  revalidatePath(`/decks/${parsed.data.deckId}`);
  return { success: true };
}

const addCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required").max(2000),
  back: z.string().min(1, "Back is required").max(2000),
});

export type AddCardInput = z.infer<typeof addCardSchema>;

export async function addCard(input: AddCardInput): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = addCardSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const deck = await getDeckById(userId, parsed.data.deckId);
  if (!deck) return { success: false, error: "Deck not found" };

  await insertCard(parsed.data.deckId, {
    front: parsed.data.front,
    back: parsed.data.back,
  });

  revalidatePath(`/decks/${parsed.data.deckId}`);
  return { success: true };
}

const deleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function removeCard(input: DeleteCardInput): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = deleteCardSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const deck = await getDeckById(userId, parsed.data.deckId);
  if (!deck) return { success: false, error: "Deck not found" };

  await deleteCard(parsed.data.cardId);

  revalidatePath(`/decks/${parsed.data.deckId}`);
  return { success: true };
}

const editCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required").max(2000),
  back: z.string().min(1, "Back is required").max(2000),
});

export type EditCardInput = z.infer<typeof editCardSchema>;

export async function editCard(input: EditCardInput): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = editCardSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const deck = await getDeckById(userId, parsed.data.deckId);
  if (!deck) return { success: false, error: "Deck not found" };

  await updateCard(parsed.data.cardId, {
    front: parsed.data.front,
    back: parsed.data.back,
  });

  revalidatePath(`/decks/${parsed.data.deckId}`);
  return { success: true };
}
