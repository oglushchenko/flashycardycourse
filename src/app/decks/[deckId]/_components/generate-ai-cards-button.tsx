"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateAICards } from "../actions";

interface GenerateAICardsButtonProps {
  deckId: number;
  hasAIFeature: boolean;
}

export function GenerateAICardsButton({
  deckId,
  hasAIFeature,
}: GenerateAICardsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!hasAIFeature) {
      router.push("/pricing");
      return;
    }
    startTransition(async () => {
      await generateAICards({ deckId });
    });
  }

  const button = (
    <Button
      variant="outline"
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

  return button;
}
