import type {
  BlockoutMaterials,
  BlockoutRenderMetrics,
  CarBlockoutConfig,
  GeometryBuilderConfig,
  SourcePoint2,
  SourcePoint3,
} from "./blockout-types";

type BlockoutDimensionsInput = {
  overallLength: number;
  overallWidth: number;
  visualHeight: number;
  wheelbase: number;
  frontOverhang: number;
  rearOverhang: number;
};

type BuilderOverrides = Partial<Omit<GeometryBuilderConfig, "frontBumper">> & {
  frontBumper?: Partial<GeometryBuilderConfig["frontBumper"]>;
};

type MaterialOverrides = Partial<{
  [Key in keyof BlockoutMaterials]: Partial<BlockoutMaterials[Key]>;
}>;

type CreateScaledBlockoutConfigOptions = {
  base: CarBlockoutConfig;
  dimensionsM: CarBlockoutConfig["dimensionsM"];
  materialOverrides?: MaterialOverrides;
  builderOverrides?: BuilderOverrides;
  zBiasMm?: number;
};

export function createBlockoutDimensionsM({
  overallLength,
  overallWidth,
  visualHeight,
  wheelbase,
  frontOverhang,
  rearOverhang,
}: BlockoutDimensionsInput): CarBlockoutConfig["dimensionsM"] {
  return {
    overallLength,
    overallWidth,
    visualHeight,
    wheelbase,
    frontOverhang,
    rearOverhang,
    frontBumperX: -overallLength / 2,
    rearBumperX: overallLength / 2,
    frontAxleX: -wheelbase / 2,
    rearAxleX: wheelbase / 2,
    halfWidth: overallWidth / 2,
  };
}

