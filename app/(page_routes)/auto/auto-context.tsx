"use client";

import { useCallback, useMemo, useState } from "react";
import { carPresets } from "./cars";
import type { CarPresetId } from "./cars";
import type {
  AccessoryId,
  PaintId,
  CarParams,
  CarDesignSchema,
  RenderingConfig,
} from "./auto-types";
import { accessories } from "./auto-types";
import { computeCarMetrics, type CarMetrics } from "./auto-math";

// =====================================================
// IMPROVED: useCarConfigurator
// Now ready for high-quality realistic 3D rendering
// =====================================================

export interface UseCarConfiguratorOptions {
  initialAccessories?: AccessoryId[];
  initialPaint?: PaintId;
  initialPreset?: CarPresetId;
  initialQuality?: RenderingConfig["quality"];
}

export function useCarConfigurator(options: UseCarConfiguratorOptions = {}) {
  const {
    initialAccessories = ["leds"],
    initialPaint = "white",
    initialPreset = "corollaSedan",
    initialQuality = "high",
  } = options;

  // === Core State ===
  const [selectedIds, setSelectedIds] = useState<AccessoryId[]>(initialAccessories);
  const [paint, setPaint] = useState<PaintId>(initialPaint);
  const [withInstall, setWithInstall] = useState(true);
  const [currentPreset, setCurrentPreset] = useState<CarPresetId>(initialPreset);
  const [quality, setQuality] = useState<RenderingConfig["quality"]>(initialQuality);

  // === Derived Data ===
  const preset = useMemo(() => carPresets[currentPreset], [currentPreset]);
  const params: CarParams = preset.params;
  const designSchema: CarDesignSchema | undefined = preset.designSchema;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedAccessories = useMemo(
    () => accessories.filter((item) => selectedSet.has(item.id)),
    [selectedSet]
  );

  // === Financial Calculations ===
  const partsTotal = useMemo(
    () => selectedAccessories.reduce((sum, item) => sum + item.price, 0),
    [selectedAccessories]
  );

  const installTotal = useMemo(
    () => (withInstall ? selectedAccessories.reduce((sum, item) => sum + item.install, 0) : 0),
    [selectedAccessories, withInstall]
  );

  const total = partsTotal + installTotal;

  // === 3D Metrics (for positioning, curves, wheels, lights) ===
  const metrics: CarMetrics = useMemo(() => {
    return computeCarMetrics(params, designSchema);
  }, [params, designSchema]);

  // === Rendering Configuration (for realistic game/cinematic look) ===
  const renderingConfig: RenderingConfig = useMemo(() => {
    const base: RenderingConfig = {
      quality,
      paintQuality: quality === "cinematic" || quality === "ultra" ? "showroom" : "premium",
      useClearcoat: true,
      useAnisotropy: quality !== "low",
      useIridescence: quality === "cinematic" || quality === "ultra",
      envMapIntensity: quality === "low" ? 0.6 : quality === "medium" ? 0.85 : 1.1,
      toneMapping: quality === "cinematic" || quality === "ultra" ? "ACESFilmic" : "Reinhard",
      toneMappingExposure: quality === "low" ? 0.9 : 1.1,
      shadowMapSize: quality === "low" ? 512 : quality === "medium" ? 1024 : 2048,
      receiveShadows: quality !== "low",
      castShadows: true,
      bloom: quality !== "low",
      bloomStrength: quality === "ultra" ? 0.6 : 0.35,
      bloomThreshold: 0.85,
      ssr: quality === "cinematic" || quality === "ultra",
    };

    return base;
  }, [quality]);

  // === Actions ===
  const toggleAccessory = useCallback((id: AccessoryId) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const changePreset = useCallback((preset: CarPresetId) => {
    setCurrentPreset(preset);
  }, []);

  const changeQuality = useCallback((newQuality: RenderingConfig["quality"]) => {
    setQuality(newQuality);
  }, []);

  const resetToDefault = useCallback(() => {
    setSelectedIds(initialAccessories);
    setPaint(initialPaint);
    setWithInstall(true);
    setCurrentPreset(initialPreset);
    setQuality(initialQuality);
  }, [initialAccessories, initialPaint, initialPreset, initialQuality]);

  return {
    // === State ===
    params,
    currentPreset,
    paint,
    withInstall,
    quality,
    selectedSet,
    selectedAccessories,

    // === Financial ===
    partsTotal,
    installTotal,
    total,

    // === 3D Ready ===
    metrics,
    designSchema,
    renderingConfig,

    // === Actions ===
    setPaint,
    setWithInstall,
    toggleAccessory,
    changePreset,
    changeQuality,
    setSelectedIds,
    resetToDefault,
  };
}

export type UseCarConfiguratorReturn = ReturnType<typeof useCarConfigurator>;
