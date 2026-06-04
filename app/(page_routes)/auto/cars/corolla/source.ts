export const mmToM = (mm: number) => mm / 1000;

export const sourceSpecsMm = {
  length: 4638,
  widthNoMirrors: 1775,
  height: 1455,
  wheelbase: 2700,
  frontTrack: 1525,
  rearTrack: 1525,
  groundClearanceNominal: 145,
  groundClearanceMin: 140,
  groundClearanceMax: 152,
};

export const sourceDerived = {
  frontOverhang: (sourceSpecsMm.length - sourceSpecsMm.wheelbase) * 0.455,
  rearOverhang: (sourceSpecsMm.length - sourceSpecsMm.wheelbase) * 0.545,
  lengthToWidthRatio: sourceSpecsMm.length / sourceSpecsMm.widthNoMirrors,
  lengthToHeightRatio: sourceSpecsMm.length / sourceSpecsMm.height,
  wheelbaseToLengthRatio: sourceSpecsMm.wheelbase / sourceSpecsMm.length,
  halfWidth: sourceSpecsMm.widthNoMirrors / 2,
  halfFrontTrack: sourceSpecsMm.frontTrack / 2,
  halfRearTrack: sourceSpecsMm.rearTrack / 2,
};

export const xAnchorsMm = {
  frontBumper: -sourceDerived.frontOverhang,
  frontAxle: 0,
  firewallApprox: 430,
  aPillarBase: 500,
  bPillar: 1450,
  rearDoorCut: 2490,
  rearAxle: sourceSpecsMm.wheelbase,
  trunkStart: 2550,
  rearBumper: sourceSpecsMm.wheelbase + sourceDerived.rearOverhang,
};

export const zAnchorsMm = {
  ground: 0,
  rockerBottom: 210,
  rockerMid: 285,
  wheelCenter: 315,
  bumperLower: 330,
  bumperMid: 520,
  hoodFront: 740,
  hoodRear: 900,
  beltlineFront: 900,
  beltlineRear: 1030,
  windowSillFront: 890,
  windowSillRear: 930,
  trunkDeck: 1015,
  roofApex: sourceSpecsMm.height,
};

export const tire20555R16 = {
  label: "P205/55R16",
  rimDiameterIn: 16,
  tireWidthMm: 205,
  aspectRatio: 0.55,
  sidewallMm: 205 * 0.55,
  rimDiameterMm: 16 * 25.4,
  overallDiameterMm: 16 * 25.4 + 2 * (205 * 0.55),
  radiusMm: (16 * 25.4 + 2 * (205 * 0.55)) / 2,
};
