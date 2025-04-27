import Image from "next/image";
import React from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export default function TwoColumnImageGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <Image
          src={`${basePath}/images/grid-image/image-02.png`}
          alt=" grid"
          className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
          width={517}
          height={295}
        />
      </div>

      <div>
        <Image
          src={`${basePath}/images/grid-image/image-03.png`}
          alt=" grid"
          className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
          width={517}
          height={295}
        />
      </div>
    </div>
  );
}
