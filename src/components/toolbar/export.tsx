"use client";

import { useLayerStore } from "@/lib/layer-store";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Download, MessageCircleWarning } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ExportAsset({ resource }: { resource: string }) {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const [selected, setSelected] = useState("original");

  const handleDownload = async () => {
    if (activeLayer.publicId) {
      try {
        const res = await fetch(
          `/api/download?publicId=${activeLayer.publicId}&quality=${selected}&resource_type=${activeLayer.resourceType}&format=${activeLayer.format}&url=${activeLayer.url}`
        );

        if (!res.ok) {
          toast("Failed to export", {
            dismissible: true,
            icon: (
              <MessageCircleWarning className="mr-4 text-2xl text-red-400" />
            ),
            duration: 4000,
            closeButton: true,
          });
        }

        const data = await res.json();
        console.log("🚀 ~ handleDownload ~ data:", data.url);

        if (data.error) {
          toast(data.error || "Failed to export", {
            dismissible: true,
            icon: (
              <MessageCircleWarning className="mr-4 text-2xl text-red-400" />
            ),
            duration: 4000,
            closeButton: true,
          });
        }

        const imageResponse = await fetch(data.url, {
          method: "GET",
          mode: "cors", // This is important
          headers: {
            Origin: "http://localhost:3000",
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
          credentials: "omit",
        });

        if (!imageResponse.ok) {
          toast("Failed to fetch image response", {
            dismissible: true,
            icon: (
              <MessageCircleWarning className="mr-4 text-2xl text-red-400" />
            ),
            duration: 4000,
            closeButton: true,
          });
        }

        const imageBlob = await imageResponse.blob();
        const downloadUrl = URL.createObjectURL(imageBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = data.filename;
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.log("🚀 ~ handleDownload ~ error:", error);
        toast("Download failed", {
          dismissible: true,
          icon: <MessageCircleWarning className="mr-4 text-2xl text-red-400" />,
          duration: 4000,
          closeButton: true,
        });
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger disabled={!activeLayer.url} asChild>
        <Button variant="outline" className="py-">
          <span className="flex gap-1 items-center justify-center text-xs">
            Export
            <Download size={18} />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h3 className="text-center text-2xl font-medium pb-4">Export</h3>
        <Card
          onClick={() => setSelected("original")}
          className={cn(
            selected === "original" ? "border-primary" : null,
            "p-4 cursor pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Original</CardTitle>
            <CardDescription>
              {activeLayer.width}X{activeLayer.height}
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelected("large")}
          className={cn(
            selected === "large" ? "border-primary" : null,
            "p-4 cursor pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Large</CardTitle>
            <CardDescription>
              {(activeLayer.width! * 0.7).toFixed(0)}X
              {(activeLayer.height! * 0.7).toFixed(0)}
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelected("medium")}
          className={cn(
            selected === "medium" ? "border-primary" : null,
            "p-4 cursor pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Medium</CardTitle>
            <CardDescription>
              {(activeLayer.width! * 0.5).toFixed(0)}X
              {(activeLayer.height! * 0.5).toFixed(0)}
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          onClick={() => setSelected("small")}
          className={cn(
            selected === "small" ? "border-primary" : null,
            "p-4 cursor pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Small</CardTitle>
            <CardDescription>
              {(activeLayer.width! * 0.3).toFixed(0)}X
              {(activeLayer.height! * 0.3).toFixed(0)}
            </CardDescription>
          </CardContent>
        </Card>
        <Button onClick={handleDownload}>
          Download {selected} {resource}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