export function createScaledBlockoutConfig({
  base,
  dimensionsM,
  materialOverrides,
  builderOverrides,
  zBiasMm = 0,
}: CreateScaledBlockoutConfigOptions): CarBlockoutConfig {
  const baseFrame = getFrame(base.dimensionsM);
  const targetFrame = getFrame(dimensionsM);
  const xSizeScale = targetFrame.wheelbase / baseFrame.wheelbase;
  const yScale = targetFrame.width / baseFrame.width;
  const zScale = targetFrame.height / baseFrame.height;
  const detailScale = (xSizeScale + yScale + zScale) / 3;
  const wheelScale = (yScale + zScale) / 2;
  const scaleX = (sourceX: number) => scaleSegmentedX(sourceX, baseFrame, targetFrame);
  const scaleZ = (sourceZ: number) => sourceZ * zScale + zBiasMm;
  const scalePoint3 = (point: SourcePoint3): SourcePoint3 => ({
    x: scaleX(point.x),
    y: point.y * yScale,
    z: scaleZ(point.z),
  });
  const scalePoint2 = (point: SourcePoint2): SourcePoint2 => ({
    x: scaleX(point.x),
    z: scaleZ(point.z),
  });
  const scaleSize = (size: { x: number; y: number; z: number }) => ({
    x: size.x * xSizeScale,
    y: size.y * yScale,
    z: size.z * zScale,
  });
  const baseScene = base.sceneMm;

  return {
    dimensionsM,
    materials: mergeMaterials(base.materials, materialOverrides),
    geometryMm: {
      mainBodyStations: base.geometryMm.mainBodyStations.map((station) => ({
        x: scaleX(station.x),
        topZ: scaleZ(station.topZ),
        bottomZ: scaleZ(station.bottomZ),
        halfWidth: station.halfWidth * yScale,
      })),
      hoodStations: base.geometryMm.hoodStations.map((station) => ({
        ...scalePoint2(station),
        halfWidth: station.halfWidth * yScale,
      })),
      trunkStations: base.geometryMm.trunkStations.map((station) => ({
        ...scalePoint2(station),
        halfWidth: station.halfWidth * yScale,
      })),
      roofStations: base.geometryMm.roofStations.map((station) => ({
        ...scalePoint2(station),
        halfWidth: station.halfWidth * yScale,
      })),
      frontBumperStations: base.geometryMm.frontBumperStations.map((station) => ({
        ...scalePoint2(station),
        halfWidth: station.halfWidth * yScale,
      })),
      rearBumperStations: base.geometryMm.rearBumperStations.map((station) => ({
        ...scalePoint2(station),
        halfWidth: station.halfWidth * yScale,
      })),
      wheelArchCentersX: base.geometryMm.wheelArchCentersX.map(scaleX),
      wheelCenterZ: scaleZ(base.geometryMm.wheelCenterZ),
      wheelArchRadius: base.geometryMm.wheelArchRadius * wheelScale,
    },
    sceneMm: {
      wheels: {
        radius: baseScene.wheels.radius * wheelScale,
        width: baseScene.wheels.width * yScale,
        centers: baseScene.wheels.centers.map(scalePoint3),
      },
      glass: {
        windshield: scalePointRecord(baseScene.glass.windshield, scalePoint3),
        rearGlass: scalePointRecord(baseScene.glass.rearGlass, scalePoint3),
        sideWindows: baseScene.glass.sideWindows.map((window) => window.map(scalePoint3)),
      },
      pillars: {
        aPillar: scalePillar(baseScene.pillars.aPillar, scalePoint3, detailScale),
        bPillar: scalePillar(baseScene.pillars.bPillar, scalePoint3, detailScale),
        cPillar: scalePillar(baseScene.pillars.cPillar, scalePoint3, detailScale),
      },
      roofSeals: {
        windshieldHeader: baseScene.roofSeals.windshieldHeader.map(scalePoint3),
        rearHeader: baseScene.roofSeals.rearHeader.map(scalePoint3),
      },
      upperGrille: {
        center: scalePoint3(baseScene.upperGrille.center),
        halfWidth: baseScene.upperGrille.halfWidth * yScale,
        halfHeight: baseScene.upperGrille.halfHeight * zScale,
      },
      lowerIntake: {
        center: scalePoint3(baseScene.lowerIntake.center),
        halfTop: baseScene.lowerIntake.halfTop * yScale,
        halfBottom: baseScene.lowerIntake.halfBottom * yScale,
        halfHeight: baseScene.lowerIntake.halfHeight * zScale,
      },
      headlights: baseScene.headlights.map(scalePoint3),
      taillights: baseScene.taillights.map(scalePoint3),
      badge: {
        center: scalePoint3(baseScene.badge.center),
        halfWidth: baseScene.badge.halfWidth * yScale,
        halfHeight: baseScene.badge.halfHeight * zScale,
      },
      sideDetails: {
        render: scaleRenderMetrics(baseScene.sideDetails.render, {
          xSizeScale,
          yScale,
          zScale,
          detailScale,
        }),
        seams: baseScene.sideDetails.seams.map((seam) => ({
          x: scaleX(seam.x),
          zTop: scaleZ(seam.zTop),
          zBottom: scaleZ(seam.zBottom),
        })),
        handles: baseScene.sideDetails.handles.map(scalePoint2),
        beltline: baseScene.sideDetails.beltline.map(scalePoint2),
        doorPanels: baseScene.sideDetails.doorPanels.map((door) => ({
          ...door,
          xStart: scaleX(door.xStart),
          xEnd: scaleX(door.xEnd),
          zTopStart: scaleZ(door.zTopStart),
          zTopEnd: scaleZ(door.zTopEnd),
          zBottomStart: scaleZ(door.zBottomStart),
          zBottomEnd: scaleZ(door.zBottomEnd),
          zMidStart: scaleZ(door.zMidStart),
          zMidEnd: scaleZ(door.zMidEnd),
        })),
        windowBaseFills: baseScene.sideDetails.windowBaseFills.map((fill) => ({
          ...fill,
          lowerLeft: scalePoint2(fill.lowerLeft),
          lowerRight: scalePoint2(fill.lowerRight),
          upperLeft: scalePoint2(fill.upperLeft),
          upperRight: scalePoint2(fill.upperRight),
        })),
        mirrors: baseScene.sideDetails.mirrors.map((mirror) => ({
          base: scalePoint2(mirror.base),
          headCenter: scalePoint2(mirror.headCenter),
          headSize: scaleSize(mirror.headSize),
          stalkSize: scaleSize(mirror.stalkSize),
        })),
        wheelWells: baseScene.sideDetails.wheelWells.map((well) => ({
          x: scaleX(well.x),
          z: scaleZ(well.z),
          radius: well.radius * wheelScale,
        })),
      },
      interior: {
        frontSeats: baseScene.interior.frontSeats.map((seat) => ({
          center: scalePoint3(seat.center),
          cushionSize: scaleSize(seat.cushionSize),
          backCenter: scalePoint3(seat.backCenter),
          backSize: scaleSize(seat.backSize),
          backRotationZ: seat.backRotationZ,
        })),
        dashboard: {
          center: scalePoint3(baseScene.interior.dashboard.center),
          size: scaleSize(baseScene.interior.dashboard.size),
          topCenter: scalePoint3(baseScene.interior.dashboard.topCenter),
          topSize: scaleSize(baseScene.interior.dashboard.topSize),
        },
        steeringWheel: {
          center: scalePoint3(baseScene.interior.steeringWheel.center),
          radius: baseScene.interior.steeringWheel.radius * detailScale,
          tube: baseScene.interior.steeringWheel.tube * detailScale,
          rotationY: baseScene.interior.steeringWheel.rotationY,
          rotationZ: baseScene.interior.steeringWheel.rotationZ,
          columnCenter: scalePoint3(baseScene.interior.steeringWheel.columnCenter),
          columnSize: scaleSize(baseScene.interior.steeringWheel.columnSize),
          columnRotationZ: baseScene.interior.steeringWheel.columnRotationZ,
        },
      },
    },
    geometryBuilderConfig: mergeBuilderConfig(base.geometryBuilderConfig, builderOverrides),
  };
}

function getFrame(dimensionsM: CarBlockoutConfig["dimensionsM"]) {
  return {
    frontOverhang: dimensionsM.frontOverhang * 1000,
    rearOverhang: dimensionsM.rearOverhang * 1000,
    wheelbase: dimensionsM.wheelbase * 1000,
    width: dimensionsM.overallWidth * 1000,
    height: dimensionsM.visualHeight * 1000,
  };
}

