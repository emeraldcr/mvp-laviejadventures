import type { CarDesignSchema } from "../../../auto-types";
import { corollaSchemaCore } from "./schema-core";
import { corollaSchemaExterior } from "./schema-exterior";
import { corollaSchemaInterior } from "./schema-interior";
import { corollaSchemaShape } from "./schema-shape";

export const carDesignSchema = {
  ...corollaSchemaCore,
  ...corollaSchemaShape,
  ...corollaSchemaExterior,
  ...corollaSchemaInterior,
} satisfies CarDesignSchema;

export const corollaDesignSchema = carDesignSchema;
