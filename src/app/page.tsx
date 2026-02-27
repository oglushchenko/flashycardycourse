import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
      <main className="flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight">FlashyCardy</h1>
        <p className="text-lg text-muted-foreground">
          Your personal flashcard platform
        </p>
        <div className="mt-4 flex gap-4">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline" size="lg">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="lg">Sign up</Button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}
