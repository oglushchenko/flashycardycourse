"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { type decksTable } from "@/db/schema";
import { EditDeckDialog } from "./edit-deck-dialog";

type Deck = typeof decksTable.$inferSelect;

export function DeckCard({ deck }: { deck: Deck }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Link href={`/decks/${deck.id}`} className="block">
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer h-full">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate">{deck.title}</CardTitle>
              {deck.description && (
                <CardDescription className="line-clamp-2 mt-1">
                  {deck.description}
                </CardDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit deck</span>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Updated {new Date(deck.updatedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </Link>

      <EditDeckDialog
        deck={deck}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
