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
          "A badge shows the asset's license name, such as CC0 or CC BY. Hover over it for a short description, and open the asset to see whether commercial use is allowed. The source's own page always has the full terms.",
        ],
      },
      {
        question: "Why can't I download assets from Mediaponics?",
        answer: [
          "We don't host any files. Hosting other people's media would mean serving copies that could fall out of date if a creator changes the license or removes the asset. Instead, every asset has a Go to source button that sends you to the official page, where you get the file and its current terms.",
        ],
      },
    ],
  },
  {
    id: "attribution",
    title: "Attribution",
    items: [
      {
        question: "How does attribution work?",
        answer: [
          "Attribution means crediting the creator the way the license asks. CC0 assets need no credit. For CC BY, CC BY-SA and CC BY-NC assets, a good credit line includes the title, the creator, where you found it, and the license name, with links where you can. If you changed the asset, say so.",
        ],
      },
      {
        question: "When do I need to credit the creator?",
        answer: [
          "Whenever the license requires it, for example CC BY. Each asset shows the credit text to copy. When in doubt, credit the creator anyway.",
        ],
      },
      {
        question: "What does a credit line look like?",
        answer: [
          "For example: “Rain on Window” by Jane Doe, from Wikimedia Commons, licensed under CC BY 4.0. Put it where viewers will see it, such as the video description or end credits.",
        ],
      },
      {
        question: "What does CC BY-SA mean for my project?",
        answer: [
          "Share-alike: if you adapt the asset, your adapted version must be shared under the same license. Whether a finished video counts as an adaptation can be a gray area, so read the license terms on the source page.",
        ],
      },
      {
        question: "Can I use CC BY-NC assets in a monetized video?",
        answer: [
          "Non-commercial licenses don't allow commercial use, and a monetized video can count as one depending on the situation. If you're unsure, choose a CC0 or CC BY asset instead, or ask the creator.",
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
          "Our data is collected from each source's public listings and can lag behind. Sources can change or remove assets at any time, so check the official page before you use something.",
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
          "Use the Report content link in the footer. It opens a new issue on our GitHub repository, so you'll need a free GitHub account. Include the asset's link and the reason for the report.",
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

      <div className="lg:pr-[min(21rem,max(0px,calc(1632px-100vw)))]">
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
