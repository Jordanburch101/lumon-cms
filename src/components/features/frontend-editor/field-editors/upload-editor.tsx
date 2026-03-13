"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hoisted regex — lint/performance/useTopLevelRegex
const RE_EXTENSION = /\.[^.]+$/;

interface MediaItem {
  alt?: string;
  filename?: string;
  id: number;
  url: string;
}

interface UploadEditorProps {
  currentMediaId: number | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaId: number, mediaUrl: string) => void;
  open: boolean;
}

function MediaGrid({
  media,
  currentMediaId,
  onSelect,
  onOpenChange,
}: {
  currentMediaId: number | null;
  media: MediaItem[];
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaId: number, mediaUrl: string) => void;
}) {
  if (media.length === 0) {
    return (
      <p className="py-4 text-center text-muted-foreground text-xs">
        No media found.
      </p>
    );
  }

  return (
    <div className="mt-2 grid max-h-80 grid-cols-4 gap-2 overflow-y-auto">
      {media.map((item) => (
        <button
          className={`group relative aspect-square overflow-hidden rounded-md border transition-colors hover:border-primary ${
            item.id === currentMediaId ? "border-primary" : "border-border"
          }`}
          key={item.id}
          onClick={() => {
            onSelect(item.id, item.url);
            onOpenChange(false);
          }}
          type="button"
        >
          <Image
            alt={item.alt ?? item.filename ?? ""}
            className="object-cover"
            fill
            sizes="80px"
            src={item.url}
          />
        </button>
      ))}
    </div>
  );
}

function BrowseContent({
  loading,
  media,
  currentMediaId,
  onSelect,
  onOpenChange,
}: {
  currentMediaId: number | null;
  loading: boolean;
  media: MediaItem[];
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaId: number, mediaUrl: string) => void;
}) {
  if (loading) {
    return (
      <p className="py-4 text-center text-muted-foreground text-xs">
        Loading...
      </p>
    );
  }

  return (
    <MediaGrid
      currentMediaId={currentMediaId}
      media={media}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
    />
  );
}

export function UploadEditor({
  open,
  onOpenChange,
  currentMediaId,
  onSelect,
}: UploadEditorProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setLoading(true);
    fetch("/api/media?limit=20&sort=-createdAt")
      .then((res) => res.json())
      .then((data) => {
        const docs: MediaItem[] = data?.docs ?? [];
        setMedia(docs);
      })
      .catch(() => {
        setMedia([]);
      })
      .finally(() => setLoading(false));
  }, [open]);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "_payload",
        JSON.stringify({ alt: file.name.replace(RE_EXTENSION, "") })
      );

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const uploaded: MediaItem = await res.json();
        onSelect(uploaded.id, uploaded.url);
        onOpenChange(false);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="browse">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <BrowseContent
              currentMediaId={currentMediaId}
              loading={loading}
              media={media}
              onOpenChange={onOpenChange}
              onSelect={onSelect}
            />
          </TabsContent>

          <TabsContent value="upload">
            <div className="mt-2 flex flex-col gap-3">
              <Input accept="image/*,video/*" ref={fileInputRef} type="file" />
              <Button
                disabled={uploading}
                onClick={handleUpload}
                size="sm"
                type="button"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
