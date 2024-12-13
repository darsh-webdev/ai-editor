import { uploadImage } from "@/server/upload-image";
import React, { act } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import { toast } from "sonner";
import { CheckCircle2, MessageCircleWarning } from "lucide-react";
import Lottie from "lottie-react";
import VideoAnimation from "../../../public/animations/video-upload.json";

const UploadVideo = () => {
  return (
    <Card
      className={cn(
        "hover:cursor-pointer hover:bg-secondary hover:border-primary transition-all ease-in-out"
      )}
    >
      <CardContent className="flex flex-col h-full items-center justify-center px-2 py-24 text-xs">
        <div className="flex items-center justify-center flex-col gap-2">
          <p className="text-muted-foreground text-2xl">
            <Lottie className="h-48" animationData={VideoAnimation} />
            Start by uploading a video
          </p>
          <p className="text-muted-foreground">Supported formats .mp4</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadVideo;
