import { CircleHelp } from "lucide-react";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import PageHeader from "@/components/PageHeader";
import PageNav from "@/components/PageNav";

type FaqSection = { id: string; title: string; items: AccordionItem[] };

const sections: FaqSection[] = [
  {
    id: "general",
    title: "General",
    items: [
      {
        question: "What is Mediaponics?",
        answer: [
          "Mediaponics is an open-source search for free and licensed sound effects, music, graphics, and b-roll. We index assets from across the web and show exactly what you can do with each one.",
          "We link to the original source; we don't host their media.",
        ],
      },
      {
        question: "Is Mediaponics free to use?",
        answer: [
          "Yes. Searching and browsing the catalog is free. Individual assets keep the license and pricing set by their original source.",
        ],
      },
    ],
  },
  {
    id: "content-licenses",
    title: "Content & Licenses",
    items: [
      {
        question: "Where does the content come from?",
        answer: [
          "Assets are indexed from supported sources and open-source collections. See the Sources section on the About page for the full list.",
        ],
      },
      {
        question: "Can I use every asset commercially?",
        answer: [
          "Not necessarily. Each asset has its own license, which we summarize on its listing. Always confirm the terms at the original source before publishing.",
        ],
      },
      {
        question: "Do I need to credit the creator?",
        answer: [
          "It depends on the license. Listings tell you when attribution is required and, where possible, provide the credit text to copy.",
        ],
      },
    ],
  },
  {
    id: "using-the-site",
    title: "Using the Site",
    items: [
      {
        question: "How do I search for assets?",
        answer: [
          "Use the search box on the home page or the Content page. You can narrow results by type and license.",
        ],
      },
      {
        question: "I found a wrong or missing license. What should I do?",
        answer: [
          "Please report it using the contact details on the About page so we can correct it.",
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
        </div>
      </div>

      <PageNav items={navItems} />
    </main>
  );
}
