"use client";
import Editor from "@/components/editor";
import { ImageStore } from "@/lib/image-store";

export default function Home() {
  return (
    <ImageStore.Provider initialValue={{ generating: false }}>
      <main>
        <Editor />
      </main>
    </ImageStore.Provider>
  );
}
