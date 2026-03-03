"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDeckById } from "@/db/queries/decks";
import { insertCard, deleteCard, updateCard } from "@/db/queries/cards";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

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

  revalidatePath(`/dashboard/decks/${parsed.data.deckId}`);
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

  revalidatePath(`/dashboard/decks/${parsed.data.deckId}`);
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

  revalidatePath(`/dashboard/decks/${parsed.data.deckId}`);
  return { success: true };
}
