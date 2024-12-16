"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CheckCircle2, Crop, MessageCircleWarning, Square } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import TikTok from "../icons/tiktok";
import Youtube from "../icons/youtube";
import { smartCrop } from "@/server/smart-crop";

export default function SmartCrop() {
  const setGenerating = useImageStore((state) => state.setGenerating);
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const generating = useImageStore((state) => state.generating);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);

  const handleGenCrop = async () => {
    setGenerating(true);
    const res = await smartCrop({
      height: activeLayer.height!.toString(),
      aspect: aspectRatio,
      activeVideo: activeLayer.url!,
    });

    if (res?.data?.success) {
      console.log(res.data.success);
      setGenerating(false);
      const newLayerId = crypto.randomUUID();
      const thumbnailUrl = res.data.success.replace(/\.[^/.]+$/, ".jpg");
      addLayer({
        id: newLayerId,
        name: "cropped " + activeLayer.name,
        format: activeLayer.format,
        height: height + activeLayer.height!,
        width: width + activeLayer.width!,
        url: res.data.success,
        publicId: activeLayer.publicId,
        resourceType: "video",
        poster: thumbnailUrl,
      });
      toast("Video cropped", {
        dismissible: true,
        icon: <CheckCircle2 className="mr-2 text-2xl text-green-400" />,
        duration: 4000,
        closeButton: true,
      });
      setActiveLayer(newLayerId);
    }
    if (res?.serverError) {
      toast(res?.serverError || "Error cropping video", {
        dismissible: true,
        icon: <MessageCircleWarning className="mr-4 text-2xl text-red-400" />,
        duration: 4000,
        closeButton: true,
      });
      setGenerating(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer.url} asChild>
        <Button variant="outline" className="py-">
          <span className="flex gap-1 items center text-xs font-medium">
            Smart Crop
            <Crop size={18} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="flex flex-col h-full">
          <div className="space-y-2 pb-4">
            <h3 className="font-medium text-center py-2 leading-none">
              Smart Recrop
            </h3>
          </div>
          <h4 className="text-md font-medium pb-2">Format</h4>
          <div className={"flex gap-4 items-center justify-center pb-2"}>
            <Card
              className={cn(
                aspectRatio === "16:9" ? " border-primary" : "",
                "p-4 w-36 cursor-pointer"
              )}
              onClick={() => setAspectRatio("16:9")}
            >
              <CardHeader className="text-center p-0">
                <CardTitle className="text-md">Youtube</CardTitle>
                <CardDescription>
                  <p className="text-sm font-bold">16:9</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-0 pt-2">
                <Youtube />
              </CardContent>
            </Card>
            <Card
              className={cn(
                aspectRatio === "9:16" ? " border-primary" : "",
                "p-4 w-36 cursor-pointer"
              )}
              onClick={() => setAspectRatio("9:16")}
            >
              <CardHeader className="p-0 text-center">
                <CardTitle className="text-md ">Tiktok</CardTitle>
                <CardDescription>
                  <p className="text-sm font-bold ">9:16</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-0 pt-2">
                <TikTok />
              </CardContent>
            </Card>
            <Card
              className={cn(
                aspectRatio === "1:1" ? " border-primary" : "",
                "p-4 w-36 cursor-pointer"
              )}
              onClick={() => setAspectRatio("1:1")}
            >
              <CardHeader className="p-0 text-center">
                <CardTitle className="text-md">Square</CardTitle>
                <CardDescription>
                  <p className="text-sm font-bold">1:1</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-0 pt-2">
                <Square className="w-10 h-10" />
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={handleGenCrop}
            className="w-full mt-4"
            variant={"outline"}
            disabled={!activeLayer.url || generating}
          >
            {generating ? "Cropping..." : "Smart Crop 🎨"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
