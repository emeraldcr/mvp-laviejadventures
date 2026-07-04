"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { PenalitosDirection } from "../../types";
import {
  BALL_START,
  BALL_TARGET_Y,
  DIR_X,
  GK_IDLE,
  easeInOutQuad,
  easeOutBack,
  easeOutCubic,
} from "./constants";

export type PenalitosScenePhase = "idle" | "animating" | "result";

type Props = {
  phase: PenalitosScenePhase;
  shooterChoice: PenalitosDirection | null;
  goalkeeperChoice: PenalitosDirection | null;
  outcome: "goal" | "save" | null;
  animStartMs: number | null;
  nowMs: number;
};

const GOAL_WIDTH = 3.4;
const GOAL_HEIGHT = 1.9;
const GOAL_DEPTH = 0.85;

function Field() {
  const stripes = useMemo(() => {
    const mats: THREE.Mesh[] = [];
    for (let i = -3; i <= 3; i++) {
      mats.push(
        new THREE.Mesh(
          new THREE.PlaneGeometry(2.05, 12),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? "#0f5c2e" : "#117a3a",
            roughness: 0.92,
          }),
        ),
      );
    }
    return mats;
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {stripes.map((mesh, i) => (
        <primitive
          key={i}
          object={mesh}
          position={[(i - 3) * 2.05, 0, 0]}
        />
      ))}
      {/* Penalty box */}
      <mesh position={[0, 0.01, -2.2]}>
        <planeGeometry args={[6.8, 3.6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>
      <lineSegments position={[0, 0.02, -2.2]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(6.8, 3.6)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </lineSegments>
      {/* Penalty spot */}
      <mesh position={[0, 0.03, 2.6]}>
        <circleGeometry args={[0.09, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
      {/* Penalty arc */}
      <mesh position={[-3.4, 0.02, 2.6]} rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[1.7, 1.72, 32, 1, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Goal({ netRef }: { netRef: React.RefObject<THREE.Mesh | null> }) {
  const postMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f5f5f5", metalness: 0.35, roughness: 0.25 }),
    [],
  );

  return (
    <group position={[0, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}>
      {/* Posts */}
      <mesh position={[-GOAL_WIDTH / 2, 0, 0]} material={postMat}>
        <cylinderGeometry args={[0.06, 0.06, GOAL_HEIGHT, 12]} />
      </mesh>
      <mesh position={[GOAL_WIDTH / 2, 0, 0]} material={postMat}>
        <cylinderGeometry args={[0.06, 0.06, GOAL_HEIGHT, 12]} />
      </mesh>
      <mesh position={[0, GOAL_HEIGHT / 2, 0]} rotation={[0, 0, Math.PI / 2]} material={postMat}>
        <cylinderGeometry args={[0.06, 0.06, GOAL_WIDTH + 0.12, 12]} />
      </mesh>
      {/* Net */}
      <mesh
        ref={netRef}
        position={[0, 0, -GOAL_DEPTH / 2]}
      >
        <planeGeometry args={[GOAL_WIDTH - 0.15, GOAL_HEIGHT - 0.15, 12, 8]} />
        <meshStandardMaterial
          color="#d8e8ff"
          transparent
          opacity={0.28}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Back net side panels */}
      <mesh position={[-GOAL_WIDTH / 2 + 0.05, 0, -GOAL_DEPTH / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[GOAL_DEPTH, GOAL_HEIGHT - 0.1, 4, 6]} />
        <meshStandardMaterial color="#d8e8ff" transparent opacity={0.18} wireframe side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[GOAL_WIDTH / 2 - 0.05, 0, -GOAL_DEPTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[GOAL_DEPTH, GOAL_HEIGHT - 0.1, 4, 6]} />
        <meshStandardMaterial color="#d8e8ff" transparent opacity={0.18} wireframe side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Goalkeeper({
  groupRef,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  const jersey = useMemo(() => new THREE.MeshStandardMaterial({ color: "#22c55e", roughness: 0.7 }), []);
  const pants = useMemo(() => new THREE.MeshStandardMaterial({ color: "#14532d", roughness: 0.8 }), []);
  const glove = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fbbf24", roughness: 0.4 }), []);
  const skin = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d4a574", roughness: 0.85 }), []);

  return (
    <group ref={groupRef} position={[GK_IDLE.x, GK_IDLE.y, GK_IDLE.z]}>
      {/* Body */}
      <mesh position={[0, 0.95, 0]} material={jersey}>
        <capsuleGeometry args={[0.28, 0.55, 6, 12]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.55, 0.02]} material={skin}>
        <sphereGeometry args={[0.2, 16, 16]} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.14, 0.42, 0]} material={pants}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
      </mesh>
      <mesh position={[0.14, 0.42, 0]} material={pants}>
        <capsuleGeometry args={[0.1, 0.35, 4, 8]} />
      </mesh>
      {/* Arms / gloves */}
      <mesh position={[-0.42, 1.05, 0.08]} rotation={[0, 0, 0.5]} material={glove}>
        <sphereGeometry args={[0.16, 12, 12]} />
      </mesh>
      <mesh position={[0.42, 1.05, 0.08]} rotation={[0, 0, -0.5]} material={glove}>
        <sphereGeometry args={[0.16, 12, 12]} />
      </mesh>
    </group>
  );
}

function Shooter({
  bootRef,
}: {
  bootRef: React.RefObject<THREE.Mesh | null>;
}) {
  const jersey = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f97316", roughness: 0.7 }), []);
  const pants = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.8 }), []);
  const boot = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.5 }), []);

  return (
    <group position={[0.35, 0, BALL_START.z + 0.55]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.95, 0]} material={jersey}>
        <capsuleGeometry args={[0.26, 0.5, 6, 12]} />
      </mesh>
      <mesh position={[0, 1.5, 0]} material={jersey}>
        <sphereGeometry args={[0.19, 14, 14]} />
      </mesh>
      <mesh position={[-0.13, 0.4, 0]} material={pants}>
        <capsuleGeometry args={[0.09, 0.32, 4, 8]} />
      </mesh>
      <mesh ref={bootRef} position={[0.13, 0.4, 0]} material={boot}>
        <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
      </mesh>
    </group>
  );
}

