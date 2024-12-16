"use server";

import { checkImageProcessing } from "@/lib/check-processing";
import { actionClient } from "@/lib/safe-action";
import { v2 as cloudinary } from "cloudinary";
import z from "zod";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const zSmartCropSchema = z.object({
  activeVideo: z.string(),
  height: z.string(),
  aspect: z.string(),
});

export const smartCrop = actionClient
  .schema(zSmartCropSchema)
  .action(async ({ parsedInput: { activeVideo, aspect, height } }) => {
    const parts = activeVideo.split("/upload/");
    const cropUrl = `${parts[0]}/upload/ar_${aspect},c_fill,g_auto,h_${height}/${parts[1]}`;

    let isProcessed = false;
    const maxAttempts = 20;
    const delay = 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      isProcessed = await checkImageProcessing(cropUrl);
      if (isProcessed) break;

      await new Promise((resolve) => setTimeout(resolve, delay));

      if (!isProcessed) {
        throw new Error("Video processing timed out");
      }
    }
    return {
      success: cropUrl,
    };
  });
