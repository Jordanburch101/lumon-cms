"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h3 className="font-semibold text-lg">Stay up to date</h3>
      <p className="mt-1 text-muted-foreground text-sm">
        Get the latest news and updates delivered to your inbox.
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input className="flex-1" placeholder="Enter your email" type="email" />
        <Button type="submit">Subscribe</Button>
      </form>
    </div>
  );
}
