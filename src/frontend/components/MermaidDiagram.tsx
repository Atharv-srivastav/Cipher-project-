import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Fira Code, monospace',
});

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    const renderChart = async () => {
      try {
        containerRef.current!.innerHTML = '';
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn('Mermaid render warning:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-xs text-rose-400 p-4 font-mono bg-rose-950/20 rounded border border-rose-900/50">Syntax error in Mermaid UML diagram string. Double-check class names and arrows.</div>`;
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="w-full overflow-x-auto p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-center items-center min-h-[220px]" ref={containerRef} />
  );
};
