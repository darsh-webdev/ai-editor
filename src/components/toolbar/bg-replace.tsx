"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { CheckCircle2, ImageOff, MessageCircleWarning } from "lucide-react";

import { bgReplace } from "@/server/bg-replace";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";

export default function BackgroundReplace() {
  const setGenerating = useImageStore((state) => state.setGenerating);
  const generating = useImageStore((state) => state.generating);
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);
  const [prompt, setPrompt] = useState("");

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="p-4">
          <span className="flex gap-1 items-center justify-center text-xs">
            <ImageOff size={20} /> BG Replace
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="mb-2">
          <h3>Generative Background Replace</h3>
          <p className="text-sm text-muted-foreground">
            Replace the background of your image with AI-generated content.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the new background"
          />
        </div>
        <Button
          disabled={!activeLayer.url || generating}
          onClick={async () => {
            const newLayerId = crypto.randomUUID();
            setGenerating(true);

            const res = await bgReplace({
              activeImage: activeLayer.url!,
              prompt: prompt,
            });

            if (res?.data?.success) {
              setGenerating(false);
              setPrompt("");
              addLayer({
                id: newLayerId,
                url: res.data.success,
                format: activeLayer.format,
                height: activeLayer.height,
                width: activeLayer.width,
                name: "BGReplaced" + activeLayer.name,
                publicId: activeLayer.publicId,
                resourceType: "image",
              });
              setActiveLayer(newLayerId);
              toast("Background replaced", {
                dismissible: true,
                icon: <CheckCircle2 className="mr-2 text-2xl text-green-400" />,
                duration: 4000,
                closeButton: true,
              });
            }

            if (res?.serverError) {
              setGenerating(false);
              toast(res?.serverError || "Error replacing background", {
                dismissible: true,
                icon: (
                  <MessageCircleWarning className="mr-4 text-2xl text-red-400" />
                ),
                duration: 4000,
                closeButton: true,
              });
            }
          }}
          className="w-full mt-4"
        >
          {generating ? "Generating..." : "Replace Background"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
