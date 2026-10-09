import { redirect } from "next/navigation";

// The landing page used to live here; it is now the site root.
export default function AccueilPage() {
  redirect("/");
}
