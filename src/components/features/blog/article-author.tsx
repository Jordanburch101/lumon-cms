import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArticleAuthorProps {
  avatarUrl: string;
  bio?: string;
  jobTitle?: string;
  name: string;
  variant: "inline" | "bio";
}

export function ArticleAuthor({
  name,
  avatarUrl,
  jobTitle,
  bio,
  variant,
}: ArticleAuthorProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="size-9 ring-1 ring-border/50">
          <AvatarImage alt={name} src={avatarUrl} />
          <AvatarFallback className="text-xs">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-foreground text-sm">{name}</div>
          {jobTitle && (
            <div className="text-muted-foreground text-xs">{jobTitle}</div>
          )}
        </div>
      </div>
    );
  }

  // Bio variant — larger, with description
  return (
    <div className="flex gap-4">
      <Avatar className="size-12 shrink-0 ring-1 ring-border/50">
        <AvatarImage alt={name} src={avatarUrl} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
          Written by
        </div>
        <div className="mt-1 font-medium text-foreground">{name}</div>
        {bio && (
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}
