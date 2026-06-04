import type { CarDesignSchema } from "../../auto-types";
import { corollaDesignSchema } from "../corolla/schema/schema";
import { corollaVisualControls } from "../corolla/visual";

type SedanSchemaOverrides = {
  metadata?: Record<string, unknown>;
  dimensions?: Record<string, unknown>;
  silhouetteCurves?: Record<string, unknown>;
  wheelGeometry?: Record<string, unknown>;
};

export const baseSedanDesignSchema = corollaDesignSchema;
export const baseSedanVisualControls = corollaVisualControls;

export function createDerivedSedanSchema(overrides: SedanSchemaOverrides): CarDesignSchema {
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
