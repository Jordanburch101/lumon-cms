import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionConverter({
  node,
}: {
  node: {
    fields: {
      items: Array<{ title: string; content: string; id?: string }>;
    };
  };
}) {
  const { items } = node.fields;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="not-prose my-6">
      <Accordion type="multiple">
        {items.map((item, i) => (
          <AccordionItem key={item.id ?? i} value={item.id ?? `item-${i}`}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.content}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
