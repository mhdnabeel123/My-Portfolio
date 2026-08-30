import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Ultra-performant: uses THREE.Points for nodes + pre-allocated LineSegments
// Zero object creation per frame = 60fps smooth

const N          = 70;    // node count
const MAX_D      = 140;   // connection distance
const MAX_PAIRS  = 600;   // hard cap on visible connections

export default function ThreeHeroBG() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let mounted = true; // guard against StrictMode double-invoke

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 420;

    /* ── Nodes as Points (single draw call) ── */
    const nodePosArr  = new Float32Array(N * 3);
    const nodeVels    = [];
    const nodePhases  = [];
    for (let i = 0; i < N; i++) {
      nodePosArr[i * 3]     = (Math.random() - 0.5) * 800;
      nodePosArr[i * 3 + 1] = (Math.random() - 0.5) * 600;
      nodePosArr[i * 3 + 2] = (Math.random() - 0.5) * 280;
      nodeVels.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.18,
      ));
      nodePhases.push(Math.random() * Math.PI * 2);
    }
    const nodeGeo = new THREE.BufferGeometry();
    const nodePosBuf = new THREE.BufferAttribute(nodePosArr, 3);
    nodeGeo.setAttribute('position', nodePosBuf);

    const pointsMat = new THREE.PointsMaterial({
      color: 0x00e5ff, size: 3, transparent: true, opacity: 0.75,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(nodeGeo, pointsMat);
    scene.add(points);

    /* ── Lines — pre-allocated buffer, never reallocated ── */
    const linePosArr = new Float32Array(MAX_PAIRS * 6); // 2 verts × 3 floats
    const lineColArr = new Float32Array(MAX_PAIRS * 6);
    const lineGeo    = new THREE.BufferGeometry();
    const linePosBuf = new THREE.BufferAttribute(linePosArr, 3);
    const lineColBuf = new THREE.BufferAttribute(lineColArr, 3);
    linePosBuf.setUsage(THREE.DynamicDrawUsage);
    lineColBuf.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute('position', linePosBuf);
    lineGeo.setAttribute('color',    lineColBuf);
    const lineSegs = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 }));
    scene.add(lineSegs);

    /* ── Ambient glow blobs (static, no update needed) ── */
    [
      [0x00e5ff, -180,  100, -80,  260],
      [0x7c4dff,  200,  -80, -120, 220],
      [0xe040fb,    0, -140, -160, 190],
    ].forEach(([c, x, y, z, r]) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 12),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.035 }),
      );
      m.position.set(x, y, z);
      scene.add(m);
    });

    /* ── Mouse parallax ── */
    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    /* ── Resize ── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });

    /* ── Temp vectors (reuse, avoid GC) ── */
    const posA = new THREE.Vector3();
    const posB = new THREE.Vector3();

    /* ── Animation loop ── */
    let frame = 0, animId;

    const tick = () => {
      if (!mounted) return;
      animId = requestAnimationFrame(tick);
      frame++;

      // Update node positions in buffer
      for (let i = 0; i < N; i++) {
        const v = nodeVels[i];
        nodePosArr[i * 3]     += v.x;
        nodePosArr[i * 3 + 1] += v.y;
        nodePosArr[i * 3 + 2] += v.z;
        // Bounce
        if (Math.abs(nodePosArr[i * 3])     > 405) v.x *= -1;
        if (Math.abs(nodePosArr[i * 3 + 1]) > 305) v.y *= -1;
        if (Math.abs(nodePosArr[i * 3 + 2]) > 145) v.z *= -1;
      }
      nodePosBuf.needsUpdate = true;

      // Pulse points opacity
      pointsMat.opacity = 0.5 + 0.25 * Math.sin(frame * 0.015);

      // Update lines every 3 frames
      if (frame % 3 === 0) {
        let idx = 0;
        outer: for (let i = 0; i < N - 1; i++) {
          posA.set(nodePosArr[i*3], nodePosArr[i*3+1], nodePosArr[i*3+2]);
          for (let j = i + 1; j < N; j++) {
            posB.set(nodePosArr[j*3], nodePosArr[j*3+1], nodePosArr[j*3+2]);
            const d = posA.distanceTo(posB);
            if (d < MAX_D) {
              const a = (1 - d / MAX_D);
              const b = idx * 6;
              linePosArr[b]   = posA.x; linePosArr[b+1] = posA.y; linePosArr[b+2] = posA.z;
              linePosArr[b+3] = posB.x; linePosArr[b+4] = posB.y; linePosArr[b+5] = posB.z;
              lineColArr[b]   = a * 0.5; lineColArr[b+1] = a * 0.2; lineColArr[b+2] = a;
              lineColArr[b+3] = a * 0.5; lineColArr[b+4] = a * 0.2; lineColArr[b+5] = a;
              if (++idx >= MAX_PAIRS) break outer;
            }
          }
        }
        // Zero out rest
        for (let k = idx; k < MAX_PAIRS; k++) {
          const b = k * 6;
          linePosArr[b]=linePosArr[b+1]=linePosArr[b+2]=linePosArr[b+3]=linePosArr[b+4]=linePosArr[b+5]=0;
        }
        lineGeo.setDrawRange(0, idx * 2);
        linePosBuf.needsUpdate = true;
        lineColBuf.needsUpdate = true;
      }

      // Camera parallax (smooth)
      camera.position.x += (mx * 22 - camera.position.x) * 0.03;
      camera.position.y += (-my * 16 - camera.position.y) * 0.03;

      // Slow scene rotation
      scene.rotation.y += 0.0005;
      scene.rotation.x += 0.0002;

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      mounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      nodeGeo.dispose();
      lineGeo.dispose();
      pointsMat.dispose();
      lineSegs.material.dispose();
      renderer.dispose();
      try { if (el && el.contains(renderer.domElement)) el.removeChild(renderer.domElement); } catch {
        // ignore error if element was already removed
      }
    };
  }, []);

  return (
    <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
  );
}
