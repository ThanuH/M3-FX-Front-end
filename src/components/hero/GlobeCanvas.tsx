'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const MARKERS: [number, number, number, boolean][] = [
    [7.8731, 80.7718, 9, true],     // Sri Lanka (highlighted, amber)
    [51.5074, -0.1278, 5, false],   // London
    [40.7128, -74.006, 5, false],   // New York
    [35.6762, 139.6503, 4, false],  // Tokyo
    [25.2048, 55.2708, 5, false],   // Dubai
    [1.3521, 103.8198, 4, false],   // Singapore
    [19.076, 72.8777, 4, false],    // Mumbai
    [22.3193, 114.1694, 3.5, false],// Hong Kong
];

export default function GlobeCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const phiRef = useRef(1.45);
    const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        globeRef.current = createGlobe(canvas, {
            devicePixelRatio: 2,
            width: 520 * 2,
            height: 520 * 2,
            phi: 1.45,
            theta: 0.22,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 3.5,
            baseColor: [0.06, 0.1, 0.2],
            markerColor: [0.24, 0.49, 0.92],  // royal blue
            glowColor: [0.1, 0.22, 0.55],
            markers: MARKERS.map(([lat, lon, , highlight]) => ({
                location: [lat, lon] as [number, number],
                size: highlight ? 0.08 : 0.04,
            })),
            onRender(state) {
                state.phi = phiRef.current;
                phiRef.current += 0.003;
            },
        });

        return () => {
            globeRef.current?.destroy();
        };
    }, []);

    // Mouse drag support
    const dragging = useRef(false);
    const lastX = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        dragging.current = true;
        lastX.current = e.clientX;
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging.current) return;
        phiRef.current -= (e.clientX - lastX.current) * 0.006;
        lastX.current = e.clientX;
    };
    const onMouseUp = () => { dragging.current = false; };

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: 520,
                height: 520,
                cursor: 'grab',
                borderRadius: '50%',
                userSelect: 'none',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        />
    );
}
