// ============================================
// Confetti Celebration Effect
// Lightweight canvas-based confetti animation
// ============================================
import { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    size: number;
    opacity: number;
}

const COLORS = [
    '#8b5cf6', '#6366f1', '#ec4899', '#f97316',
    '#10b981', '#06b6d4', '#f59e0b', '#ef4444'
];

export function useConfetti() {
    const [isActive, setIsActive] = useState(false);

    const fire = () => setIsActive(true);
    const reset = () => setIsActive(false);

    return { isActive, fire, reset, ConfettiCanvas: isActive ? <ConfettiEffect onComplete={reset} /> : null };
}

function ConfettiEffect({ onComplete }: { onComplete: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        for (let i = 0; i < 120; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: -Math.random() * 18 - 5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                size: Math.random() * 8 + 4,
                opacity: 1,
            });
        }

        let frame = 0;
        const maxFrames = 150;

        const animate = () => {
            if (frame >= maxFrames) {
                onComplete();
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.vy += 0.25; // gravity
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.opacity = Math.max(0, 1 - frame / maxFrames);

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            });

            frame++;
            requestAnimationFrame(animate);
        };

        animate();
    }, [onComplete]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[9999] pointer-events-none"
            style={{ mixBlendMode: 'normal' }}
        />
    );
}
