import Link from "next/link";
import { CircleHelp } from "lucide-react";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import PageHeader from "@/components/PageHeader";
import PageNav from "@/components/PageNav";

type FaqSection = { id: string; title: string; items: AccordionItem[] };

const sections: FaqSection[] = [
  {
    id: "using-the-site",
    title: "Using the site",
    items: [
      {
        question: "Can I use these assets commercially?",
        answer: [
          "It depends on each asset's license. CC0 and public domain assets are free for any use, CC BY assets need credit, and non-commercial licenses don't allow commercial use. Always confirm on the source's official page.",
        ],
      },
      {
        question: "What do the license badges mean?",
        answer: [
          "Each badge summarizes the asset's license: whether you can use it commercially, edit it, and whether you must credit the creator.",
        ],
      },
      {
        question:
          "Can I download assets directly from Mediaponics?",
        answer: [
          "No. We don't host any files. Every asset has a Go to source button that sends you to the official page, so you get the file and its terms from the source.",
        ],
      },
    ],
  },
  {
    id: "attribution",
    title: "Attribution",
    items: [
      {
        question: "When do I need to credit the creator?",
        answer: [
          "Whenever the license requires it, for example CC BY. Each asset shows the credit text to copy. When in doubt, credit the creator anyway.",
        ],
      },
    ],
  },
  {
    id: "data",
    title: "Data",
    items: [
      {
        question: "Where does the data come from?",
        answer: [
          "From the supported sources listed on the About page. We store only metadata such as title, creator, duration, license and link, not the media files.",
        ],
      },
      {
        question: "How often is it updated?",
        answer: [
          "Each source is re-checked on a schedule, and every asset shows when its license was last verified.",
        ],
      },
      {
        question: "Why is an asset missing or outdated?",
        answer: [
          "Sources can remove or change assets, and our data can lag behind. Check the official page, and let us know about the mistake.",
        ],
      },
    ],
  },
  {
    id: "contributing",
    title: "Contributing",
    items: [
      {
        question: "How do I add a source or fix a license entry?",
        answer: [
          "Mediaponics is open source. Open an issue or a pull request in the repository.",
        ],
      },
      {
        question: "How do I report an error or request removal?",
        answer: [
          "Use the Report content link in the footer and include the asset's link and the reason.",
        ],
      },
    ],
  },
  {
    id: "developers",
    title: "Developers",
    items: [
      {
        question: "Is there an API or data dump?",
        answer: [
          "That is planned. API docs and data snapshots will be linked in the footer once they are available.",
        ],
      },
      {
        question: "What license is the metadata under?",
        answer: [
          "That hasn't been decided yet. Assets themselves always stay under their original licenses.",
        ],
      },
    ],
  },
];

const navItems = sections.map(({ id, title }) => ({ id, label: title }));

export default function FaqPage() {
  return (
    <main>
      <PageHeader
        icon={<CircleHelp size={16} aria-hidden />}
        eyebrow="Got Questions? Ask This Page!"
        title="FAQ"
        subtitle="Get quick answers to your questions"
      />

      <div className="lg:pr-[min(21rem,max(0px,calc(1632px_-_100vw)))]">
        <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
          {sections.map(({ id, title, items }) => (
            <section key={id} id={id} className="scroll-mt-8">
              <h2 className="mb-4 text-2xl font-bold">{title}</h2>
              <Accordion
                idPrefix={id}
                items={items}
                defaultOpen={id === sections[0].id ? 0 : null}
              />
            </section>
          ))}

          <p className="text-sm text-black/70">
            Can&apos;t find your answer?{" "}
            <Link href="/about#contact" className="font-semibold underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>

      <PageNav items={navItems} />
    </main>
  );
}