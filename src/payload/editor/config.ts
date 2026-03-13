import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import {
  AccordionBlock,
  CalloutBlock,
  EmbedBlock,
  RichTextButtonBlock,
  RichTextMediaBlock,
} from "./blocks";

export const richTextEditor = lexicalEditor({
  features: () => [
    // Toolbars
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    // Text formatting
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    // Structure
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    AlignFeature(),
    IndentFeature(),
    // Lists
    OrderedListFeature(),
    UnorderedListFeature(),
    ChecklistFeature(),
    // Links & media
    LinkFeature({ enabledCollections: ["pages"] }),
    UploadFeature({ collections: { media: { fields: [] } } }),
    // Tables
    EXPERIMENTAL_TableFeature(),
    // Custom blocks
    BlocksFeature({
      blocks: [
        CalloutBlock,
        RichTextButtonBlock,
        RichTextMediaBlock,
        AccordionBlock,
        EmbedBlock,
      ],
    }),
  ],
});
