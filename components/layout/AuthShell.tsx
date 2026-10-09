import Link from "next/link";
import { Wordmark } from "./Wordmark";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  error?: string | null;
  children: React.ReactNode;
  /* Line under the form, e.g. a link to the other auth page. */
  footer?: React.ReactNode;
}

/* Shared frame for the sign-in and register pages. */
export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  error,
  children,
  footer,
}) => (
  <div className="min-h-dvh bg-background flex flex-col">
    <header className="px-5 sm:px-8 h-16 flex items-center">
      <Link href="/">
        <Wordmark />
      </Link>
    </header>

    <main className="flex-1 flex items-start sm:items-center justify-center px-5 pt-10 pb-24">
      <div className="w-full max-w-[22rem]">
        <h1 className="font-heading text-[34px] leading-none tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2.5 text-sm text-muted-foreground">{subtitle}</p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-md border border-loss/40 bg-loss/10 px-3 py-2.5 text-sm text-loss"
          >
            {error}
          </p>
        )}

        <div className="mt-7">{children}</div>

        {footer && (
          <p className="mt-8 text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </main>
  </div>
);

export const authLinkClasses =
  "text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground transition-colors";
