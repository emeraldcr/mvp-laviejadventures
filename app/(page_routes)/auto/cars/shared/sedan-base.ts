import type { CarDesignSchema } from "../../auto-types";
import { corollaDesignSchema } from "../corolla/source";
import { baseBlockoutVisualControls } from "./blockout-visuals";

type VehicleSchemaOverrides = {
  metadata?: Record<string, unknown>;
  dimensions?: Record<string, unknown>;
  silhouetteCurves?: Record<string, unknown>;
  wheelGeometry?: Record<string, unknown>;
};

export const baseSedanDesignSchema = corollaDesignSchema;
export const baseSedanVisualControls = baseBlockoutVisualControls;

export function createDerivedVehicleSchema(overrides: VehicleSchemaOverrides): CarDesignSchema {
  return {
    ...baseSedanDesignSchema,
    metadata: {
      ...baseSedanDesignSchema.metadata,
      ...overrides.metadata,
    },
    dimensions: {
      ...baseSedanDesignSchema.dimensions,
      ...overrides.dimensions,
    },
    silhouetteCurves: {
      ...baseSedanDesignSchema.silhouetteCurves,
      ...overrides.silhouetteCurves,
    },
    wheelGeometry: {
      ...baseSedanDesignSchema.wheelGeometry,
      ...overrides.wheelGeometry,
    },
  };
}

export function createDerivedSedanSchema(overrides: VehicleSchemaOverrides): CarDesignSchema {
  return createDerivedVehicleSchema(overrides);
}
