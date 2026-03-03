"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { removeCard, editCard } from "../actions";
import type { Card as FlashCard } from "@/db/queries/cards";

interface CardListProps {
  cards: FlashCard[];
  deckId: number;
}

function EditCardDialog({
  card,
  deckId,
  open,
  onOpenChange,
}: {
  card: FlashCard;
  deckId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await editCard({ cardId: card.id, deckId, front, back });
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit card</DialogTitle>
            <DialogDescription>
              Update the front and back of your flashcard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-front">Front</Label>
              <Textarea
                id="edit-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-back">Back</Label>
              <Textarea
                id="edit-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CardItem({ card, deckId }: { card: FlashCard; deckId: number }) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await removeCard({ cardId: card.id, deckId });
    });
  }

  return (
    <>
      <Card className={isPending ? "opacity-50" : ""}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <p className="text-sm font-medium leading-snug">{card.front}</p>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setEditOpen(true)}
              disabled={isPending}
              aria-label="Edit card"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
              aria-label="Delete card"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {card.back}
          </div>
        </CardContent>
      </Card>
      <EditCardDialog
        card={card}
        deckId={deckId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

export function CardList({ cards, deckId }: CardListProps) {
  if (cards.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} deckId={deckId} />
      ))}
    </div>
  );
}
