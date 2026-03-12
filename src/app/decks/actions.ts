"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getDecksByUserId, insertDeck, updateDeck as updateDeckQuery, deleteDeck as deleteDeckQuery } from "@/db/queries/decks";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createDeck(input: CreateDeckInput): Promise<ActionResult> {
  const { userId, has } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = createDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (has({ feature: "3_deck_limit" })) {
    const existingDecks = await getDecksByUserId(userId);
    if (existingDecks.length >= 3) {
      return {
        success: false,
        error: "You've reached the 3-deck limit on the free plan. Upgrade to Pro to create unlimited decks.",
      };
    }
  }

  await insertDeck(userId, {
    title: parsed.data.title,
    description: parsed.data.description,
  });

  revalidatePath("/decks");
  return { success: true };
}

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeck(input: UpdateDeckInput): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = updateDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const deck = await updateDeckQuery(userId, parsed.data.deckId, {
    title: parsed.data.title,
    description: parsed.data.description,
  });
  if (!deck) return { success: false, error: "Deck not found" };

  revalidatePath("/decks");
  return { success: true };
}

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeck(input: DeleteDeckInput): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = deleteDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const deleted = await deleteDeckQuery(userId, parsed.data.deckId);
  if (!deleted) return { success: false, error: "Deck not found" };

  revalidatePath("/decks");
  redirect("/decks");
}
