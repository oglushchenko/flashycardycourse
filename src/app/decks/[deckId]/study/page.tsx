import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { StudySession } from "./_components/study-session";

interface Props {
  params: Promise<{ deckId: string }>;
}

export default async function StudyPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId: deckIdParam } = await params;
  const deckId = Number(deckIdParam);
  if (isNaN(deckId)) notFound();

  const [deck, cards] = await Promise.all([
    getDeckById(userId, deckId),
    getCardsByDeckId(userId, deckId),
  ]);

  if (!deck) notFound();

  if (cards.length === 0) {
    redirect(`/decks/${deckId}`);
  }

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href={`/decks/${deckId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Deck
            </Link>
          </Button>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            {deck.title}
          </h1>
          {deck.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {deck.description}
            </p>
          )}
        </div>

        <StudySession cards={sortedCards} deckId={deckId} />
      </div>
    </div>
  );
}