function scaleSegmentedX(
  sourceX: number,
  baseFrame: ReturnType<typeof getFrame>,
  targetFrame: ReturnType<typeof getFrame>
) {
  if (sourceX <= 0) {
    return sourceX * (targetFrame.frontOverhang / baseFrame.frontOverhang);
  }

  if (sourceX >= baseFrame.wheelbase) {
    return targetFrame.wheelbase + (sourceX - baseFrame.wheelbase) * (targetFrame.rearOverhang / baseFrame.rearOverhang);
  }

  return sourceX * (targetFrame.wheelbase / baseFrame.wheelbase);
}

function mergeMaterials(base: BlockoutMaterials, overrides: MaterialOverrides = {}): BlockoutMaterials {
  return {
    body: { ...base.body, ...overrides.body },
    glass: { ...base.glass, ...overrides.glass },
    tire: { ...base.tire, ...overrides.tire },
    rim: { ...base.rim, ...overrides.rim },
    sportRim: { ...base.sportRim, ...overrides.sportRim },
    wheelCenter: { ...base.wheelCenter, ...overrides.wheelCenter },
    wheelSpoke: { ...base.wheelSpoke, ...overrides.wheelSpoke },
    sportWheelSpoke: { ...base.sportWheelSpoke, ...overrides.sportWheelSpoke },
    wheelWell: { ...base.wheelWell, ...overrides.wheelWell },
    interiorFabricDark: { ...base.interiorFabricDark, ...overrides.interiorFabricDark },
    interiorPlasticDark: { ...base.interiorPlasticDark, ...overrides.interiorPlasticDark },
    interiorAccent: { ...base.interiorAccent, ...overrides.interiorAccent },
    chrome: { ...base.chrome, ...overrides.chrome },
  };
}

function mergeBuilderConfig(
  base: GeometryBuilderConfig,
  overrides: BuilderOverrides = {}
): GeometryBuilderConfig {
  return {
    ...base,
    ...overrides,
    frontBumper: {
      ...base.frontBumper,
      ...overrides.frontBumper,
    },
  };
}

function scalePointRecord<T extends Record<string, SourcePoint3>>(
  record: T,
  scalePoint: (point: SourcePoint3) => SourcePoint3
): T {
  return Object.fromEntries(
    Object.entries(record).map(([key, point]) => [key, scalePoint(point)])
  ) as T;
}

function scalePillar(
  pillar: { base: SourcePoint3; top: SourcePoint3; thickness: number },
  scalePoint: (point: SourcePoint3) => SourcePoint3,
  detailScale: number
) {
  return {
    base: scalePoint(pillar.base),
    top: scalePoint(pillar.top),
    thickness: pillar.thickness * detailScale,
  };
}

function scaleRenderMetrics(
  render: BlockoutRenderMetrics,
  scale: {
    xSizeScale: number;
    yScale: number;
    zScale: number;
    detailScale: number;
  }
): BlockoutRenderMetrics {
  return {
    seamOutsetMm: render.seamOutsetMm * scale.yScale,
    handleOutsetMm: render.handleOutsetMm * scale.yScale,
    beltlineOutsetMm: render.beltlineOutsetMm * scale.yScale,
    seamWidthMm: render.seamWidthMm * scale.detailScale,
    seamDepthMm: render.seamDepthMm * scale.yScale,
    doorFrameOutsetMm: render.doorFrameOutsetMm * scale.yScale,
    doorFrameHeightMm: render.doorFrameHeightMm * scale.zScale,
    doorFrameDepthMm: render.doorFrameDepthMm * scale.yScale,
    doorMidlineOutsetMm: render.doorMidlineOutsetMm * scale.yScale,
    doorMidlineHeightMm: render.doorMidlineHeightMm * scale.zScale,
    doorMidlineDepthMm: render.doorMidlineDepthMm * scale.yScale,
    handleLengthMm: render.handleLengthMm * scale.xSizeScale,
    handleHeightMm: render.handleHeightMm * scale.zScale,
    handleDepthMm: render.handleDepthMm * scale.yScale,
    beltlineHeightMm: render.beltlineHeightMm * scale.zScale,
    beltlineDepthMm: render.beltlineDepthMm * scale.yScale,
    windowBaseFillOutsetMm: render.windowBaseFillOutsetMm * scale.yScale,
    windowFrameHeightMm: render.windowFrameHeightMm * scale.zScale,
    windowFrameDepthMm: render.windowFrameDepthMm * scale.yScale,
    fenderOutsetMm: render.fenderOutsetMm * scale.yScale,
    fenderLipTubeMm: render.fenderLipTubeMm * scale.detailScale,
    fenderArcRadians: render.fenderArcRadians,
    mirrorHeadOutsetMm: render.mirrorHeadOutsetMm * scale.yScale,
    mirrorStalkOutsetMm: render.mirrorStalkOutsetMm * scale.yScale,
    wheelWellInsetMm: render.wheelWellInsetMm * scale.yScale,
  };
}
