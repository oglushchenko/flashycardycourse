import Link from "next/link";
import { type ReactNode } from "react";
import { type decksTable } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Deck = typeof decksTable.$inferSelect;

interface DeckInformationProps {
  deck: Deck;
  cardCount: number;
  addCardAction: ReactNode;
  deleteDeckAction: ReactNode;
  generateAIAction: ReactNode;
}

export function DeckInformation({
  deck,
  cardCount,
  addCardAction,
  deleteDeckAction,
  generateAIAction,
}: DeckInformationProps) {
  const hasCards = cardCount > 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {deck.title}
          </CardTitle>
          {deck.description && (
            <p className="mt-1 text-muted-foreground">{deck.description}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary">
              {cardCount} {cardCount === 1 ? "card" : "cards"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated {new Date(deck.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {generateAIAction}
          {addCardAction}
          {deleteDeckAction}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {hasCards ? (
          <Button asChild>
            <Link href={`/decks/${deck.id}/study`}>Start Study</Link>
          </Button>
        ) : (
          <Button disabled>Start Study</Button>
        )}
      </CardContent>
    </Card>
  );
}
