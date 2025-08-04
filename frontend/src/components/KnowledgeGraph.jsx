import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, ZoomIn, ZoomOut, RotateCcw, Brain, Link, Target } from 'lucide-react';
import * as d3 from 'd3';

export const KnowledgeGraph = ({ notes, selectedNote, onNodeSelect, isExpanded = false }) => {
  const svgRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [connectionType, setConnectionType] = useState('all'); // all, manual, ai, prerequisite

  // Filter notes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        note.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes]);

  useEffect(() => {
    if (!filteredNotes.length || !svgRef.current) return;

    // Clear previous graph
    const svg = svgRef.current;
    svg.innerHTML = '';

    // Set up dimensions based on expanded mode
    const container = svg.parentElement;
    const width = isExpanded ? container.clientWidth : 320;
    const height = isExpanded ? container.clientHeight : 300;
    const margin = isExpanded ? 50 : 20;

    // Create SVG with zoom support
    const svgElement = d3.select(svg)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('border', isExpanded ? 'none' : '1px solid hsl(var(--border))')
      .style('border-radius', isExpanded ? '0' : '8px')
      .style('background', 'hsl(var(--background))');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svgElement.call(zoom);

    // Create main group for zooming
    const g = svgElement.append('g');

    // Create arrow markers for different connection types
    const defs = svgElement.append('defs');
    
    // Different markers for different connection types
    const markerTypes = {
      'prerequisite': { color: '#ef4444', width: 12, height: 8 },
      'related': { color: '#3b82f6', width: 10, height: 7 },
      'derives_from': { color: '#10b981', width: 10, height: 7 },
      'enhances': { color: '#f59e0b', width: 10, height: 7 },
      'study_sequence': { color: '#8b5cf6', width: 10, height: 7 }
    };

    Object.entries(markerTypes).forEach(([type, config]) => {
      const marker = defs.append('marker')
        .attr('id', `arrowhead-${type}`)
        .attr('markerWidth', config.width)
        .attr('markerHeight', config.height)
        .attr('refX', config.width - 1)
        .attr('refY', config.height / 2)
        .attr('orient', 'auto');

      marker.append('polygon')
        .attr('points', `0 0, ${config.width} ${config.height/2}, 0 ${config.height}`)
        .attr('fill', config.color);
    });

    // Create nodes data with enhanced properties
    const nodes = filteredNotes.map((note, index) => ({
      id: note.id,
      title: note.title,
      difficulty: note.difficulty_level || 'beginner',
      difficulty_score: note.difficulty_score || 1.0,
      tags: note.tags || [],
      keywords: note.keywords || [],
      content: note.content || '',
      ai_rating: note.ai_rating || 0.5,
      mastery_level: note.mastery_level || 0.0,
      review_count: note.review_count || 0,
      last_reviewed: note.last_reviewed,
      created_at: note.created_at,
      x: margin + (index % 3) * 80,
      y: margin + Math.floor(index / 3) * 80
    }));

    // Create intelligent connections using multiple strategies
    const links = createIntelligentConnections(nodes);

    // Filter connections based on type
    const filteredLinks = connectionType === 'all' 
      ? links 
      : links.filter(link => link.type === connectionType);

    // Create force simulation with adjusted parameters for expanded mode
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(isExpanded ? 150 : 100))
      .force('charge', d3.forceManyBody().strength(isExpanded ? -500 : -300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(isExpanded ? 40 : 30));

    // Draw links with different styles based on type
    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', d => this.getConnectionColor(d.type))
      .attr('stroke-width', d => Math.max(1, d.weight * (isExpanded ? 5 : 3)))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', d => `url(#arrowhead-${d.type})`)
      .style('stroke-dasharray', d => d.type === 'prerequisite' ? '5,5' : 'none');

    // Draw nodes with enhanced styling
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeSelect(d.id))
      .on('mouseover', function(_, d) {
        const radius = isExpanded ? 35 : 25;
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', radius);
        
        // Highlight connected links
        link.style('stroke-opacity', l => 
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
        );
      })
      .on('mouseout', function(_, d) {
        const radius = isExpanded ? 30 : 20;
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', radius);
        
        // Reset link opacity
        link.style('stroke-opacity', 0.6);
      });

    // Add circles to nodes with size based on importance
    const nodeRadius = isExpanded ? 30 : 20;
    node.append('circle')
      .attr('r', d => nodeRadius * (1 + d.ai_rating * 0.5)) // Size based on AI rating
      .attr('fill', d => getNodeColor(d.difficulty))
      .attr('stroke', d => selectedNote?.id === d.id ? 'hsl(var(--foreground))' : 'hsl(var(--border))')
      .attr('stroke-width', d => selectedNote?.id === d.id ? 3 : 2)
      .style('transition', 'all 0.2s ease');

    // Add mastery indicator (inner circle)
    node.append('circle')
      .attr('r', d => (nodeRadius * 0.6) * (1 + d.ai_rating * 0.5))
      .attr('fill', 'none')
      .attr('stroke', d => getMasteryColor(d.mastery_level))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => `${2 * Math.PI * (nodeRadius * 0.6) * d.mastery_level} ${2 * Math.PI * (nodeRadius * 0.6)}`)
      .style('transform', 'rotate(-90deg)');

    // Add text to nodes
    const fontSize = isExpanded ? '14px' : '10px';
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', fontSize)
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text(d => d.title.charAt(0).toUpperCase());

    // Add enhanced tooltips
    node.append('title')
      .text(d => createNodeTooltip(d));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup function
    return () => {
      simulation.stop();
    };

  }, [filteredNotes, selectedNote, onNodeSelect, isExpanded, connectionType]);

  // Intelligent connection creation
  const createIntelligentConnections = (nodes) => {
    const links = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        // Strategy 1: Keyword similarity
        const keywordSimilarity = calculateKeywordSimilarity(nodeA, nodeB);
        
        // Strategy 2: Tag similarity
        const tagSimilarity = calculateTagSimilarity(nodeA, nodeB);
        
        // Strategy 3: Content similarity
        const contentSimilarity = calculateContentSimilarity(nodeA, nodeB);
        
        // Strategy 4: Difficulty relationship
        const difficultyRelationship = analyzeDifficultyRelationship(nodeA, nodeB);
        
        // Strategy 5: Temporal relationship
        const temporalRelationship = analyzeTemporalRelationship(nodeA, nodeB);
        
        // Calculate overall similarity
        const overallScore = calculateOverallSimilarity(
          keywordSimilarity, tagSimilarity, contentSimilarity, 
          difficultyRelationship, temporalRelationship
        );
        
        if (overallScore > 0.3) {
          const connectionType = determineConnectionType(nodeA, nodeB, overallScore, difficultyRelationship);
          
          links.push({
            source: nodeA.id,
            target: nodeB.id,
            type: connectionType,
            weight: overallScore,
            metadata: {
              keywordSimilarity,
              tagSimilarity,
              contentSimilarity,
              difficultyRelationship,
              temporalRelationship
            }
          });
        }
      }
    }
    
    return links;
  };

  const calculateKeywordSimilarity = (node1, node2) => {
    const keywords1 = new Set(node1.keywords || []);
    const keywords2 = new Set(node2.keywords || []);
    
    if (keywords1.size === 0 || keywords2.size === 0) return 0;
    
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);
    
    return intersection.size / union.size;
  };

  const calculateTagSimilarity = (node1, node2) => {
    const tags1 = new Set(node1.tags || []);
    const tags2 = new Set(node2.tags || []);
    
    if (tags1.size === 0 || tags2.size === 0) return 0;
    
    const intersection = new Set([...tags1].filter(x => tags2.has(x)));
    const union = new Set([...tags1, ...tags2]);
    
    return intersection.size / union.size;
  };

  const calculateContentSimilarity = (node1, node2) => {
    const content1 = (node1.content || "").toLowerCase();
    const content2 = (node2.content || "").toLowerCase();
    
    if (!content1 || !content2) return 0;
    
    const words1 = new Set(content1.match(/\b[a-zA-Z]+\b/g) || []);
    const words2 = new Set(content2.match(/\b[a-zA-Z]+\b/g) || []);
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  const analyzeDifficultyRelationship = (node1, node2) => {
    const difficultyMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const diff1 = difficultyMap[node1.difficulty] || 1;
    const diff2 = difficultyMap[node2.difficulty] || 1;
    
    if (diff1 < diff2) return 0.8; // Prerequisite
    else if (diff1 === diff2) return 0.6; // Related
    else return 0.3; // Less common
  };

  const analyzeTemporalRelationship = (node1, node2) => {
    const time1 = new Date(node1.created_at).getTime();
    const time2 = new Date(node2.created_at).getTime();
    const timeDiff = Math.abs(time1 - time2) / (1000 * 60 * 60); // hours
    
    if (timeDiff < 24) return 0.7;
    else if (timeDiff < 168) return 0.5; // week
    else return 0.2;
  };

  const calculateOverallSimilarity = (keyword, tag, content, difficulty, temporal) => {
    const weights = { keyword: 0.3, tag: 0.2, content: 0.25, difficulty: 0.15, temporal: 0.1 };
    
    return (
      keyword * weights.keyword +
      tag * weights.tag +
      content * weights.content +
      difficulty * weights.difficulty +
      temporal * weights.temporal
    );
  };

  const determineConnectionType = (source, target, similarity, difficultyRel) => {
    if (difficultyRel > 0.7) return 'prerequisite';
    else if (similarity > 0.8) return 'related';
    else if (similarity > 0.6) return 'derives_from';
    else if (similarity > 0.4) return 'enhances';
    else return 'related';
  };

  const getConnectionColor = (type) => {
    const colors = {
      'prerequisite': '#ef4444',
      'related': '#3b82f6',
      'derives_from': '#10b981',
      'enhances': '#f59e0b',
      'study_sequence': '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

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

  const getMasteryColor = (masteryLevel) => {
    if (masteryLevel > 0.8) return '#10b981';
    else if (masteryLevel > 0.5) return '#f59e0b';
    else return '#ef4444';
  };

  const createNodeTooltip = (node) => {
    return `${node.title} (${node.difficulty})
Mastery: ${Math.round(node.mastery_level * 100)}%
AI Rating: ${Math.round(node.ai_rating * 100)}%
Reviews: ${node.review_count}
Tags: ${node.tags.join(', ')}
Keywords: ${node.keywords.join(', ')}`;
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current).select('svg');
    svg.transition().duration(300).call(
      d3.zoom().scaleBy, 1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current).select('svg');
    svg.transition().duration(300).call(
      d3.zoom().scaleBy, 1 / 1.5
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current).select('svg');
    svg.transition().duration(300).call(
      d3.zoom().transform, d3.zoomIdentity
    );
  };

  if (notes.length === 0) {
    return (
      <Card className={`japanese-card p-4 ${isExpanded ? 'h-full' : ''}`}>
        <h3 className="font-semibold japanese-text text-foreground mb-2">Knowledge Graph</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-1">Create notes to see your knowledge graph</p>
        </div>
      </Card>
    );
  }

  // If expanded, show full-screen graph without card wrapper
  if (isExpanded) {
    return (
      <div className="h-full w-full relative">
        {/* Controls overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 border border-border">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="japanese-textarea pl-10 text-sm w-48"
            />
          </div>

          {/* Connection Type Filter */}
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
            className="japanese-textarea text-sm w-32"
          >
            <option value="all">All Types</option>
            <option value="prerequisite">Prerequisites</option>
            <option value="related">Related</option>
            <option value="derives_from">Derives From</option>
            <option value="enhances">Enhances</option>
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="p-1 h-8 w-8"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="p-1 h-8 w-8"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="p-1 h-8 w-8"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          
          <span className="text-xs text-muted-foreground px-2">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
          <h4 className="text-sm font-semibold japanese-text text-foreground mb-2">Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <h5 className="font-medium">Difficulty</h5>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="japanese-text">Beginner</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="japanese-text">Intermediate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="japanese-text">Advanced</span>
              </div>
            </div>
            <div className="space-y-1">
              <h5 className="font-medium">Connections</h5>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-red-500" style={{borderTop: '2px dashed #ef4444'}}></div>
                <span className="japanese-text">Prerequisite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span className="japanese-text">Related</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span className="japanese-text">Derives From</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div ref={svgRef} className="h-full w-full" />
      </div>
    );
  }

  // Regular card view for sidebar
  return (
    <Card className="japanese-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold japanese-text text-foreground">Knowledge Graph</h3>
        <div className="flex items-center space-x-1 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="japanese-text">Beginner</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="japanese-text">Intermediate</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="japanese-text">Advanced</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="japanese-textarea pl-10 text-sm"
        />
      </div>

      {/* Connection Type Filter */}
      <div className="mb-3">
        <select
          value={connectionType}
          onChange={(e) => setConnectionType(e.target.value)}
          className="japanese-textarea text-sm w-full"
        >
          <option value="all">All Connection Types</option>
          <option value="prerequisite">Prerequisites</option>
          <option value="related">Related</option>
          <option value="derives_from">Derives From</option>
          <option value="enhances">Enhances</option>
        </select>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="p-1 h-8 w-8"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="p-1 h-8 w-8"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="p-1 h-8 w-8"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>
      
      <div ref={svgRef} className="flex justify-center">
        {/* SVG will be inserted here */}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p className="japanese-text">Click nodes to select notes</p>
        <p className="japanese-text">Connections show learning relationships</p>
        <p className="japanese-text">Thicker lines = stronger connections</p>
        <p className="japanese-text">Inner circle = mastery level</p>
      </div>
    </Card>
  );
}; 