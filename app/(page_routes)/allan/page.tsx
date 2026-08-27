"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Float, OrbitControls, Sparkles, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Github,
  Home,
  Layers,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import {
  domainColor,
  profile,
  skills,
  stats,
  timeline,
  type Section,
  type Selection,
  type Vec3,
} from "./data";

// ───────────────────────────────────────────────
// Camera choreography
// ───────────────────────────────────────────────
const vCam = new THREE.Vector3();
const vTgt = new THREE.Vector3();
const vDir = new THREE.Vector3();

const SECTION_VIEW: Record<Section, { cam: Vec3; tgt: Vec3 }> = {
  overview: { cam: [0, 6, 22], tgt: [0, 0, 0] },
  experience: { cam: [0.5, 17, 23], tgt: [0, 0.5, 0] },
  skills: { cam: [0, 3.5, 14.5], tgt: [0, 0.5, 0] },
  contact: { cam: [2, 4, 18], tgt: [0, 0, 0] },
};

function dampVec(v: THREE.Vector3, tx: number, ty: number, tz: number, lambda: number, dt: number) {
  v.x = THREE.MathUtils.damp(v.x, tx, lambda, dt);
  v.y = THREE.MathUtils.damp(v.y, ty, lambda, dt);
  v.z = THREE.MathUtils.damp(v.z, tz, lambda, dt);
}

function Rig({ selected, section }: { selected: Selection | null; section: Section }) {
  const controls = useThree((s) => s.controls) as unknown as
    | { target: THREE.Vector3; update: () => void }
    | null;
  const camera = useThree((s) => s.camera);
  const until = useRef(0);
  const key = selected ? `${selected.type}:${selected.id}` : `section:${section}`;

  useEffect(() => {
    until.current = performance.now() + 1600;
  }, [key]);

  useFrame((_, dt) => {
    if (performance.now() > until.current) return;
    const cd = Math.min(dt, 0.05);

    if (selected) {
      const node =
        selected.type === "timeline"
          ? timeline.find((t) => t.id === selected.id)
          : skills.find((s) => s.id === selected.id);
      if (!node) return;
      vTgt.set(node.position[0], node.position[1], node.position[2]);
      vDir.copy(vTgt).normalize();
      vCam.copy(vTgt).addScaledVector(vDir, 6.5);
      vCam.y += 2.8;
    } else {
      const view = SECTION_VIEW[section];
      vCam.set(view.cam[0], view.cam[1], view.cam[2]);
      vTgt.set(view.tgt[0], view.tgt[1], view.tgt[2]);
    }

    dampVec(camera.position, vCam.x, vCam.y, vCam.z, 3.4, cd);
    if (controls) {
      dampVec(controls.target, vTgt.x, vTgt.y, vTgt.z, 3.4, cd);
      controls.update();
    }
  });

  return null;
}

// ───────────────────────────────────────────────
// Central core — Allan
// ───────────────────────────────────────────────
function CareerCore() {
  const inner = useRef<THREE.Mesh>(null!);
  const shell = useRef<THREE.Mesh>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const glow = useRef<THREE.Mesh>(null!);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    inner.current.rotation.y += dt * 0.25;
    inner.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    shell.current.rotation.y -= dt * 0.12;
    shell.current.rotation.z += dt * 0.05;
    ring.current.rotation.z += dt * 0.4;
    glow.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.04);
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={2.2} distance={28} color="#34d399" />

      <mesh>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshStandardMaterial
          color="#04140f"
          emissive="#0f766e"
          emissiveIntensity={0.7}
          roughness={0.35}
          metalness={0.6}
        />
      </mesh>

      <mesh ref={inner}>
        <icosahedronGeometry args={[1.7, 2]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#10b981"
          emissiveIntensity={1.7}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh ref={shell}>
        <dodecahedronGeometry args={[2.35, 0]} />
        <meshBasicMaterial color="#2dd4bf" wireframe transparent opacity={0.22} toneMapped={false} />
      </mesh>

      <mesh ref={ring} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[3.05, 0.02, 10, 140]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} toneMapped={false} />
      </mesh>

      <mesh ref={glow}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.06} toneMapped={false} />
      </mesh>

      <Sparkles count={60} scale={6.5} size={2.4} speed={0.3} opacity={0.5} color="#6ee7b7" />

      <Billboard position={[0, 3.5, 0]}>
        <Text
          fontSize={0.62}
          color="#ecfdf5"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#022c22"
          letterSpacing={0.16}
        >
          ALLAN ROJAS
        </Text>
        <Text
          position={[0, -0.56, 0]}
          fontSize={0.24}
          color="#5eead4"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.24}
        >
          SENIOR SOFTWARE ENGINEER
        </Text>
      </Billboard>
    </group>
  );
}

