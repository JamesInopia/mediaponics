import { Suspense } from "react";
import ContentBrowser from "@/components/ContentBrowser";

export default function ContentPage() {
  return (
    <main>
      <Suspense
        fallback={
          <p className="px-6 py-16 text-center text-sm text-black/60">
            Loading...
          </p>
        }
      >
        <ContentBrowser />
      </Suspense>
    </main>
  );
}