'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Pointer = { x: number; y: number };

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, u), THREE.MathUtils.lerp(c, d, u), v);
}

function fbm(x: number, y: number) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 5; i++) {
    v += a * noise2(x * f, y * f);
    f *= 2;
    a *= 0.5;
  }
  return v;
}

function heightAt(x: number, z: number) {
  const dunes =
    Math.sin(x * 0.18) * 0.55 +
    Math.cos(z * 0.14) * 0.4 +
    Math.sin((x + z) * 0.09) * 0.7;
  const detail = fbm(x * 0.12 + 2.1, z * 0.12 - 1.4) * 1.35;
  const ridge = Math.pow(Math.max(0, fbm(x * 0.05 + 8, z * 0.05) - 0.35), 1.6) * 2.4;
  const bowl = -Math.exp(-(x * x * 0.012 + (z - 2) * (z - 2) * 0.008)) * 0.85;
  return dunes * 0.55 + detail * 0.9 + ridge + bowl;
}

function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(48, 36, 140, 100);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const cLow = new THREE.Color('#9ebfb4');
    const cMid = new THREE.Color('#5f8f7f');
    const cHigh = new THREE.Color('#2c4f47');
    const cPeak = new THREE.Color('#1a3330');
    const tmp = new THREE.Color();
    const heights = new Float32Array(pos.count);
    let minH = Infinity;
    let maxH = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const h = heightAt(pos.getX(i), pos.getZ(i));
      heights[i] = h;
      minH = Math.min(minH, h);
      maxH = Math.max(maxH, h);
    }

    for (let i = 0; i < pos.count; i++) {
      const h = heights[i];
      pos.setY(i, h);
      const t = (h - minH) / Math.max(0.001, maxH - minH);
      if (t < 0.35) tmp.copy(cLow).lerp(cMid, t / 0.35);
      else if (t < 0.7) tmp.copy(cMid).lerp(cHigh, (t - 0.35) / 0.35);
      else tmp.copy(cHigh).lerp(cPeak, (t - 0.7) / 0.3);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow castShadow position={[2.2, -0.9, -2]}>
      <meshStandardMaterial vertexColors roughness={0.88} metalness={0.02} />
    </mesh>
  );
}

function Water() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    m.position.y = -0.55 + Math.sin(state.clock.elapsedTime * 0.45) * 0.015;
    (m.material as THREE.MeshStandardMaterial).opacity =
      0.42 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[1.2, -0.55, 0.8]} receiveShadow>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial
        color="#7eb0ab"
        roughness={0.18}
        metalness={0.45}
        transparent
        opacity={0.45}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

function SkyDome() {
  const geo = useMemo(() => new THREE.SphereGeometry(40, 48, 32), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color('#c5d9e8') },
          mid: { value: new THREE.Color('#e4efe9') },
          bottom: { value: new THREE.Color('#d5e4dc') },
        },
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 top;
          uniform vec3 mid;
          uniform vec3 bottom;
          varying vec3 vPos;
          void main() {
            float h = normalize(vPos).y;
            vec3 col = mix(bottom, mid, smoothstep(-0.15, 0.25, h));
            col = mix(col, top, smoothstep(0.2, 0.85, h));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  );
  return <mesh geometry={geo} material={mat} />;
}

function CameraRig({ pointer, calm }: { pointer: React.MutableRefObject<Pointer>; calm: boolean }) {
  useFrame((state) => {
    const cam = state.camera;
    const px = calm ? 0 : pointer.current.x;
    const py = calm ? 0 : pointer.current.y;
    const breathe = calm ? 0 : Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, -0.2 + px * 0.7, 0.04);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 1.55 + py * 0.3 + breathe, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 6.2 - py * 0.2, 0.04);
    cam.lookAt(2.0 + px * 0.15, 0.15, -2.4);
  });
  return null;
}

function Scene({ pointer, calm }: { pointer: React.MutableRefObject<Pointer>; calm: boolean }) {
  return (
    <>
      <color attach="background" args={['#dfeae5']} />
      <fog attach="fog" args={['#d5e3dc', 10, 32]} />
      <SkyDome />
      <mesh position={[8, 6.5, -10]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#f5f0df" toneMapped={false} />
      </mesh>
      <ambientLight intensity={0.48} />
      <hemisphereLight args={['#d7e6ef', '#5f7f72', 0.55]} />
      <directionalLight
        castShadow
        position={[6, 10, 4]}
        intensity={1.35}
        color="#fff6e8"
        shadow-mapSize={[1536, 1536]}
        shadow-camera-far={40}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.00025}
      />
      <directionalLight position={[-5, 3, -4]} intensity={0.25} color="#9eb8c9" />
      <Environment preset="dawn" environmentIntensity={0.28} />
      <Terrain />
      <Water />
      <CameraRig pointer={pointer} calm={calm} />
    </>
  );
}

type Props = {
  eventTargetRef?: React.RefObject<HTMLElement | null>;
};

/**
 * Sfondo WebGL. Il parent deve essere absolute + contain:paint.
 * Montaggio ritardato: il copy HTML pinta prima, poi arriva il canvas dietro.
 */
export default function WelcomeHeroAtmosphere({ eventTargetRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const [calm, setCalm] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const sync = () => setCalm(mq.matches || coarse.matches);
    sync();
    mq.addEventListener('change', sync);
    coarse.addEventListener('change', sync);

    // Due frame + breve delay: copy già visibile prima del WebGL
    let cancelled = false;
    let t2 = 0;
    let timeout = 0;
    const t1 = window.requestAnimationFrame(() => {
      t2 = window.requestAnimationFrame(() => {
        timeout = window.setTimeout(() => {
          if (!cancelled) setReady(true);
        }, 80);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(t1);
      window.cancelAnimationFrame(t2);
      window.clearTimeout(timeout);
      mq.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    const target = eventTargetRef?.current ?? rootRef.current?.parentElement;
    if (!target || calm) return;

    const onMove = (e: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointer.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      };
    };

    target.addEventListener('pointermove', onMove, { passive: true });
    return () => target.removeEventListener('pointermove', onMove);
  }, [calm, eventTargetRef]);

  return (
    <div ref={rootRef} className="h-full w-full bg-[#dfeae5]" aria-hidden>
      {ready && (
        <Canvas
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = 'none';
            gl.domElement.style.outline = 'none';
          }}
          dpr={[1, 1.5]}
          shadows
          camera={{ position: [-0.2, 1.55, 6.2], fov: 38, near: 0.1, far: 80 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
        >
          <Scene pointer={pointer} calm={calm} />
        </Canvas>
      )}
    </div>
  );
}
