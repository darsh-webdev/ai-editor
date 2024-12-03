"use client";
import React from "react";
import UploadImage from "./upload/upoad-image";
import Layers from "./layers/layers";
import { ModeToggle } from "@/components/theme/mode-toggle";

const Editor = () => {
  return (
    <div className="flex h-full ">
      <div className="py-6 px-4 basis-[240px] shrink-0">
        <div className="pb-12 text-center">
          <ModeToggle />
        </div>
      </div>
      <UploadImage />
      <Layers />
    </div>
  );
};

export default Editor;
