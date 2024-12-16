import { useLayerStore } from "@/lib/layer-store";
import VideoTranscription from "./transcription";
import SmartCrop from "./smart-crop";

export default function VideoTools() {
  const activeLayer = useLayerStore((state) => state.activeLayer);

  if (activeLayer.resourceType === "video")
    return (
      <>
        <VideoTranscription />
        <SmartCrop />
      </>
    );
}
