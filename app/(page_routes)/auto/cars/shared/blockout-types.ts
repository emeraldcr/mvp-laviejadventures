import type {
  CarDesignSchema,
  CarPreset,
  MaterialOptions,
  VehicleBodyStyle,
} from "../../auto-types";

export type SourcePoint3 = {
  x: number;
  y: number;
  z: number;
};

export type SourcePoint2 = {
  x: number;
  z: number;
};

export type BodyStation = {
  x: number;
  topZ: number;
  bottomZ: number;
  halfWidth: number;
};

export type PanelStation = SourcePoint2 & {
  halfWidth: number;
};

export type DoorPanel = {
  id: string;
  xStart: number;
  xEnd: number;
  zTopStart: number;
  zTopEnd: number;
  zBottomStart: number;
  zBottomEnd: number;
  zMidStart: number;
  zMidEnd: number;
};

export type WindowBaseFill = {
  id: string;
  lowerLeft: SourcePoint2;
  lowerRight: SourcePoint2;
  upperLeft: SourcePoint2;
  upperRight: SourcePoint2;
};

export type BlockoutRenderMetrics = {
  seamOutsetMm: number;
  handleOutsetMm: number;
  beltlineOutsetMm: number;
  seamWidthMm: number;
  seamDepthMm: number;
  doorFrameOutsetMm: number;
  doorFrameHeightMm: number;
  doorFrameDepthMm: number;
  doorMidlineOutsetMm: number;
  doorMidlineHeightMm: number;
  doorMidlineDepthMm: number;
  handleLengthMm: number;
  handleHeightMm: number;
  handleDepthMm: number;
  beltlineHeightMm: number;
  beltlineDepthMm: number;
  windowBaseFillOutsetMm: number;
  windowFrameHeightMm: number;
  windowFrameDepthMm: number;
  fenderOutsetMm: number;
  fenderLipTubeMm: number;
  fenderArcRadians: number;
  mirrorHeadOutsetMm: number;
  mirrorStalkOutsetMm: number;
  wheelWellInsetMm: number;
};

export type GeometryBuilderConfig = {
  panelFactors: readonly number[];
  faceFactors: readonly number[];
  bodySideInsetMm: number;
  bodyArchMidMinZ: number;
  bodyArchMidBaseZ: number;
  bodyArchTopGapMm: number;
  bodyArchMidLiftMm: number;
  defaultBumperCrownMm: number;
  defaultBumperEdgeDropMm: number;
  hoodCrownMm: number;
  hoodEdgeDropMm: number;
  hoodSideDropMm: number;
  hoodFrontDropMm: number;
  hoodRearDropMm: number;
  trunkCrownMm: number;
  trunkEdgeDropMm: number;
  trunkSideDropMm: number;
  trunkFrontDropMm: number;
  trunkRearDropMm: number;
  roofCrownMm: number;
  roofEdgeDropMm: number;
  roofSideDropMm: number;
  roofFrontDropMm: number;
  roofRearDropMm: number;
  frontBumper: {
    cornerRetreatMm: number;
    topShoulderSoftnessMm: number;
    bottomShoulderSoftnessMm: number;
    middleShoulderSoftnessMm: number;
    crownMm: number;
    edgeDropMm: number;
  };
};

export type BlockoutGeometryMm = {
  mainBodyStations: readonly BodyStation[];
  hoodStations: readonly PanelStation[];
  trunkStations: readonly PanelStation[];
  roofStations: readonly PanelStation[];
  frontBumperStations: readonly PanelStation[];
  rearBumperStations: readonly PanelStation[];
  wheelArchCentersX: readonly number[];
  wheelCenterZ: number;
  wheelArchRadius: number;
};

export type BlockoutMaterials = {
  body: MaterialOptions;
  glass: MaterialOptions;
  tire: MaterialOptions;
  rim: MaterialOptions;
  sportRim: MaterialOptions;
  wheelCenter: MaterialOptions;
  wheelSpoke: MaterialOptions;
  sportWheelSpoke: MaterialOptions;
  wheelWell: MaterialOptions;
  interiorFabricDark: MaterialOptions;
  interiorPlasticDark: MaterialOptions;
  interiorAccent: MaterialOptions;
  chrome: MaterialOptions;
};

