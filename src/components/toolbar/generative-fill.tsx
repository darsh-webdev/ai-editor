"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { MessageCircleWarning, CheckCircle2, Crop } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { genFill } from "@/server/gen-fill";

const PREVIEW_SIZE = 300;
const EXPANSION_THRESHOLD = 250;

export default function GenerativeFill() {
  const setGenerating = useImageStore((state) => state.setGenerating);
  const generating = useImageStore((state) => state.generating);
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const previewStyle = useMemo(() => {
    if (!activeLayer.width || !activeLayer.height) return {};
    const newWidth = activeLayer.width + width;
    const newHeight = activeLayer.height + height;
    const scale = Math.min(PREVIEW_SIZE / newWidth, PREVIEW_SIZE / newHeight);

    return {
      width: `${newWidth * scale}px`,
      height: `${newHeight * scale}px`,
      backgroundImage: `url(${activeLayer.url})`,
      backgroundSize: `${activeLayer.width * scale}px ${
        activeLayer.height * scale
      }px`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative" as const,
    };
  }, [activeLayer, width, height]);

  const previewOverlayStyle = useMemo(() => {
    if (!activeLayer.width || !activeLayer.height) return {};
    const scale = Math.min(
      PREVIEW_SIZE / (activeLayer.width + width),
      PREVIEW_SIZE / (activeLayer.height + height)
    );
    const leftWidth = width > 0 ? `${(width / 2) * scale}px` : 0;
    const rightWidth = width > 0 ? `${(width / 2) * scale}px` : 0;
    const topHeight = height > 0 ? `${(height / 2) * scale}px` : 0;
    const bottomHeight = height > 0 ? `${(height / 2) * scale}px` : 0;

    return {
      position: "absolute" as const,
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      boxShadow: `inset ${leftWidth} ${topHeight} 0 rgba(48, 119, 255, 1), 
                    inset -${rightWidth} ${topHeight} 0 rgba(48, 119, 255, 1), 
                    inset ${leftWidth} -${bottomHeight} 0 rgba(48, 119, 255, 1), 
                    inset -${rightWidth} -${bottomHeight} 0 rgba(48, 119, 255,1)`,
    };
  }, [activeLayer, width, height]);

  const ExpansionIndicator = ({
    value,
    axis,
  }: {
    value: number;
    axis: "x" | "y";
  }) => {
    const isVisible = Math.abs(value) >= EXPANSION_THRESHOLD;
    const position =
      axis === "x"
        ? {
            top: "50%",
            [value > 0 ? "right" : "left"]: 0,
            transform: "translateY(-50%)",
          }
        : {
            left: "50%",
            [value > 0 ? "bottom" : "top"]: 0,
            transform: "translateX(-50%)",
          };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute bg-secondary text-primary px-2 py-1 rounded-md text-xs font-bold"
            style={position}
          >
            {Math.abs(value)}px
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const handleGenFill = async () => {
    const newLayerId = crypto.randomUUID();
    setGenerating(true);

    const res = await genFill({
      activeImage: activeLayer.url!,
      aspect: "1:1",
      height: activeLayer.height! + height,
      width: activeLayer.width! + width,
    });

    if (res?.data?.success) {
      setGenerating(false);
      addLayer({
        id: newLayerId,
        url: res.data.success,
        format: activeLayer.format,
        height: activeLayer.height! + height,
        width: activeLayer.width! + width,
        name: "genFill" + activeLayer.name,
        publicId: activeLayer.publicId,
        resourceType: "image",
      });
      setActiveLayer(newLayerId);
      toast("Generated fill", {
        dismissible: true,
        icon: <CheckCircle2 className="mr-2 text-2xl text-green-400" />,
        duration: 4000,
        closeButton: true,
      });
    }

    if (res?.serverError) {
      setGenerating(false);
      toast(res?.serverError || "Error generating fill for image", {
        dismissible: true,
        icon: <MessageCircleWarning className="mr-4 text-2xl text-red-400" />,
        duration: 4000,
        closeButton: true,
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="p-4">
          <span className="flex gap-1 items-center justify-center text-xs">
            <Crop size={20} /> Generative Fill
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full h-full">
        <div className="mb-2 flex flex-col h-full">
          <div className="pb-4">
            <h3>Generative Fill</h3>
            <p className="text-sm text-muted-foreground">
              Generative remove any part of the image
            </p>
          </div>
          {activeLayer.width && activeLayer.height ? (
            <div className="flex justify-evenly">
              <div className="flex flex-col items-center">
                <span className="text-xs">Current Size: </span>
                <p className="text-sm text-primary font-bold">
                  {activeLayer.width}X{activeLayer.height}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs">New Size</span>
                <p className="text-sm text-primary font-bold">
                  {activeLayer.width + width}X{activeLayer.height + height}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex gap-2 items-center justify-center">
          <div className="text-center">
            <Label htmlFor="width">Modify Width</Label>
            <Input
              name="width"
              type="range"
              max={activeLayer.width}
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div className="text-center">
            <Label htmlFor="height">Modify Height</Label>
            <Input
              name="height"
              type="range"
              max={activeLayer.height}
              min={-activeLayer.height! + 100}
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        <div
          className="preview-container flex-grow"
          style={{
            width: `${PREVIEW_SIZE}px`,
            height: `${PREVIEW_SIZE}px`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            margin: "auto",
          }}
        >
          <div style={previewStyle}>
            <div className="animate-pulsate" style={previewOverlayStyle}></div>
            <ExpansionIndicator value={width} axis="x" />
            <ExpansionIndicator value={height} axis="y" />
          </div>
        </div>

        <Button onClick={handleGenFill} className="w-full mt-4">
          {generating ? "Generating..." : "Generative Fill"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
