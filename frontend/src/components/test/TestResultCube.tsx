'use client';

import { useRef, useState, useEffect } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';

interface TestResultCubeProps {
  numericResult: number;
  maxScore: number;
  textDescription: string;
  category?: string;
  testDescription?: string;
}

export default function TestResultCube({ 
  numericResult, 
  maxScore, 
  textDescription, 
  category,
  testDescription
}: TestResultCubeProps) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [scale, setScale] = useState(1);
  const isDragging = useRef(false);
  const isAutoRotating = useRef(true);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const autoRotateSpeed = useRef({ x: 0.2, y: 0.3 });

  const percentage = Math.round((numericResult / maxScore) * 100);

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging.current && isAutoRotating.current) {
        setRotationX(prev => prev + autoRotateSpeed.current.x);
        setRotationY(prev => prev + autoRotateSpeed.current.y);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    isAutoRotating.current = false;
    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastMouseX.current;
      const deltaY = e.clientY - lastMouseY.current;
      setRotationY(prev => prev + deltaX * 0.5);
      setRotationX(prev => prev - deltaY * 0.5);
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
  };

  const handleMouseUp = () => {
      isDragging.current = false;
      isAutoRotating.current = true;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      isDragging.current = true;
      isAutoRotating.current = false;
      lastMouseX.current = e.touches[0].clientX;
      lastMouseY.current = e.touches[0].clientY;

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging.current || e.touches.length !== 1) return;
        e.preventDefault();
        const deltaX = e.touches[0].clientX - lastMouseX.current;
        const deltaY = e.touches[0].clientY - lastMouseY.current;
        setRotationY(prev => prev + deltaX * 0.5);
        setRotationX(prev => prev - deltaY * 0.5);
        lastMouseX.current = e.touches[0].clientX;
        lastMouseY.current = e.touches[0].clientY;
      };

      const handleTouchEnd = () => {
        isDragging.current = false;
        isAutoRotating.current = true;
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => Math.max(0.5, Math.min(1.5, prev - e.deltaY * 0.001)));
  };

  const handleReset = () => {
    setRotationX(0);
    setRotationY(0);
    setScale(1);
    isAutoRotating.current = true;
  };

  const handleRotateLeft = () => {
    setRotationY(prev => prev - 90);
    isAutoRotating.current = false;
    setTimeout(() => {
      isAutoRotating.current = true;
    }, 2000);
  };

  const handleRotateRight = () => {
    setRotationY(prev => prev + 90);
    isAutoRotating.current = false;
    setTimeout(() => {
      isAutoRotating.current = true;
    }, 2000);
  };

  const faces = [
    {
      id: 'front',
      text: `${numericResult}\nиз ${maxScore}\n${percentage}%`,
      className: 'bg-white border-2 border-gray-300 shadow-md',
      textSize: 'text-2xl',
    },
    {
      id: 'back',
      text: `${category || 'Результат'}\n\n${textDescription}`,
      className: 'bg-white border-2 border-gray-300 shadow-md',
      textSize: 'text-base',
    },
    {
      id: 'right',
      text: 'Тест завершен\n\nПоздравляем!',
      className: 'bg-gray-50 border-2 border-gray-300 shadow-sm',
      textSize: 'text-lg',
    },
    {
      id: 'left',
      text: 'Анализ\n\nВаш стиль лидерства',
      className: 'bg-gray-50 border-2 border-gray-300 shadow-sm',
      textSize: 'text-lg',
    },
    {
      id: 'top',
      text: `О тесте\n\n${testDescription || 'Информация о тесте'}`,
      className: 'bg-white border-2 border-gray-300 shadow-md',
      textSize: 'text-sm',
    },
    {
      id: 'bottom',
      text: 'Информация\n\nО тесте',
      className: 'bg-gray-50 border-2 border-gray-300 shadow-sm',
      textSize: 'text-base',
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        className="w-[450px] h-[450px] relative flex items-center justify-center"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          ref={cubeRef}
          className="relative"
          style={{
            width: '300px',
            height: '300px',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`,
            transition: isDragging.current ? 'none' : 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onWheel={handleWheel}
        >
          {faces.map((face, index) => {
            const transforms: Record<string, string> = {
              front: 'translateZ(150px)',
              back: 'translateZ(-150px) rotateY(180deg)',
              right: 'translateX(150px) rotateY(90deg)',
              left: 'translateX(-150px) rotateY(-90deg)',
              top: 'translateY(-150px) rotateX(90deg)',
              bottom: 'translateY(150px) rotateX(-90deg)',
            };

            return (
              <div
                key={face.id}
                className={`absolute w-[300px] h-[300px] ${face.className} flex items-center justify-center text-center p-6 cursor-grab active:cursor-grabbing rounded-sm`}
                style={{
                  transform: transforms[face.id],
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className={`text-gray-900 whitespace-pre-line ${face.textSize}`}>
                  {face.text.split('\n').map((line, i) => (
                    <div
                      key={i}
                      className={`${
                        i === 0 ? 'font-bold mb-2' : 
                        i === 1 && face.text.split('\n').length > 2 ? 'font-semibold mb-1' : 
                        'font-normal'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleRotateLeft}
          className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-900 transition-colors"
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
          className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-900 transition-colors"
          title="Повернуть вправо"
        >
          <RotateCw className="h-5 w-5" />
        </button>
      </div>

      <div className="text-center text-gray-600 text-sm">
        <p>Перетащите куб мышью или используйте кнопки для поворота</p>
        <p className="mt-1">Колесико мыши для масштабирования</p>
      </div>
    </div>
  );
}