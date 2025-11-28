import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center gap-4 pb-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="StdntLAB Logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
            <span className="font-semibold text-xl">StdntLAB</span>
          </Link>
        </div>
        <div className="flex justify-center gap-4 border-b border-border pb-4">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link
            href="/auth/signup"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign Up
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

