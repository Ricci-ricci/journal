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
  <div className="min-h-dvh bg-background glow flex flex-col">
    <header className="px-5 sm:px-8 h-16 flex items-center">
      <Link href="/">
        <Wordmark />
      </Link>
    </header>

    <main className="flex-1 flex items-start sm:items-center justify-center px-5 pt-10 pb-24">
      <div className="panel shadow-pop w-full max-w-[26rem] p-6 sm:p-8">
        <h1 className="font-heading text-2xl leading-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-loss/30 bg-loss/10 px-3 py-2.5 text-sm text-loss"
          >
            {error}
          </p>
        )}

        <div className="mt-7">{children}</div>

        {footer && (
          <p className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">
            {footer}
          </p>
        )}
      </div>
    </main>
  </div>
);

export const authLinkClasses =
  "link";
