"use client";

import dynamic from "next/dynamic";

const DominoScene = dynamic(() => import("./DominoScene"), { ssr: false });

export default function DominoSceneWrapper() {
  return <DominoScene />;
}
