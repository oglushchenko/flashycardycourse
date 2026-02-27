import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type decksTable } from "@/db/schema";

type Deck = typeof decksTable.$inferSelect;

export function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="truncate">{deck.title}</CardTitle>
        {deck.description && (
          <CardDescription className="line-clamp-2">
            {deck.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Created {new Date(deck.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/decks/${deck.id}/study`}>Study</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
