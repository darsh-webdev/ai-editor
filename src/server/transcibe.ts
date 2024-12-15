"use server";
import { actionClient } from "@/lib/safe-action";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import z from "zod";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ztranscriptionSchema = z.object({
  publicId: z.string(),
});

async function checkTransciptionStatus(publicId: string): Promise<string> {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    });
    if (
      result.info &&
      result.info.raw_convert &&
      result.info.raw_convert.google_speech
    ) {
      return result.info.raw_convert.google_speech.status;
    }
    return "pending";
  } catch (error) {
    throw new Error("Failed to check transccription status");
  }
}

function generateSubtitledVideoUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      {
        overlay: {
          resourcetype: "subtitle",
          public_id: `${publicId}.transcript`,
        },
      },
      {
        flags: "layer_apply",
      },
    ],
  });
}

export const initiateTranscription = actionClient
  .schema(ztranscriptionSchema)
  .action(async ({ parsedInput: { publicId } }) => {
    try {
      await cloudinary.api.update(publicId, {
        resource_type: "video",
        raw_convert: "google_speech",
      });
      const maxAttempts = 40;
      const delay = 1000;
      let status = "pending";

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        status = await checkTransciptionStatus(publicId);
        console.log(`Attempt ${attempt + 1} - Transcription Status: ${status}`);

        if (status === "complete") {
          const subtitledVideoUrl = generateSubtitledVideoUrl(publicId);
          return {
            success: "Transcription completed",
            subtitledVideoUrl,
          };
        } else if (status === "failed") {
          return { error: "Transcription failed" };
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return { error: "Transcription timed out!" };
    } catch (error) {
      console.log("🚀 ~ .action ~ error:", error);
      return { error: "Error initiating transcription" };
    }
  });
