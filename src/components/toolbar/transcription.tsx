"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import { initiateTranscription } from "@/server/transcibe";
import { useState } from "react";
import { Button } from "../ui/button";
import { Captions, CheckCircle2, MessageCircleWarning } from "lucide-react";
import { toast } from "sonner";

export default function VideoTranscription() {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const setGenerating = useImageStore((state) => state.setGenerating);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);
  const [transcribing, setTranscribing] = useState(false);

  const handleTranscibe = async () => {
    if (!activeLayer.publicId || activeLayer.resourceType !== "video") return;
    setTranscribing(true);
    setGenerating(true);

    try {
      const result = await initiateTranscription({
        publicId: activeLayer.publicId,
      });

      if (result) {
        if (result.data && "success" in result.data) {
          toast(result.data.success, {
            dismissible: true,
            icon: <CheckCircle2 className="mr-2 text-2xl text-green-400" />,
            duration: 4000,
            closeButton: true,
          });
          if (result.data.subtitledVideoUrl) {
            updateLayer({
              ...activeLayer,
              transcriptionURL: result.data.subtitledVideoUrl,
            });
            setActiveLayer(activeLayer.id);
          }
        } else if (result?.data?.error) {
          toast(result.data.error, {
            dismissible: true,
            icon: (
              <MessageCircleWarning className="mr-4 text-2xl text-red-400" />
            ),
            duration: 4000,
            closeButton: true,
          });
        } else {
          console.error(result?.data?.error);
          toast("Unexpected response from server", {
            dismissible: true,
            icon: (
              <MessageCircleWarning className="mr-4 text-2xl text-red-400" />
            ),
            duration: 4000,
            closeButton: true,
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast("An error occured during transcription", {
        dismissible: true,
        icon: <MessageCircleWarning className="mr-4 text-2xl text-red-400" />,
        duration: 4000,
        closeButton: true,
      });
    } finally {
      setTranscribing(false);
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center">
      {!activeLayer.transcriptionURL && (
        <Button
          className="p-4 w-full"
          onClick={handleTranscibe}
          disabled={transcribing || activeLayer.resourceType !== "video"}
        >
          <span className="flex gap-1 items-center justify-center  text-xs font-medium">
            {transcribing ? "Transcribing..." : "Transcribe"}
            <Captions size={18} />
          </span>
        </Button>
      )}
      {activeLayer.transcriptionURL && (
        <Button className="p-4 w-full" variant="outline" asChild>
          <a
            href={activeLayer.transcriptionURL}
            target="_blank"
            rel="noopener noreference"
          >
            <span className="flex gap-1 items-center justify-center  text-xs font-medium">
              View Transcription
              <Captions size={18} />
            </span>
          </a>
        </Button>
      )}
    </div>
  );
}