function SoccerBall({ meshRef }: { meshRef: React.RefObject<THREE.Mesh | null> }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#111111";
    const patches = [
      [64, 64, 22],
      [30, 30, 14],
      [98, 30, 14],
      [30, 98, 14],
      [98, 98, 14],
    ];
    for (const [x, y, r] of patches) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh ref={meshRef} position={[BALL_START.x, BALL_START.y, BALL_START.z]} castShadow>
      <sphereGeometry args={[0.11, 24, 24]} />
      <meshStandardMaterial map={texture} roughness={0.35} metalness={0.05} />
    </mesh>
  );
}

function GoalEffects({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={groupRef} visible={false}>
      <Sparkles count={40} scale={[2.5, 1.8, 1]} size={3} speed={2.5} color="#9dff34" />
      <Sparkles count={25} scale={[1.8, 1.2, 0.6]} size={2} speed={1.8} color="#f0b429" />
      <pointLight color="#9dff34" intensity={3} distance={4} decay={2} />
    </group>
  );
}

function SaveEffects({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={groupRef} visible={false}>
      <Sparkles count={18} scale={[1.2, 0.8, 0.8]} size={2.5} speed={3} color="#60a5fa" />
    </group>
  );
}

function StadiumBackdrop() {
  return (
    <>
      <mesh position={[0, 4, -14]} rotation={[0, 0, 0]}>
        <planeGeometry args={[40, 10]} />
        <meshBasicMaterial color="#04150a" />
      </mesh>
      <mesh position={[0, 1.2, -8]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[30, 6]} />
        <meshBasicMaterial color="#0a2410" transparent opacity={0.6} />
      </mesh>
    </>
  );
}

