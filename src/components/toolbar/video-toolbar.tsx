import { useLayerStore } from "@/lib/layer-store";
import VideoTranscription from "./transcription";

export default function VideoTools() {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  console.log("🚀 ~ VideoTools ~ activeLayer:", activeLayer.transcriptionURL);

  if (activeLayer.resourceType === "video")
    return (
      <>
        <VideoTranscription />
      </>
    );
}
