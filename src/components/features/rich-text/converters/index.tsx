import type { JSXConverter } from "@payloadcms/richtext-lexical/react";
import { AccordionConverter } from "./accordion";
import { ButtonConverter } from "./button";
import { CalloutConverter } from "./callout";
import { EmbedConverter } from "./embed";
import { HorizontalRuleConverter } from "./horizontal-rule";
import { MediaConverter } from "./media";

// biome-ignore lint/suspicious/noExplicitAny: JSXConverter generic mirrors Payload's own type definition
export const customBlockConverters: Record<string, JSXConverter<any>> = {
  callout: CalloutConverter,
  richTextButton: ButtonConverter,
  richTextMedia: MediaConverter,
  accordion: AccordionConverter,
  embed: EmbedConverter,
};

export const customNodeConverters = {
  horizontalrule: () => <HorizontalRuleConverter />,
};
