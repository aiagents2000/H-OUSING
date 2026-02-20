"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type DoorState = "idle" | "opening" | "opened";

interface DoorContextValue {
  doorState: DoorState;
  handleDoorOpen: () => void;
}

const DoorContext = createContext<DoorContextValue | null>(null);

export function DoorProvider({ children }: { children: ReactNode }) {
  const td = useTranslations("door");
  const [doorState, setDoorState] = useState<DoorState>("idle");

  const handleDoorOpen = useCallback(() => {
    if (doorState !== "idle") return;
    setDoorState("opening");

    // TODO: Connect to control room API
    setTimeout(() => {
      setDoorState("opened");
      toast.success(td("opened"), { description: td("openedDesc") });
      setTimeout(() => setDoorState("idle"), 3000);
    }, 1500);
  }, [doorState, td]);

  return (
    <DoorContext.Provider value={{ doorState, handleDoorOpen }}>
      {children}
    </DoorContext.Provider>
  );
}

export function useDoorOpen() {
  const context = useContext(DoorContext);
  if (!context) {
    throw new Error("useDoorOpen must be used within a DoorProvider");
  }
  return context;
}
