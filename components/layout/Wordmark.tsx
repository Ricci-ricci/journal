import Image from "next/image";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  /* Show only the mark, without the name next to it. */
  markOnly?: boolean;
  className?: string;
}

export const Wordmark: React.FC<WordmarkProps> = ({ markOnly, className }) => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <Image
      src="/images/logo.jpg"
      alt={markOnly ? "Rally" : ""}
      width={26}
      height={26}
      className="rounded-[5px] shrink-0"
    />
    {!markOnly && (
      <span className="font-heading text-[21px] leading-none tracking-tight text-foreground">
        Rally
      </span>
    )}
  </span>
);
