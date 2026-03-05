import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FormCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Get in touch</CardTitle>
        <CardDescription>We'll get back to you shortly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bento-name">Name</FieldLabel>
              <Input id="bento-name" placeholder="Your name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="bento-email">Email</FieldLabel>
              <Input
                id="bento-email"
                placeholder="you@example.com"
                type="email"
              />
            </Field>
            <Button className="w-full" type="button">
              Submit
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
