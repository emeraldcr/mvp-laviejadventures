import * as THREE from 'three';

const boxGeometryCache = new Map<string, THREE.BoxGeometry>();
const planeGeometryCache = new Map<string, THREE.PlaneGeometry>();
const sphereGeometryCache = new Map<string, THREE.SphereGeometry>();
const standardMaterialCache = new Map<string, THREE.MeshStandardMaterial>();
const basicMaterialCache = new Map<string, THREE.MeshBasicMaterial>();

const keyOf = (values: Array<string | number | boolean | undefined>) => values.join('|');

export function getBoxGeometry(width: number, height: number, depth: number) {
  const key = keyOf([width, height, depth]);
  let geometry = boxGeometryCache.get(key);
  if (!geometry) {
    geometry = new THREE.BoxGeometry(width, height, depth);
    boxGeometryCache.set(key, geometry);
  }
  return geometry;
}

export function getPlaneGeometry(width: number, height: number) {
  const key = keyOf([width, height]);
  let geometry = planeGeometryCache.get(key);
  if (!geometry) {
    geometry = new THREE.PlaneGeometry(width, height);
    planeGeometryCache.set(key, geometry);
  }
  return geometry;
}

export function getSphereGeometry(radius: number, widthSegments: number, heightSegments: number) {
  const key = keyOf([radius, widthSegments, heightSegments]);
  let geometry = sphereGeometryCache.get(key);
  if (!geometry) {
    geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    sphereGeometryCache.set(key, geometry);
  }
  return geometry;
}

export function getStandardMaterial({
  color,
  emissive,
  emissiveIntensity = 0,
  roughness = 1,
  metalness = 0,
  transparent = false,
  opacity = 1,
}: {
  color: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
}) {
  const key = keyOf([color.toString(), emissive?.toString(), emissiveIntensity, roughness, metalness, transparent, opacity]);
  let material = standardMaterialCache.get(key);
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity,
      roughness,
      metalness,
      transparent,
      opacity,
    });
    standardMaterialCache.set(key, material);
  }
  return material;
}

export function getBasicMaterial({
  color,
  transparent = false,
  opacity = 1,
  side,
}: {
  color: THREE.ColorRepresentation;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
}) {
  const key = keyOf([color.toString(), transparent, opacity, side]);
  let material = basicMaterialCache.get(key);
  if (!material) {
    material = new THREE.MeshBasicMaterial({ color, transparent, opacity, side });
    basicMaterialCache.set(key, material);
  }
  return material;
}
