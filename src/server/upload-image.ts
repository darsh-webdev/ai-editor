"use server";

import { actionClient } from "@/lib/safe-action";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import z from "zod";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const zFormDataSchema = z.object({
  image: z.instanceof(FormData),
});

type UploadResult =
  | { success: UploadApiResponse; error?: never }
  | { error: string; success?: never };

export const uploadImage = actionClient
  .schema(zFormDataSchema)
  .action(async ({ parsedInput: { image } }): Promise<UploadResult> => {
    const formImage = image.get("image");

    if (!formImage) return { error: "No image was provided" };
    if (!image) return { error: "No image provided" };

    const file = formImage as File;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            // Removed upload_preset as getting error
            use_filename: true,
            unique_filename: false,
            filename_override: file.name,
          },
          (error, result) => {
            if (error || !result) {
              reject({ error: "Upload failed" });
            } else {
              resolve({ success: result });
            }
          }
        );
        uploadStream.end(buffer);
      });
    } catch (error) {
      console.log("🚀 ~ .action ~ error:", error);
      return { error: error as string };
    }
  });
