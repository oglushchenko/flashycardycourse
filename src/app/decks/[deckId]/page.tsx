import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { AddCardDialog } from "./_components/add-card-dialog";
import { CardList } from "./_components/card-list";
import { DeckInformation } from "./_components/deck-information";
import { DeleteDeckDialog } from "./_components/delete-deck-dialog";
import { GenerateAICardsButton } from "./_components/generate-ai-cards-button";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LayersIcon } from "lucide-react";

interface Props {
  params: Promise<{ deckId: string }>;
}

export default async function DeckPage({ params }: Props) {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const hasAIFeature = has({ feature: "ai_flashcard_generation" });

  const { deckId: deckIdParam } = await params;
  const deckId = Number(deckIdParam);
  if (isNaN(deckId)) notFound();

  const [deck, cards] = await Promise.all([
    getDeckById(userId, deckId),
    getCardsByDeckId(userId, deckId),
  ]);

  if (!deck) notFound();

  const sortedCards = [...cards].sort((a, b) => {
    const aUpdatedAt =
      ((a as { updatedAt?: Date | string | null }).updatedAt ?? a.createdAt) ??
      0;
    const bUpdatedAt =
      ((b as { updatedAt?: Date | string | null }).updatedAt ?? b.createdAt) ??
      0;

    return new Date(bUpdatedAt).getTime() - new Date(aUpdatedAt).getTime();
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link href="/dashboard">
              <ChevronLeft className="mr-1 h-4 w-4" />
              My Decks
            </Link>
          </Button>
          <DeckInformation
            deck={deck}
            cardCount={sortedCards.length}
            generateAIAction={
              <GenerateAICardsButton
                deck={deck}
                hasAIFeature={hasAIFeature}
              />
            }
            addCardAction={<AddCardDialog deckId={deck.id} />}
            deleteDeckAction={
              <DeleteDeckDialog deckId={deck.id} deckTitle={deck.title} />
            }
          />
        </div>

        {sortedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
            <LayersIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              No cards yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &ldquo;Add Card&rdquo; to create your first flashcard.
            </p>
          </div>
        ) : (
          <CardList cards={sortedCards} deckId={deck.id} />
        )}
      </div>
    </div>
  );
}
