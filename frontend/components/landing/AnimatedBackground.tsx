'use client';

/**
 * AnimatedBackground Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Dynamic animated background with layered floating shapes in dark green theme.
 */

import { useState, useEffect } from 'react';
import styles from '@/styles/components/AnimatedBackground.module.css';

interface Shape {
  id: number;
  type: 'circle' | 'triangle' | 'square';
  size: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

export default function AnimatedBackground() {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    const shapeTypes: Array<'circle' | 'triangle' | 'square'> = ['circle', 'triangle', 'square'];
    const generatedShapes: Shape[] = [];

    for (let i = 0; i < 20; i++) {
      generatedShapes.push({
        id: i,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        size: Math.random() * 150 + 50,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 20 + 15,
      });
    }

    setShapes(generatedShapes);
  }, []);

  return (
    <div className={styles.background} aria-hidden="true">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`${styles.shape} ${styles[shape.type]}`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
