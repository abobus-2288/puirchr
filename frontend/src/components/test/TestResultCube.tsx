'use client';

import { useRef, useEffect } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import * as THREE from 'three';

interface TestResultCubeProps {
  numericResult: number;
  maxScore: number;
  textDescription: string;
  category?: string;
}

export default function TestResultCube({ 
  numericResult, 
  maxScore, 
  textDescription, 
  category 
}: TestResultCubeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cubeGroupRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const lastMouseYRef = useRef(0);

  const percentage = Math.round((numericResult / maxScore) * 100);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 256;
    const height = mountRef.current.clientHeight || 256;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearAlpha(0);
    rendererRef.current = renderer;

    // Ensure empty mount before appending
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    cubeGroupRef.current = cubeGroup;

    // Materials per face (transparent, color tint)
    const faceMaterials: THREE.MeshBasicMaterial[] = [
      new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true }),
      new THREE.MeshBasicMaterial({ color: 0x16a34a, transparent: true }),
      new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true }),
      new THREE.MeshBasicMaterial({ color: 0xea580c, transparent: true }),
      new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true }),
      new THREE.MeshBasicMaterial({ color: 0x6b7280, transparent: true }),
    ];
    materialsRef.current = faceMaterials;

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(geometry, faceMaterials);
    cubeGroup.add(cube);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    scene.add(cubeGroup);

    // Mouse controls using refs to avoid rerenders
    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = event.clientX;
      lastMouseYRef.current = event.clientY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current || !cubeGroupRef.current) return;
      const deltaX = event.clientX - lastMouseXRef.current;
      const deltaY = event.clientY - lastMouseYRef.current;
      cubeGroupRef.current.rotation.y += deltaX * 0.01;
      cubeGroupRef.current.rotation.x += deltaY * 0.01;
      lastMouseXRef.current = event.clientX;
      lastMouseYRef.current = event.clientY;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      event.preventDefault();
      cameraRef.current.position.z += event.deltaY * 0.01;
      cameraRef.current.position.z = Math.max(3, Math.min(10, cameraRef.current.position.z));
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (!isDraggingRef.current && cubeGroupRef.current) {
        cubeGroupRef.current.rotation.y += 0.005;
        cubeGroupRef.current.rotation.x += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth || 256;
      const h = mountRef.current.clientHeight || 256;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel as any);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      faceMaterials.forEach(m => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    };
  }, []);

  // Update face textures when content changes (no re-init)
  useEffect(() => {
    const createTextTexture = (
      text: string,
      fontSize: number = 64,
      color: string = '#ffffff'
    ) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = 1024; // higher resolution for crisp text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      // Transparent background (no black fill)
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = text.split('\n');
      const lineHeight = fontSize * 1.25;
      const startY = (size - (lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, idx) => {
        ctx.fillText(line, size / 2, startY + idx * lineHeight);
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const mats = materialsRef.current;
    if (!mats || mats.length !== 6) return;

    mats[0].map = createTextTexture(`${numericResult}\nиз ${maxScore}\n${percentage}%`, 64);
    mats[1].map = createTextTexture(`${category || 'Результат'}\n\n${textDescription}`, 40);
    mats[2].map = createTextTexture('Тест завершен\n\nПоздравляем!', 56);
    mats[3].map = createTextTexture('Анализ\n\nВаш стиль лидерства', 52);
    mats[4].map = createTextTexture('Результаты\n\nДетальная информация', 48);
    mats[5].map = createTextTexture('Информация\n\nО тесте', 48);
    mats.forEach(m => (m.needsUpdate = true));
  }, [numericResult, maxScore, percentage, textDescription, category]);

  const handleReset = () => {
    if (cubeGroupRef.current) {
      cubeGroupRef.current.rotation.x = 0;
      cubeGroupRef.current.rotation.y = 0;
    }
  };

  const handleRotateLeft = () => {
    if (cubeGroupRef.current) cubeGroupRef.current.rotation.y -= Math.PI / 2;
  };

  const handleRotateRight = () => {
    if (cubeGroupRef.current) cubeGroupRef.current.rotation.y += Math.PI / 2;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        ref={mountRef}
        className="w-64 h-64 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

      <div className="flex space-x-4">
        <button
          onClick={handleRotateLeft}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
          title="Повернуть влево"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Сбросить
        </button>
        
        <button
          onClick={handleRotateRight}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
          title="Повернуть вправо"
        >
          <RotateCw className="h-5 w-5" />
        </button>
      </div>

      <div className="text-center text-gray-400 text-sm">
        <p>Перетащите куб мышью или используйте кнопки для поворота</p>
        <p className="mt-1">Колесико мыши для масштабирования</p>
      </div>
    </div>
  );
}
