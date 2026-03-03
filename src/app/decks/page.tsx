import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { getDecksByUserId } from "@/db/queries/decks";
import { DeckCard } from "./_components/deck-card";
import { CreateDeckDialog } from "./_components/create-deck-dialog";

export default async function DecksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const decks = await getDecksByUserId(userId);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
            <p className="mt-1 text-muted-foreground">
              {decks.length === 0
                ? "No decks yet - create your first one!"
                : `${decks.length} deck${decks.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <CreateDeckDialog />
        </div>

        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
            <LayoutGrid className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              You don&apos;t have any decks yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &ldquo;New Deck&rdquo; to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
