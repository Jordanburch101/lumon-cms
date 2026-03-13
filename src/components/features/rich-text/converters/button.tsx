import { CMSLink } from "@/components/ui/cms-link";

export function ButtonConverter({
  node,
}: {
  node: {
    fields: {
      link: {
        type?: "internal" | "external" | null;
        label?: string | null;
        url?: string | null;
        reference?: {
          value?: { slug?: string } | string | number | null;
          relationTo?: string;
        } | null;
        newTab?: boolean | null;
        appearanceType?: "button" | "link" | null;
        buttonVariant?:
          | "default"
          | "outline"
          | "secondary"
          | "ghost"
          | "link"
          | null;
        buttonSize?: "xs" | "sm" | "default" | "lg" | null;
      };
    };
  };
}) {
  return (
    <div className="not-prose my-6">
      <CMSLink link={node.fields.link} />
    </div>
  );
}
