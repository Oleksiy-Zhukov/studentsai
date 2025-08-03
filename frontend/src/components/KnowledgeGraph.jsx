import React, { useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export const KnowledgeGraph = ({ notes, selectedNote, onNodeSelect }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!notes.length || !svgRef.current) return;

    // Clear previous graph
    const svg = svgRef.current;
    svg.innerHTML = '';

    // Set up dimensions
    const width = 320;
    const height = 300;
    const margin = 20;

    // Create SVG
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', width);
    svgElement.setAttribute('height', height);
    svgElement.style.border = '1px solid #e2e8f0';
    svgElement.style.borderRadius = '8px';
    svg.appendChild(svgElement);

    // Create nodes data
    const nodes = notes.map((note, index) => ({
      id: note.id,
      title: note.title,
      difficulty: note.difficulty_level,
      x: margin + (index % 3) * 80,
      y: margin + Math.floor(index / 3) * 80
    }));

    // Create simple connections (every node connects to the next)
    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id,
        target: nodes[i + 1].id
      });
    }

    // Draw links
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceNode.x + 20);
        line.setAttribute('y1', sourceNode.y + 20);
        line.setAttribute('x2', targetNode.x + 20);
        line.setAttribute('y2', targetNode.y + 20);
        line.setAttribute('stroke', '#94a3b8');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        svgElement.appendChild(line);
      }
    });

    // Create arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#94a3b8');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svgElement.appendChild(defs);

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNote?.id === node.id;
      
      // Create node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x + 20);
      circle.setAttribute('cy', node.y + 20);
      circle.setAttribute('r', '20');
      circle.setAttribute('fill', getNodeColor(node.difficulty));
      circle.setAttribute('stroke', isSelected ? '#000' : '#e2e8f0');
      circle.setAttribute('stroke-width', isSelected ? '3' : '2');
      circle.style.cursor = 'pointer';
      circle.addEventListener('click', () => onNodeSelect(node.id));
      svgElement.appendChild(circle);

      // Create node text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x + 20);
      text.setAttribute('y', node.y + 25);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10px');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#fff');
      text.textContent = node.title.charAt(0).toUpperCase();
      text.style.cursor = 'pointer';
      text.addEventListener('click', () => onNodeSelect(node.id));
      svgElement.appendChild(text);

      // Create tooltip
      const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      tooltip.textContent = `${node.title} (${node.difficulty})`;
      circle.appendChild(tooltip);
    });

  }, [notes, selectedNote, onNodeSelect]);

  const getNodeColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (notes.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-2">Knowledge Graph</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-1">Create notes to see your knowledge graph</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Knowledge Graph</h3>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Beginner</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Intermediate</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Advanced</span>
          </div>
        </div>
      </div>
      
      <div ref={svgRef} className="flex justify-center">
        {/* SVG will be inserted here */}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Click nodes to select notes</p>
        <p>Connections show learning relationships</p>
      </div>
    </Card>
  );
}; 