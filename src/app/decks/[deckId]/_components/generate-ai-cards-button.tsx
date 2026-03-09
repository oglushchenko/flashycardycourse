"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateAICards } from "../actions";
import { EditDeckDialog } from "@/app/decks/_components/edit-deck-dialog";

interface GenerateAICardsButtonProps {
  deck: { id: number; title: string; description: string | null };
  hasAIFeature: boolean;
}

export function GenerateAICardsButton({
  deck,
  hasAIFeature,
}: GenerateAICardsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const hasDescription = Boolean(deck.description?.trim());

  function handleClick() {
    if (!hasAIFeature) {
      router.push("/pricing");
      return;
    }
    if (!hasDescription) {
      setEditOpen(true);
      return;
    }
    startTransition(async () => {
      await generateAICards({ deckId: deck.id });
    });
  }

  const button = (
    <Button
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {isPending ? "Generating…" : "Generate cards with AI"}
    </Button>
  );

  if (!hasAIFeature) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>AI flashcard generation is a Pro feature. Click to upgrade.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!hasDescription) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>Add a description to your deck to use AI generation.</p>
          </TooltipContent>
        </Tooltip>
        <EditDeckDialog
          deck={deck}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      </>
    );
  }

  return button;
}
