"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Eraser, MessageCircleWarning, CheckCircle2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { genRemove } from "@/server/gen-remove";
import { toast } from "sonner";

export default function GenRemove() {
  const setGenerating = useImageStore((state) => state.setGenerating);
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);
  const [activeTag, setActiveTag] = useState("");

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="p-4">
          <span className="flex gap-1 items-center justify-center text-xs">
            <Eraser size={20} /> Content Aware Delete
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="mb-2">
          <h3>Smart AI Remove</h3>
          <p className="text-sm text-muted-foreground">
            Generative remove any part of the image
          </p>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="selection">Selection</Label>
          <Input
            className="col-span-2 h-8"
            value={activeTag}
            onChange={(e) => setActiveTag(e.target.value)}
          />
        </div>
        <Button
          onClick={async () => {
            const newLayerId = crypto.randomUUID();
            setGenerating(true);

            const res = await genRemove({
              prompt: activeTag,
              activeImage: activeLayer.url!,
            });

            if (res?.data?.success) {
              setGenerating(false);
              addLayer({
                id: newLayerId,
                url: res.data.success,
                format: activeLayer.format,
                height: activeLayer.height,
                width: activeLayer.width,
                name: "genRemoved" + activeLayer.name,
                publicId: activeLayer.publicId,
                resourceType: "image",
              });
              setActiveLayer(newLayerId);
              toast(`${activeTag.toUpperCase()} removed!`, {
                dismissible: true,
                icon: <CheckCircle2 className="mr-2 text-2xl text-green-400" />,
                duration: 4000,
                closeButton: true,
              });
            }

            if (res?.serverError) {
              setGenerating(false);
              toast(
                res?.serverError || `Error removing ${activeTag} from image`,
                {
                  dismissible: true,
                  icon: (
                    <MessageCircleWarning className="mr-4 text-2xl text-red-400" />
                  ),
                  duration: 4000,
                  closeButton: true,
                }
              );
            }
          }}
          className="w-full mt-4"
        >
          Magic Remove
        </Button>
      </PopoverContent>
    </Popover>
  );
}