// ───────────────────────────────────────────────
// Energy thread core → node, with streaming packets
// ───────────────────────────────────────────────
function Beam({
  target,
  color,
  active,
  dim,
}: {
  target: Vec3;
  color: string;
  active: boolean;
  dim: boolean;
}) {
  const curve = useMemo(() => {
    const end = new THREE.Vector3(target[0], target[1], target[2]);
    const mid = end.clone().multiplyScalar(0.5);
    mid.y += 2.4;
    mid.multiplyScalar(0.82);
    return new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), mid, end);
  }, [target]);

  const points = useMemo(() => {
    const pts = curve.getPoints(30);
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [curve]);

  const p1 = useRef<THREE.Mesh>(null!);
  const p2 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const speed = active ? 0.45 : 0.13;
    const base = (state.clock.elapsedTime * speed) % 1;
    curve.getPoint(THREE.MathUtils.clamp(1 - base, 0, 1), p1.current.position);
    curve.getPoint(THREE.MathUtils.clamp(1 - ((base + 0.5) % 1), 0, 1), p2.current.position);
  });

  const lineOpacity = dim ? 0.05 : active ? 0.5 : 0.16;
  const pktOpacity = dim ? 0.15 : 1;

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={lineOpacity} toneMapped={false} />
      </line>
      <mesh ref={p1}>
        <sphereGeometry args={[active ? 0.075 : 0.05, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={pktOpacity} toneMapped={false} />
      </mesh>
      <mesh ref={p2}>
        <sphereGeometry args={[active ? 0.06 : 0.04, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={pktOpacity * 0.7} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ───────────────────────────────────────────────
// Skill cluster node
// ───────────────────────────────────────────────
function SkillNode({
  cluster,
  selected,
  anySelected,
  onSelect,
}: {
  cluster: (typeof skills)[number];
  selected: boolean;
  anySelected: boolean;
  onSelect: (s: Selection) => void;
}) {
  const g = useRef<THREE.Group>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const dim = anySelected && !selected;

  useEffect(() => () => void (document.body.style.cursor = "auto"), []);

  useFrame((state, dt) => {
    const cd = Math.min(dt, 0.05);
    const goal = selected ? 1.5 : hovered ? 1.25 : 1;
    g.current.scale.setScalar(THREE.MathUtils.damp(g.current.scale.x, goal, 8, cd));
    const mat = halo.current.material as THREE.MeshBasicMaterial;
    if (selected) {
      const p = (state.clock.elapsedTime * 0.8) % 1;
      halo.current.scale.setScalar(1 + p * 2.4);
      mat.opacity = 0.5 * (1 - p);
    } else {
      halo.current.scale.setScalar(1);
      mat.opacity = 0;
    }
  });

  const emissive = selected ? 2.6 : hovered ? 1.9 : 1.1;

  return (
    <group position={cluster.position}>
      <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.5}>
        <group
          ref={g}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect({ type: "skill", id: cluster.id });
          }}
        >
          <mesh>
            <octahedronGeometry args={[0.44, 0]} />
            <meshStandardMaterial
              color={cluster.color}
              emissive={cluster.color}
              emissiveIntensity={emissive}
              roughness={0.25}
              transparent
              opacity={dim ? 0.35 : 1}
            />
          </mesh>
          <mesh scale={1.12}>
            <octahedronGeometry args={[0.44, 0]} />
            <meshBasicMaterial
              color={cluster.color}
              wireframe
              transparent
              opacity={dim ? 0.12 : 0.4}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.58, 40]} />
            <meshBasicMaterial
              color={cluster.color}
              transparent
              opacity={0}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Float>

      <Billboard position={[0, 0.98, 0]}>
        <Text
          fontSize={0.2}
          color={dim ? "#64748b" : "#e2e8f0"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#020617"
        >
          {cluster.label}
        </Text>
        <Text
          position={[0, -0.26, 0]}
          fontSize={0.135}
          color={dim ? "#475569" : cluster.color}
          anchorX="center"
          anchorY="middle"
        >
          {`${cluster.items.length} tools`}
        </Text>
      </Billboard>
    </group>
  );
}