export type BlockoutSceneMm = {
  wheels: {
    radius: number;
    width: number;
    centers: readonly SourcePoint3[];
  };
  glass: {
    windshield: Record<"lowerLeft" | "lowerRight" | "upperLeft" | "upperRight", SourcePoint3>;
    rearGlass: Record<"lowerLeft" | "lowerRight" | "upperLeft" | "upperRight", SourcePoint3>;
    sideWindows: readonly (readonly SourcePoint3[])[];
  };
  pillars: Record<"aPillar" | "bPillar" | "cPillar", {
    base: SourcePoint3;
    top: SourcePoint3;
    thickness: number;
  }>;
  roofSeals: {
    windshieldHeader: readonly SourcePoint3[];
    rearHeader: readonly SourcePoint3[];
  };
  upperGrille: { center: SourcePoint3; halfWidth: number; halfHeight: number };
  lowerIntake: { center: SourcePoint3; halfTop: number; halfBottom: number; halfHeight: number };
  headlights: readonly SourcePoint3[];
  taillights: readonly SourcePoint3[];
  badge: { center: SourcePoint3; halfWidth: number; halfHeight: number };
  sideDetails: {
    render: BlockoutRenderMetrics;
    seams: readonly { x: number; zTop: number; zBottom: number }[];
    handles: readonly SourcePoint2[];
    beltline: readonly SourcePoint2[];
    doorPanels: readonly DoorPanel[];
    windowBaseFills: readonly WindowBaseFill[];
    mirrors: readonly {
      base: SourcePoint2;
      headCenter: SourcePoint2;
      headSize: { x: number; y: number; z: number };
      stalkSize: { x: number; y: number; z: number };
    }[];
    wheelWells: readonly { x: number; z: number; radius: number }[];
  };
  interior: {
    frontSeats: readonly {
      center: SourcePoint3;
      cushionSize: { x: number; y: number; z: number };
      backCenter: SourcePoint3;
      backSize: { x: number; y: number; z: number };
      backRotationZ: number;
    }[];
    dashboard: {
      center: SourcePoint3;
      size: { x: number; y: number; z: number };
      topCenter: SourcePoint3;
      topSize: { x: number; y: number; z: number };
    };
    steeringWheel: {
      center: SourcePoint3;
      radius: number;
      tube: number;
      rotationY: number;
      rotationZ: number;
      columnCenter: SourcePoint3;
      columnSize: { x: number; y: number; z: number };
      columnRotationZ: number;
    };
  };
};

export type CarBlockoutConfig = {
  dimensionsM: {
    overallLength: number;
    overallWidth: number;
    visualHeight: number;
    wheelbase: number;
    frontOverhang: number;
    rearOverhang: number;
    frontBumperX: number;
    rearBumperX: number;
    frontAxleX: number;
    rearAxleX: number;
    halfWidth: number;
  };
  materials: BlockoutMaterials;
  geometryMm: BlockoutGeometryMm;
  sceneMm: BlockoutSceneMm;
  geometryBuilderConfig: GeometryBuilderConfig;
  renderProfile?: {
    roofOverlay?: {
      material: MaterialOptions;
      verticalLiftMm?: number;
    };
  };
};

export type BlockoutVisualControls = {
  materials: {
    body: MaterialOptions;
    glass: MaterialOptions;
    tire: MaterialOptions;
    clearLens: MaterialOptions;
    redLens: MaterialOptions;
    blackTrim: MaterialOptions;
    glossBlack: MaterialOptions;
    matteBlack: MaterialOptions;
  };
  motion: {
    rotation: readonly [number, number, number];
  };
};

export type RenderableCarPreset = CarPreset & {
  params: CarPreset["params"] & { bodyStyle?: VehicleBodyStyle };
  designSchema: CarDesignSchema;
  visualControls: BlockoutVisualControls;
  blockoutConfig: CarBlockoutConfig;
  blockoutStyle: VehicleBodyStyle;
};
