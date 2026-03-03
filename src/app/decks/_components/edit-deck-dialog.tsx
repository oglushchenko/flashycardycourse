"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateDeck } from "../actions";

interface EditDeckDialogProps {
  deck: {
    id: number;
    title: string;
    description: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDeckDialog({ deck, open, onOpenChange }: EditDeckDialogProps) {
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setTitle(deck.title);
      setDescription(deck.description ?? "");
      setError(null);
    }
  }, [open, deck.title, deck.description]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateDeck({
        deckId: deck.id,
        title,
        description: description || undefined,
      });
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit deck</DialogTitle>
            <DialogDescription>
              Update the title and description of your deck.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g. Spanish Vocabulary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="What is this deck about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