// ───────────────────────────────────────────────
// Career station node
// ───────────────────────────────────────────────
function TimelineStation({
  node,
  selected,
  anySelected,
  onSelect,
}: {
  node: (typeof timeline)[number];
  selected: boolean;
  anySelected: boolean;
  onSelect: (s: Selection) => void;
}) {
  const g = useRef<THREE.Group>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const torus = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const dim = anySelected && !selected;
  const color = domainColor[node.domain];

  useEffect(() => () => void (document.body.style.cursor = "auto"), []);

  useFrame((state, dt) => {
    const cd = Math.min(dt, 0.05);
    const goal = selected ? 1.55 : hovered ? 1.28 : 1;
    g.current.scale.setScalar(THREE.MathUtils.damp(g.current.scale.x, goal, 8, cd));
    torus.current.rotation.z += cd * 0.6;
    const mat = halo.current.material as THREE.MeshBasicMaterial;
    if (selected || node.current) {
      const p = (state.clock.elapsedTime * (selected ? 0.9 : 0.5)) % 1;
      halo.current.scale.setScalar(1 + p * (selected ? 2.6 : 1.8));
      mat.opacity = (selected ? 0.55 : 0.3) * (1 - p);
    } else {
      halo.current.scale.setScalar(1);
      mat.opacity = 0;
    }
  });

  const emissive = selected ? 2.8 : hovered ? 2 : node.current ? 1.6 : 1.1;

  return (
    <group position={node.position}>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.45}>
        <group
          ref={g}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect({ type: "timeline", id: node.id });
          }}
        >
          <mesh>
            <sphereGeometry args={[0.36, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={emissive}
              roughness={0.2}
              transparent
              opacity={dim ? 0.4 : 1}
            />
          </mesh>
          <mesh ref={torus} rotation={[Math.PI / 2.4, 0.3, 0]}>
            <torusGeometry args={[0.62, 0.028, 12, 60]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={dim ? 0.2 : 0.75}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.8, 48]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {node.current && (
            <Sparkles count={10} scale={1.7} size={2} speed={0.4} color={color} opacity={0.85} />
          )}
        </group>
      </Float>

      <Billboard position={[0, 1.08, 0]}>
        <Text
          fontSize={0.22}
          color={dim ? "#64748b" : "#f1f5f9"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#020617"
          maxWidth={4}
        >
          {node.company}
        </Text>
        <Text
          position={[0, -0.32, 0]}
          fontSize={0.145}
          color={dim ? "#475569" : color}
          anchorX="center"
          anchorY="middle"
        >
          {node.current ? "NOW" : String(node.year)}
        </Text>
      </Billboard>
    </group>
  );
}

// ───────────────────────────────────────────────
// Scene
// ───────────────────────────────────────────────
function Scene({
  selected,
  section,
  onSelect,
  reducedMotion,
}: {
  selected: Selection | null;
  section: Section;
  onSelect: (s: Selection) => void;
  reducedMotion: boolean;
}) {
  const autoRotate = !selected && section === "overview" && !reducedMotion;

  return (
    <>
      <color attach="background" args={["#04060a"]} />
      <fog attach="fog" args={["#04060a", 18, 52]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[14, 12, 8]} intensity={0.5} color="#93c5fd" />
      <pointLight position={[-14, -8, -10]} intensity={0.4} color="#f0abfc" />

      <Stars radius={95} depth={55} count={2600} factor={3.4} saturation={0} fade speed={0.55} />

      <CareerCore />

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[9.6, 0.006, 6, 200]} />
        <meshBasicMaterial color="#1e3a5f" transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {skills.map((c) => {
        const isSel = selected?.type === "skill" && selected.id === c.id;
        return (
          <Beam
            key={`b-${c.id}`}
            target={c.position}
            color={c.color}
            active={isSel}
            dim={!!selected && !isSel}
          />
        );
      })}
      {timeline.map((t) => {
        const isSel = selected?.type === "timeline" && selected.id === t.id;
        return (
          <Beam
            key={`b-${t.id}`}
            target={t.position}
            color={domainColor[t.domain]}
            active={isSel}
            dim={!!selected && !isSel}
          />
        );
      })}

      {skills.map((c) => (
        <SkillNode
          key={c.id}
          cluster={c}
          selected={selected?.type === "skill" && selected.id === c.id}
          anySelected={!!selected}
          onSelect={onSelect}
        />
      ))}
      {timeline.map((t) => (
        <TimelineStation
          key={t.id}
          node={t}
          selected={selected?.type === "timeline" && selected.id === t.id}
          anySelected={!!selected}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={4}
        maxDistance={46}
        autoRotate={autoRotate}
        autoRotateSpeed={0.22}
      />
      <Rig selected={selected} section={section} />
    </>
  );
}

// ───────────────────────────────────────────────
// HUD primitives
// ───────────────────────────────────────────────
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/70">
      {children}
    </h2>
  );
}

function MiniLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{children}</p>
  );
}

