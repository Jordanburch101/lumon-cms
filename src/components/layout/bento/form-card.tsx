import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FormCard() {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-card p-4 ring-1 ring-foreground/10">
      <div>
        <p className="font-medium text-sm">Get in touch</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          We&apos;ll get back to you shortly.
        </p>
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
