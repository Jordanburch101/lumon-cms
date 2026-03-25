import {
  DiscordIcon,
  Facebook01Icon,
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  TiktokIcon,
  TwitchIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export const socialIconMap: Record<string, IconSvgElement> = {
  github: GithubIcon,
  twitter: NewTwitterIcon,
  linkedin: Linkedin01Icon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  facebook: Facebook01Icon,
  tiktok: TiktokIcon,
  discord: DiscordIcon,
  twitch: TwitchIcon,
};