export function PenalitosScene({
  phase,
  shooterChoice,
  goalkeeperChoice,
  outcome,
  animStartMs,
  nowMs,
}: Props) {
  const ballRef = useRef<THREE.Mesh>(null);
  const gkRef = useRef<THREE.Group>(null);
  const bootRef = useRef<THREE.Mesh>(null);
  const netRef = useRef<THREE.Mesh>(null);
  const goalFxRef = useRef<THREE.Group>(null);
  const saveFxRef = useRef<THREE.Group>(null);
  const cameraShake = useRef(0);
  const netBulge = useRef(0);
  const kickT = useRef(0);
  const showGoalFx = useRef(false);
  const showSaveFx = useRef(false);
  const fxPos = useRef(new THREE.Vector3());
  const idleT = useRef(0);

  const isPlaying = phase === "animating" || phase === "result";

  useEffect(() => {
    if (phase === "idle") {
      kickT.current = 0;
      netBulge.current = 0;
      cameraShake.current = 0;
      showGoalFx.current = false;
      showSaveFx.current = false;
      if (goalFxRef.current) goalFxRef.current.visible = false;
      if (saveFxRef.current) saveFxRef.current.visible = false;
      if (netRef.current) {
        netRef.current.position.z = -GOAL_DEPTH / 2;
        netRef.current.scale.set(1, 1, 1);
      }
    }
  }, [phase, shooterChoice, goalkeeperChoice]);

  useFrame((state, delta) => {
    idleT.current += delta;
    const ball = ballRef.current;
    const gk = gkRef.current;
    if (!ball || !gk) return;

    // Idle bounce
    if (!isPlaying || !shooterChoice) {
      ball.position.set(
        BALL_START.x,
        BALL_START.y + Math.sin(idleT.current * 3) * 0.015,
        BALL_START.z,
      );
      ball.rotation.set(0, idleT.current * 0.4, 0);
      gk.position.set(GK_IDLE.x, GK_IDLE.y + Math.sin(idleT.current * 2) * 0.03, GK_IDLE.z);
      gk.rotation.set(0, 0, Math.sin(idleT.current * 1.5) * 0.04);
      if (bootRef.current) {
        bootRef.current.rotation.x = 0;
        bootRef.current.position.z = 0;
      }
      return;
    }

    const elapsed = animStartMs ? Math.max(0, nowMs - animStartMs) : 0;
    const t = Math.min(1, elapsed / 2000);

    // Kick wind-up (0 – 0.12)
    kickT.current = t < 0.12 ? t / 0.12 : 1;
    if (bootRef.current) {
      const legSwing = Math.sin(kickT.current * Math.PI) * 0.9;
      bootRef.current.rotation.x = legSwing;
      bootRef.current.position.z = -legSwing * 0.15;
    }

    const windupEnd = 0.12;
    const flightEnd = 0.58;
    const impactEnd = 0.78;

    const targetX = DIR_X[shooterChoice];
    const targetY = BALL_TARGET_Y[shooterChoice];
    const targetZ = -0.15;

    const gkTargetX = goalkeeperChoice ? DIR_X[goalkeeperChoice] * 0.85 : 0;
    const gkDiveY = goalkeeperChoice === "center" ? 0.55 : 0.35;
    const gkDiveZ = 0.25;
    const gkRoll = goalkeeperChoice === "left" ? 1.1 : goalkeeperChoice === "right" ? -1.1 : 0;

    if (t < windupEnd) {
      const w = easeOutCubic(t / windupEnd);
      ball.position.set(BALL_START.x, BALL_START.y + w * 0.04, BALL_START.z - w * 0.08);
      gk.position.set(GK_IDLE.x, GK_IDLE.y, GK_IDLE.z);
      gk.rotation.set(0, 0, 0);
    } else if (t < flightEnd) {
      const ft = easeOutCubic((t - windupEnd) / (flightEnd - windupEnd));
      const x = THREE.MathUtils.lerp(BALL_START.x, targetX, ft);
      const z = THREE.MathUtils.lerp(BALL_START.z, targetZ, ft);
      const arc = Math.sin(ft * Math.PI) * 0.55;
      const y = THREE.MathUtils.lerp(BALL_START.y, targetY, ft) + arc;

      ball.position.set(x, y, z);
      ball.rotation.x += delta * 14;
      ball.rotation.z += delta * 9;

      const gkT = easeOutBack(Math.min(1, (t - windupEnd) / 0.22));
      gk.position.set(
        THREE.MathUtils.lerp(GK_IDLE.x, gkTargetX, gkT),
        THREE.MathUtils.lerp(GK_IDLE.y, gkDiveY, gkT),
        THREE.MathUtils.lerp(GK_IDLE.z, gkDiveZ, gkT),
      );
      gk.rotation.set(
        goalkeeperChoice === "center" ? -gkT * 0.25 : 0,
        0,
        THREE.MathUtils.lerp(0, gkRoll, gkT),
      );
    } else {
      const it = easeInOutQuad((t - flightEnd) / (1 - flightEnd));

      if (outcome === "goal") {
        const settleX = targetX;
        const settleZ = targetZ - 0.35 - it * 0.1;
        const settleY = targetY - it * 0.15;
        ball.position.set(settleX, Math.max(0.12, settleY), settleZ);
        ball.rotation.x += delta * 3;

        netBulge.current = Math.max(netBulge.current, 1 - it * 0.3);
        if (netRef.current) {
          const bulge = netBulge.current;
          netRef.current.position.z = -GOAL_DEPTH / 2 - bulge * 0.35;
          netRef.current.scale.set(1 + bulge * 0.08, 1 + bulge * 0.12, 1);
          const mat = netRef.current.material as THREE.MeshStandardMaterial;
          mat.opacity = 0.28 + bulge * 0.15;
        }
        if (t > flightEnd + 0.02 && !showGoalFx.current) {
          showGoalFx.current = true;
          fxPos.current.set(settleX, settleY, settleZ);
          cameraShake.current = 0.35;
          if (goalFxRef.current) {
            goalFxRef.current.position.copy(fxPos.current);
            goalFxRef.current.visible = true;
          }
        }
      } else {
        // Save: ball rebounds off keeper gloves
        const contactX = gkTargetX;
        const contactZ = gkDiveZ + 0.15;
        const contactY = gkDiveY + 0.35;

        if (t < impactEnd) {
          const bt = (t - flightEnd) / (impactEnd - flightEnd);
          ball.position.set(
            THREE.MathUtils.lerp(targetX, contactX, bt),
            THREE.MathUtils.lerp(targetY, contactY, bt),
            THREE.MathUtils.lerp(targetZ, contactZ, bt),
          );
        } else {
          const rt = (t - impactEnd) / (1 - impactEnd);
          ball.position.set(
            contactX + rt * 0.6,
            contactY + rt * 0.5 + Math.sin(rt * Math.PI) * 0.25,
            contactZ + rt * 1.8,
          );
          ball.rotation.x += delta * 18;
        }

        if (t > flightEnd + 0.04 && !showSaveFx.current) {
          showSaveFx.current = true;
          fxPos.current.set(contactX, contactY, contactZ);
          if (saveFxRef.current) {
            saveFxRef.current.position.copy(fxPos.current);
            saveFxRef.current.visible = true;
          }
        }
      }

      gk.position.set(gkTargetX, gkDiveY, gkDiveZ);
      gk.rotation.set(
        goalkeeperChoice === "center" ? -0.25 : 0,
        0,
        gkRoll,
      );
    }

    // Camera shake on goal
    if (cameraShake.current > 0) {
      cameraShake.current = Math.max(0, cameraShake.current - delta * 1.8);
      const s = cameraShake.current;
      state.camera.position.x = (Math.random() - 0.5) * s * 0.12;
      state.camera.position.y = 1.75 + (Math.random() - 0.5) * s * 0.08;
    } else {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.08);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.75, 0.08);
    }
  });

  return (
    <>
      <color attach="background" args={["#061a0e"]} />
      <fog attach="fog" args={["#061a0e", 12, 28]} />

      <ambientLight intensity={0.55} color="#b8ffd0" />
      <directionalLight
        position={[4, 9, 6]}
        intensity={1.35}
        color="#fff8e8"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[-5, 4, 2]} intensity={0.35} color="#4ade80" />
      <pointLight position={[0, 3, 4]} intensity={0.4} color="#9dff34" distance={12} />

      <StadiumBackdrop />
      <Field />
      <Goal netRef={netRef} />
      <Goalkeeper groupRef={gkRef} />
      <Shooter bootRef={bootRef} />
      <SoccerBall meshRef={ballRef} />

      <GoalEffects groupRef={goalFxRef} />
      <SaveEffects groupRef={saveFxRef} />
    </>
  );
}