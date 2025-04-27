import Image from "next/image";
import React from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export default function ResponsiveImage() {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <Image
          src={`${basePath}/images/grid-image/image-01.png`}
          alt="Cover"
          className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
          width={1054}
          height={600}
        />
      </div>
    </div>
  );
}
