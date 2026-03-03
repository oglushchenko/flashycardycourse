"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addCard } from "../actions";
import { Plus } from "lucide-react";

interface AddCardDialogProps {
  deckId: number;
}

export function AddCardDialog({ deckId }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addCard({ deckId, front, back });
      if (result.success) {
        setOpen(false);
        setFront("");
        setBack("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a new card</DialogTitle>
            <DialogDescription>
              Enter the front and back of your flashcard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="front">Front</Label>
              <Textarea
                id="front"
                placeholder="e.g. What is the capital of France?"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="back">Back</Label>
              <Textarea
                id="back"
                placeholder="e.g. Paris"
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
              {isPending ? "Adding…" : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
