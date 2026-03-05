import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FormCard() {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-background p-4">
      <div>
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Forms
        </span>
        <p className="mt-1.5 font-medium text-sm">Get in touch</p>
      </div>
      <form className="flex flex-col gap-2">
        <Input className="h-7 text-xs" placeholder="Your name" />
        <Input
          className="h-7 text-xs"
          placeholder="you@example.com"
          type="email"
        />
        <Button className="h-7 w-full text-xs" size="sm" type="button">
          Submit
        </Button>
      </form>
    </div>
  );
}
