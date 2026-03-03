"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { insertDeck, updateDeck as updateDeckQuery } from "@/db/queries/decks";
import { revalidatePath } from "next/cache";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createDeck(input: CreateDeckInput): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = createDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await insertDeck(userId, {
    title: parsed.data.title,
    description: parsed.data.description,
  });

  revalidatePath("/dashboard");
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

  revalidatePath("/dashboard");
  return { success: true };
}
