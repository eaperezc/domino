"use client";

import { useState, useCallback } from "react";
import type { Tile } from "./engine/types";

export interface DragState {
  tile: Tile | null;
  sourceIndex: number | null;
}

const EMPTY: DragState = { tile: null, sourceIndex: null };

export function useDragDrop() {
  const [drag, setDrag] = useState<DragState>(EMPTY);

  const startDrag = useCallback((tile: Tile, sourceIndex: number) => {
    setDrag({ tile, sourceIndex });
  }, []);

  const resetDrag = useCallback(() => {
    setDrag(EMPTY);
  }, []);

  return { drag, startDrag, resetDrag };
}
