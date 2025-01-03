"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { CheckCircle2, Image, MessageCircleWarning } from "lucide-react";

import { bgRemove } from "@/server/bg-remove";
import { toast } from "sonner";

export default function BGRemove() {
  const setGenerating = useImageStore((state) => state.setGenerating);
  const generating = useImageStore((state) => state.generating);
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="p-4">
          <span className="flex gap-1 items-center justify-center text-xs">
            <Image size={20} /> BG Removal
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="mb-2">
          <h3>Background Removal</h3>
          <p className="text-sm text-muted-foreground">
            Remove background of the image
          </p>
        </div>
        <Button
          disabled={!activeLayer.url || generating}
          onClick={async () => {
            const newLayerId = crypto.randomUUID();
            setGenerating(true);

            const res = await bgRemove({
              activeImage: activeLayer.url!,
              format: activeLayer.format!,
            });

            if (res?.data?.success) {
              setGenerating(false);
              addLayer({
                id: newLayerId,
                url: res.data.success,
                format: "png",
                height: activeLayer.height,
                width: activeLayer.width,
                name: "BGRemoved" + activeLayer.name,
                publicId: activeLayer.publicId,
                resourceType: "image",
              });
              setActiveLayer(newLayerId);
              toast("Background removed", {
                dismissible: true,
                icon: <CheckCircle2 className="mr-2 text-2xl text-green-400" />,
                duration: 4000,
                closeButton: true,
              });
            }

            if (res?.serverError) {
              setGenerating(false);
              toast(res?.serverError || "Error removing background", {
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
          {generating ? "Removing..." : "Remove Background"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
