import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        <h1 className="font-heading text-7xl font-bold text-foreground md:text-8xl lg:text-9xl">
          STDNTLAB
        </h1>
        <p className="max-w-md text-lg text-muted-foreground md:text-xl">
          AI-powered student lab for smarter, collaborative studying.
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="mt-4">
            Get Started
          </Button>
        </Link>
      </main>
    </div>
  );
}
