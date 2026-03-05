"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { type Card } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  CheckCircle2,
} from "lucide-react";

interface StudySessionProps {
  cards: Card[];
  deckId: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function StudySession({ cards, deckId }: StudySessionProps) {
  const [queue, setQueue] = useState<Card[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [seenCount, setSeenCount] = useState(0);

  const currentCard = queue[currentIndex];
  const total = queue.length;
  const progress = total > 0 ? Math.round((seenCount / total) * 100) : 0;

  const goToNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 >= total) {
        setIsFinished(true);
      } else {
        setSeenCount((c) => Math.max(c, currentIndex + 1));
        setCurrentIndex((i) => i + 1);
      }
    }, 150);
  }, [currentIndex, total]);

  const goToPrev = useCallback(() => {
    if (currentIndex === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => i - 1);
    }, 150);
  }, [currentIndex]);

  const handleShuffle = useCallback(() => {
    setQueue(shuffleArray(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSeenCount(0);
  }, [cards]);

  const handleRestart = useCallback(() => {
    setQueue(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSeenCount(0);
  }, [cards]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card px-8 py-20 text-center shadow-sm">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold tracking-tight">
          Session Complete!
        </h2>
        <p className="mt-2 text-muted-foreground">
          You reviewed all {total} {total === 1 ? "card" : "cards"} in this
          deck.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={handleRestart} variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            Study Again
          </Button>
          <Button onClick={handleShuffle} variant="outline">
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle &amp; Restart
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/decks/${deckId}`}>Back to Deck</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar + counter */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <Badge variant="secondary" className="shrink-0 tabular-nums">
          {currentIndex + 1} / {total}
        </Badge>
      </div>

      {/* Flashcard */}
      <div
        className="relative h-72 cursor-pointer select-none sm:h-80"
        style={{ perspective: "1200px" }}
        onClick={() => setIsFlipped((f) => !f)}
        role="button"
        aria-label={isFlipped ? "Click to see front" : "Click to reveal answer"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") setIsFlipped((f) => !f);
        }}
      >
        <div
          className="relative h-full w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card px-8 py-10 shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wide">
              Front
            </Badge>
            <p className="text-center text-2xl font-semibold leading-snug">
              {currentCard.front}
            </p>
            <p className="absolute bottom-5 text-xs text-muted-foreground">
              Click to reveal answer
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-muted/30 px-8 py-10 shadow-sm"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wide">
              Back
            </Badge>
            <p className="text-center text-2xl font-semibold leading-snug">
              {currentCard.back}
            </p>
            <p className="absolute bottom-5 text-xs text-muted-foreground">
              Click to flip back
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={goToPrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShuffle}
          title="Shuffle cards"
        >
          <Shuffle className="mr-1 h-4 w-4" />
          Shuffle
        </Button>

        <Button variant="default" onClick={goToNext}>
          {currentIndex + 1 === total ? "Finish" : "Next"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