function PanelHeading({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-300">
        {icon}
      </span>
      <span className="font-[family-name:var(--font-bricolage)] text-sm font-bold text-white">
        {title}
      </span>
      {hint && <span className="ml-auto text-[10px] text-slate-500">{hint}</span>}
    </div>
  );
}

function IconButton({
  title,
  onClick,
  href,
  external,
  children,
}: {
  title: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const cls =
    "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 backdrop-blur-xl transition hover:border-emerald-400/50 hover:text-white";
  if (href) {
    return (
      <a
        href={href}
        title={title}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" title={title} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function contactIcon(kind: string) {
  if (kind === "email") return Mail;
  if (kind === "phone") return Phone;
  if (kind === "github") return Github;
  return MapPin;
}

// ───────────────────────────────────────────────
// Left dock panels
// ───────────────────────────────────────────────
function OverviewPanel() {
  return (
    <div>
      <PanelHeading icon={<Compass className="h-3.5 w-3.5" />} title="Overview" />
      <div className="space-y-2">
        {profile.summary.map((p, i) => (
          <p key={i} className="text-[12.5px] leading-relaxed text-slate-300">
            {p}
          </p>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="font-[family-name:var(--font-bricolage)] text-xl font-extrabold text-emerald-300">
              {s.value}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <MiniLabel>Education</MiniLabel>
        <p className="mt-1 text-[12px] text-slate-300">{profile.education.degree}</p>
        <p className="text-[11px] text-slate-500">
          {profile.education.school} · {profile.education.period}
        </p>
        <p className="text-[11px] text-slate-500">{profile.education.note}</p>
      </div>
      <div className="mt-3">
        <MiniLabel>Languages</MiniLabel>
        {profile.languages.map((l) => (
          <p key={l.language} className="mt-1 text-[11px] text-slate-400">
            <span className="text-slate-200">{l.language}</span> — {l.level}
          </p>
        ))}
      </div>
    </div>
  );
}

function ExperiencePanel({
  selected,
  onSelect,
}: {
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  return (
    <div>
      <PanelHeading
        icon={<Layers className="h-3.5 w-3.5" />}
        title="Experience"
        hint="7 roles · 2015 → now"
      />
      <div className="space-y-1.5">
        {[...timeline].reverse().map((t) => {
          const active = selected?.type === "timeline" && selected.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect({ type: "timeline", id: t.id })}
              className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                active
                  ? "border-emerald-400/60 bg-emerald-400/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-semibold text-slate-100">{t.company}</span>
                <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
                  {t.current ? "NOW" : t.year}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: domainColor[t.domain] }}
                />
                <span className="truncate text-[11px] text-slate-400">{t.role}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkillsPanel({
  selected,
  onSelect,
}: {
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  return (
    <div>
      <PanelHeading
        icon={<Boxes className="h-3.5 w-3.5" />}
        title="Skills"
        hint="6 clusters"
      />
      <div className="space-y-1.5">
        {skills.map((c) => {
          const active = selected?.type === "skill" && selected.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect({ type: "skill", id: c.id })}
              className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                active
                  ? "border-emerald-400/60 bg-emerald-400/10"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 truncate text-[12px] font-semibold text-slate-100">
                {c.label}
              </span>
              <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
                {c.items.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContactPanel() {
  return (
    <div>
      <PanelHeading icon={<Mail className="h-3.5 w-3.5" />} title="Contact" />
      <p className="text-[12px] text-slate-300">{profile.available}.</p>
      <div className="mt-3 space-y-1.5">
        {profile.contact.map((c) => {
          const Icon = contactIcon(c.kind);
          const body = (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-emerald-300">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                  {c.label}
                </span>
                <span className="block truncate text-[12px] text-slate-200">{c.value}</span>
              </span>
            </>
          );
          return c.href ? (
            <a
              key={c.label}
              href={c.href}
              target={c.kind === "github" ? "_blank" : undefined}
              rel={c.kind === "github" ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2.5 rounded-lg border border-white/10 p-2 transition hover:border-emerald-400/50"
            >
              {body}
            </a>
          ) : (
            <div key={c.label} className="flex items-center gap-2.5 rounded-lg border border-white/10 p-2">
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Detail panel
// ───────────────────────────────────────────────
function DetailPanel({
  selected,
  onClose,
  onCycle,
}: {
  selected: Selection;
  onClose: () => void;
  onCycle: (dir: 1 | -1) => void;
}) {
  const t = selected.type === "timeline" ? timeline.find((x) => x.id === selected.id) : undefined;
  const s = selected.type === "skill" ? skills.find((x) => x.id === selected.id) : undefined;

  return (
    <motion.aside
      key={`${selected.type}:${selected.id}`}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="pointer-events-auto absolute inset-x-3 bottom-3 z-30 max-h-[60dvh] overflow-y-auto rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-xl sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-28 sm:w-[370px]"
    >
      {t && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ borderColor: `${domainColor[t.domain]}66`, color: domainColor[t.domain] }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: domainColor[t.domain] }}
                />
                {t.domain}
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-bricolage)] text-lg font-bold leading-tight text-white">
                {t.role}
              </h3>
              <p className="text-[12px] text-slate-300">{t.company}</p>
              <p className="text-[11px] text-slate-500">
                {t.period} · {t.location}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 transition hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-3 space-y-1.5">
            {t.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-slate-300">
                <span
                  className="mt-[6px] h-1 w-1 shrink-0 rounded-full"
                  style={{ background: domainColor[t.domain] }}
                />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {t.stack.map((x) => (
              <span
                key={x}
                className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] text-slate-300"
              >
                {x}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => onCycle(-1)}
              className="flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Earlier
            </button>
            <span className="text-[10px] tabular-nums text-slate-600">
              {timeline.findIndex((x) => x.id === t.id) + 1} / {timeline.length}
            </span>
            <button
              onClick={() => onCycle(1)}
              className="flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-white"
            >
              Later <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      {s && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ borderColor: `${s.color}66`, color: s.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                Skill cluster
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-bricolage)] text-lg font-bold text-white">
                {s.label}
              </h3>
              <p className="text-[12px] text-slate-400">{s.blurb}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 transition hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.items.map((x) => (
              <span
                key={x}
                className="rounded-md border px-2 py-1 text-[11px] text-slate-200"
                style={{ borderColor: `${s.color}40`, background: `${s.color}12` }}
              >
                {x}
              </span>
            ))}
          </div>
        </>
      )}
    </motion.aside>
  );
}

function IntroOverlay() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#04060a]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="font-[family-name:var(--font-bricolage)] text-5xl font-extrabold tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(52,211,153,0.75)]"
      >
        {profile.monogram}
      </motion.div>
      <div className="mt-4 h-px w-40 overflow-hidden bg-white/10">
        <motion.div
          className="h-full w-1/3 bg-emerald-400"
          initial={{ x: "-120%" }}
          animate={{ x: "360%" }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-slate-500">
        Plotting the constellation
      </p>
    </motion.div>
  );
}

// ───────────────────────────────────────────────
// Document fallback (reduced motion / no WebGL / opt-in)
// ───────────────────────────────────────────────
function StaticView({ can3d, onLaunch3d }: { can3d: boolean; onLaunch3d: () => void }) {
  return (
    <main className="min-h-[100dvh] w-full bg-[#04060a] text-slate-200 font-[family-name:var(--font-manrope)]">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
            {profile.available}
          </span>
        </div>

        <h1 className="mt-3 font-[family-name:var(--font-bricolage)] text-4xl font-extrabold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
            Allan Rojas
          </span>
        </h1>
        <p className="mt-2 text-lg text-slate-300">{profile.title}</p>
        <p className="mt-1 text-sm text-slate-500">
          {profile.tagline} · {profile.location}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {profile.contact.map((c) => {
            const Icon = contactIcon(c.kind);
            const cls =
              "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-slate-300 transition hover:border-emerald-400/50 hover:text-white";
            return c.href ? (
              <a
                key={c.label}
                href={c.href}
                target={c.kind === "github" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={cls}
              >
                <Icon className="h-3.5 w-3.5 text-emerald-300" />
                {c.value}
              </a>
            ) : (
              <span key={c.label} className={cls}>
                <Icon className="h-3.5 w-3.5 text-emerald-300" />
                {c.value}
              </span>
            );
          })}
        </div>

        {can3d && (
          <button
            onClick={onLaunch3d}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-[13px] font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            <Compass className="h-4 w-4" /> Launch 3D constellation
          </button>
        )}

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold text-emerald-300">
                {s.value}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <SectionLabel>Profile</SectionLabel>
          <div className="mt-3 space-y-2">
            {profile.summary.map((p, i) => (
              <p key={i} className="text-[14px] leading-relaxed text-slate-300">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Trajectory</SectionLabel>
          <div className="relative mt-5 space-y-7 border-l border-white/10 pl-6">
            {[...timeline].reverse().map((t) => (
              <div key={t.id} className="relative">
                <span
                  className="absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-[#04060a]"
                  style={{ background: domainColor[t.domain] }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-[family-name:var(--font-bricolage)] text-[15px] font-bold text-white">
                    {t.role}
                  </h3>
                  <span className="text-[11px] tabular-nums text-slate-500">{t.period}</span>
                </div>
                <p className="text-[12.5px] text-slate-400">
                  {t.company} · {t.location}
                </p>
                <ul className="mt-2 space-y-1">
                  {t.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-300">
                      <span
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                        style={{ background: domainColor[t.domain] }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.stack.map((x) => (
                    <span
                      key={x}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] text-slate-400"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <SectionLabel>Constellation of skills</SectionLabel>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {skills.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <h3 className="text-[13px] font-semibold text-slate-100">{c.label}</h3>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{c.blurb}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.items.map((x) => (
                    <span
                      key={x}
                      className="rounded-md border px-1.5 py-0.5 text-[10.5px] text-slate-300"
                      style={{ borderColor: `${c.color}33`, background: `${c.color}10` }}
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <div>
            <SectionLabel>Education</SectionLabel>
            <p className="mt-2 text-[13px] text-slate-200">{profile.education.degree}</p>
            <p className="text-[12px] text-slate-500">{profile.education.school}</p>
            <p className="text-[12px] text-slate-500">
              {profile.education.period} · {profile.education.note}
            </p>
          </div>
          <div>
            <SectionLabel>Languages</SectionLabel>
            {profile.languages.map((l) => (
              <p key={l.language} className="mt-2 text-[12px] text-slate-400">
                <span className="text-slate-200">{l.language}</span> — {l.level}
              </p>
            ))}
          </div>
        </section>

        <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-6 text-[11px] text-slate-600">
          <span>{profile.name}</span>
          <Link href="/" className="transition hover:text-slate-300">
            ← laviejadventures.com
          </Link>
        </div>
      </div>
    </main>
  );
}

// ───────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────
const SECTIONS: Section[] = ["overview", "experience", "skills", "contact"];

export default function AllanPortfolio() {
  const [section, setSection] = useState<Section>("overview");
  const [selected, setSelected] = useState<Selection | null>(null);
  const [mode, setMode] = useState<"3d" | "doc">("3d");
  const [webgl, setWebgl] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    let ok = true;
    try {
      const c = document.createElement("canvas");
      ok = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      ok = false;
    }
    setWebgl(ok);
    if (!ok || prefersReduced) setMode("doc");
  }, [prefersReduced]);

  useEffect(() => {
    const id = window.setTimeout(() => setShowIntro(false), 1300);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (mode === "doc") document.body.style.cursor = "auto";
  }, [mode]);

  const cycleTimeline = useCallback((dir: 1 | -1) => {
    setSelected((prev) => {
      if (!prev || prev.type !== "timeline") {
        return { type: "timeline", id: dir === 1 ? timeline[0].id : timeline[timeline.length - 1].id };
      }
      const i = timeline.findIndex((t) => t.id === prev.id);
      const n = (i + dir + timeline.length) % timeline.length;
      return { type: "timeline", id: timeline[n].id };
    });
  }, []);

  useEffect(() => {
    if (mode !== "3d") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setSection("overview");
      } else if (e.key === "ArrowRight") {
        cycleTimeline(1);
      } else if (e.key === "ArrowLeft") {
        cycleTimeline(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, cycleTimeline]);

  const chooseSection = (s: Section) => {
    setSection(s);
    setSelected(null);
  };

  if (mode === "doc") {
    return <StaticView can3d={webgl && !prefersReduced} onLaunch3d={() => setMode("3d")} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#04060a] text-slate-100 font-[family-name:var(--font-manrope)]">
      <Canvas
        camera={{ position: [0, 16, 34], fov: 46, near: 0.1, far: 240 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene
          selected={selected}
          section={section}
          onSelect={(s) => setSelected(s)}
          reducedMotion={Boolean(prefersReduced)}
        />
      </Canvas>

      {/* atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] opacity-[0.14] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-6">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
              Available for work
            </span>
          </div>
          <h1 className="mt-1 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Allan Rojas
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Senior Software Engineer · {profile.location}
          </p>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
            {SECTIONS.map((s) => {
              const on = section === s && !selected;
              return (
                <button
                  key={s}
                  onClick={() => chooseSection(s)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition ${
                    on ? "bg-emerald-400 text-emerald-950" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-1.5">
            <IconButton title="Document view" onClick={() => setMode("doc")}>
              <Layers className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton title="GitHub" href={profile.contact[2].href} external>
              <Github className="h-3.5 w-3.5" />
            </IconButton>
            <Link
              href="/cv"
              title="Printable CV"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 backdrop-blur-xl transition hover:border-emerald-400/50 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/"
              title="Back to site"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 backdrop-blur-xl transition hover:border-emerald-400/50 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* left dock */}
      <div className="pointer-events-none absolute left-0 top-28 z-20 hidden w-[320px] px-4 sm:block sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl"
          >
            {section === "overview" && <OverviewPanel />}
            {section === "experience" && (
              <ExperiencePanel selected={selected} onSelect={setSelected} />
            )}
            {section === "skills" && <SkillsPanel selected={selected} onSelect={setSelected} />}
            {section === "contact" && <ContactPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* detail panel */}
      <AnimatePresence>
        {selected && (
          <DetailPanel
            selected={selected}
            onClose={() => setSelected(null)}
            onCycle={cycleTimeline}
          />
        )}
      </AnimatePresence>

      {/* hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 hidden justify-center sm:flex">
        <p className="rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[10.5px] text-slate-400 backdrop-blur-xl">
          Drag to orbit · Scroll to zoom · Click a node ·{" "}
          <kbd className="text-slate-300">←</kbd>/<kbd className="text-slate-300">→</kbd> timeline ·{" "}
          <kbd className="text-slate-300">Esc</kbd> reset
        </p>
      </div>

      <AnimatePresence>{showIntro && <IntroOverlay key="intro" />}</AnimatePresence>
    </div>
  );
}
