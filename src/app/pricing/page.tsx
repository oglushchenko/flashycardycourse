import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main className="flex flex-col items-center py-16 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">Pricing</h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Choose the plan that works best for you. Upgrade anytime to unlock
          more features.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        <PricingTable />
      </div>
    </main>
  );
}
