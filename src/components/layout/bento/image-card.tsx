import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { imageCardData } from "./bento-data";

export function ImageCard() {
  return (
    <Card className="h-full pt-0">
      <div className="relative">
        <div className="absolute inset-0 z-10 bg-primary opacity-50 mix-blend-color" />
        <Image
          alt={imageCardData.alt}
          className="aspect-[4/3] w-full object-cover brightness-60 grayscale"
          height={300}
          src={imageCardData.src}
          width={400}
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {imageCardData.title}
          <Badge variant="secondary">{imageCardData.badge}</Badge>
        </CardTitle>
        <CardDescription>{imageCardData.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
