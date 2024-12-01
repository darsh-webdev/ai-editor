import { uploadImage } from "@/server/upload-image";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

const UploadImage = () => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/png": [".png"],
      "image/jpg": [".jpg"],
      "image/webp": [".webp"],
      "image/jpeg": [".jpeg"],
    },
    onDrop: async (acceptedFiles, fileRejections) => {
      if (acceptedFiles.length) {
        const formData = new FormData();
        formData.append("image", acceptedFiles[0]);
        const objUrl = URL.createObjectURL(acceptedFiles[0]);

        //TODO: state management stuff to 1. Create Layers, 2. Set the active layer, 3. set the image as active layer

        const res = await uploadImage({ image: formData });
        console.log("🚀 ~ onDrop: ~ res:", res);
      }
    },
  });
  return (
    <Card
      className={cn(
        "hover:cursor-pointer hover:bg-secondary hover:border-primary transition-all ease-in-out",
        `${isDragActive ? "animate-pulse border-primary bg-secondary" : ""}`
      )}
      {...getRootProps()}
    >
      <CardContent className="flex flex-col h-full items-center justify-center px-2 py-24 text-xs">
        <input {...getInputProps()} type="text" />
        <div className="flex items-center justify-center flex-col gap-2">
          <p className="text-muted-foreground text-2xl">
            {isDragActive
              ? "Drop your image here"
              : "Start by uploading an image"}
          </p>
          <p className="text-muted-foreground">
            Supported formats .jpeg .jpg .png .webp
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadImage;
