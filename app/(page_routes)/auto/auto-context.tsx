"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
// useCarConfigurator - Production-ready car configurator
// Supports realistic 3D rendering (R3F / Three.js), persistence,
// change tracking, and safe initialization.
// =====================================================

export interface UseCarConfiguratorOptions {
  /** Initial selected accessories */
  initialAccessories?: AccessoryId[];
  /** Initial paint color */
  initialPaint?: PaintId;
  /** Initial car preset */
  initialPreset?: CarPresetId;
  /** Initial quality level for 3D rendering */
  initialQuality?: RenderingConfig["quality"];
  /** Initial installation toggle state */
  initialWithInstall?: boolean;
  /**
   * Optional localStorage key for persisting configuration.
   * Example: "car-config-corolla-2026"
   */
  persistKey?: string;
  /** Optional callback fired whenever the configuration changes */
  onConfigChange?: (state: {
    selectedIds: AccessoryId[];
    paint: PaintId;
    withInstall: boolean;
    currentPreset: CarPresetId;
    quality: RenderingConfig["quality"];
  }) => void;
}

export function useCarConfigurator(options: UseCarConfiguratorOptions = {}) {
  const {
    initialAccessories = ["leds"],
    initialPaint = "white",
    initialPreset = "corollaSedan",
    initialQuality = "high",
    initialWithInstall = true,
    persistKey,
    onConfigChange,
  } = options;

  // === Valid accessory IDs (for sanitization) ===
  const validAccessoryIds = useMemo(
    () => new Set(accessories.map((a) => a.id)),
    []
  );

  // === Safe initial values (with validation + persistence) ===
  const getInitialState = useCallback(() => {
    // Try to restore from localStorage first
    if (persistKey && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            selectedIds: Array.isArray(parsed.selectedIds)
              ? parsed.selectedIds.filter((id: string) => validAccessoryIds.has(id as AccessoryId))
              : initialAccessories,
            paint: (parsed.paint as PaintId) || initialPaint,
            withInstall: typeof parsed.withInstall === "boolean" ? parsed.withInstall : initialWithInstall,
            currentPreset: (parsed.currentPreset as CarPresetId) || initialPreset,
            quality: (parsed.quality as RenderingConfig["quality"]) || initialQuality,
          };
        }
      } catch {
        // corrupted storage → ignore
      }
    }

    // Fallback to provided initials (with sanitization)
    const safePreset = carPresets[initialPreset] ? initialPreset : "corollaSedan";
    const safeAccessories = initialAccessories.filter((id) => validAccessoryIds.has(id));

    return {
      selectedIds: safeAccessories,
      paint: initialPaint,
      withInstall: initialWithInstall,
      currentPreset: safePreset,
      quality: initialQuality,
    };
  }, [persistKey, initialAccessories, initialPaint, initialPreset, initialQuality, initialWithInstall, validAccessoryIds]);

  const initialState = useMemo(() => getInitialState(), [getInitialState]);

  // === Core State ===
  const [selectedIds, setSelectedIds] = useState<AccessoryId[]>(initialState.selectedIds);
  const [paint, setPaint] = useState<PaintId>(initialState.paint);
  const [withInstall, setWithInstall] = useState(initialState.withInstall);
  const [currentPreset, setCurrentPreset] = useState<CarPresetId>(initialState.currentPreset);
  const [quality, setQuality] = useState<RenderingConfig["quality"]>(initialState.quality);

  // === Persist to localStorage ===
  useEffect(() => {
    if (!persistKey) return;

    const toSave = {
      selectedIds,
      paint,
      withInstall,
      currentPreset,
      quality,
    };

    try {
      localStorage.setItem(persistKey, JSON.stringify(toSave));
    } catch {
      // storage full or disabled → silently ignore
    }
  }, [selectedIds, paint, withInstall, currentPreset, quality, persistKey]);

  // === Notify parent on change ===
  useEffect(() => {
    onConfigChange?.({
      selectedIds,
      paint,
      withInstall,
      currentPreset,
      quality,
    });
  }, [selectedIds, paint, withInstall, currentPreset, quality, onConfigChange]);

  // === Derived Data ===
  const preset = useMemo(() => {
    return carPresets[currentPreset] ?? carPresets[initialPreset] ?? Object.values(carPresets)[0];
  }, [currentPreset, initialPreset]);

  const params: CarParams = preset.params;
  const designSchema: CarDesignSchema | undefined = preset.designSchema;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedAccessories = useMemo(
    () => accessories.filter((item) => selectedSet.has(item.id)),
    [selectedSet]
  );

  // === Financial Calculations ===
  const basePrice = (preset as any).basePrice ?? 0; // Add `basePrice` to your carPresets entries when ready

  const partsTotal = useMemo(
    () => selectedAccessories.reduce((sum, item) => sum + item.price, 0),
    [selectedAccessories]
  );

  const installTotal = useMemo(
    () => (withInstall ? selectedAccessories.reduce((sum, item) => sum + item.install, 0) : 0),
    [selectedAccessories, withInstall]
  );

  const total = partsTotal + installTotal;
  const grandTotal = basePrice + total;

  // === 3D Metrics & Rendering ===
  const metrics: CarMetrics = useMemo(() => {
    return computeCarMetrics(params, designSchema);
  }, [params, designSchema]);

  const renderingConfig: RenderingConfig = useMemo(() => {
    const isHigh = quality === "high" || quality === "cinematic" || quality === "ultra";
    const isCinematic = quality === "cinematic" || quality === "ultra";

    return {
      quality,
      paintQuality: isCinematic ? "showroom" : "premium",
      useClearcoat: true,
      useAnisotropy: quality !== "low",
      useIridescence: isCinematic,
      envMapIntensity: quality === "low" ? 0.6 : quality === "medium" ? 0.85 : 1.15,
      toneMapping: isCinematic ? "ACESFilmic" : "Reinhard",
      toneMappingExposure: quality === "low" ? 0.9 : 1.1,
      shadowMapSize: quality === "low" ? 512 : quality === "medium" ? 1024 : 2048,
      receiveShadows: quality !== "low",
      castShadows: true,
      bloom: quality !== "low",
      bloomStrength: quality === "ultra" ? 0.65 : 0.38,
      bloomThreshold: 0.82,
      ssr: isCinematic,
    };
  }, [quality]);

  // === Change Tracking ===
  const hasChanges = useMemo(() => {
    const initialAccessoriesSet = new Set(initialAccessories);
    const currentSet = new Set(selectedIds);

    const accessoriesChanged =
      selectedIds.length !== initialAccessories.length ||
      selectedIds.some((id) => !initialAccessoriesSet.has(id));

    return (
      accessoriesChanged ||
      paint !== initialPaint ||
      withInstall !== initialWithInstall ||
      currentPreset !== initialPreset ||
      quality !== initialQuality
    );
  }, [selectedIds, paint, withInstall, currentPreset, quality, initialAccessories, initialPaint, initialPreset, initialQuality, initialWithInstall]);

  // === Actions ===
  const toggleAccessory = useCallback((id: AccessoryId) => {
    if (!validAccessoryIds.has(id)) return;

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, [validAccessoryIds]);

  const selectAccessories = useCallback((ids: AccessoryId[]) => {
    const valid = ids.filter((id) => validAccessoryIds.has(id));
    setSelectedIds(valid);
  }, [validAccessoryIds]);

  const clearAccessories = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const changePreset = useCallback((newPreset: CarPresetId) => {
    if (carPresets[newPreset]) {
      setCurrentPreset(newPreset);
    }
  }, []);

  const changeQuality = useCallback((newQuality: RenderingConfig["quality"]) => {
    setQuality(newQuality);
  }, []);

  const resetToDefault = useCallback(() => {
    const safe = getInitialState();
    setSelectedIds(safe.selectedIds);
    setPaint(safe.paint);
    setWithInstall(safe.withInstall);
    setCurrentPreset(safe.currentPreset);
    setQuality(safe.quality);

    if (persistKey) {
      try {
        localStorage.removeItem(persistKey);
      } catch {}
    }
  }, [getInitialState, persistKey]);

  return {
    // === State ===
    params,
    preset,                    // ← full preset object (name, basePrice, etc.)
    currentPreset,
    paint,
    withInstall,
    quality,
    selectedSet,
    selectedAccessories,

    // === Pricing ===
    basePrice,
    partsTotal,
    installTotal,
    total,
    grandTotal,                // ← basePrice + accessories + install

    // === 3D / Rendering ===
    metrics,
    designSchema,
    renderingConfig,

    // === UI Helpers ===
    hasChanges,                // ← perfect for "Unsaved changes" UI
    isPersisted: !!persistKey,

    // === Actions ===
    setPaint,
    setWithInstall,
    toggleAccessory,
    selectAccessories,         // ← new: bulk select
    clearAccessories,          // ← new
    changePreset,
    changeQuality,
    setSelectedIds,
    resetToDefault,
  };
}

export type UseCarConfiguratorReturn = ReturnType<typeof useCarConfigurator>;