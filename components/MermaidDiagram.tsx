'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Paper, Text } from '@mantine/core';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      er: {
        fontSize: 14,
      },
    });
  }, []);

  useEffect(() => {
    if (containerRef.current && chart) {
      const renderDiagram = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Error rendering Mermaid diagram:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<p style="color: red;">Error rendering diagram: ${
              error instanceof Error ? error.message : 'Unknown error'
            }</p>`;
          }
        }
      };

      renderDiagram();
    }
  }, [chart]);

  if (!chart) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          Enter JSON data to see the database diagram
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder style={{ overflow: 'auto' }}>
      <div ref={containerRef} />
    </Paper>
  );
}
