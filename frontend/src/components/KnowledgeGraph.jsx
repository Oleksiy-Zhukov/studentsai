import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, ZoomIn, ZoomOut, RotateCcw, Brain, Link, Target, Sparkles, Info, 
  TrendingUp, Clock, Star, Filter, Layers, Eye, EyeOff, Maximize2, Minimize2,
  BarChart3, Network, GitBranch, GitCommit, GitPullRequest
} from 'lucide-react';
import * as d3 from 'd3';

export const KnowledgeGraph = ({ notes, selectedNote, onNodeSelect, isExpanded = false }) => {
  const svgRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [connectionType, setConnectionType] = useState('all');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [showAIIndicators, setShowAIIndicators] = useState(true);
  const [showMasteryLevels, setShowMasteryLevels] = useState(true);
  const [showDifficultyColors, setShowDifficultyColors] = useState(true);
  const [layoutMode, setLayoutMode] = useState('force'); // force, hierarchical, circular
  const [animationSpeed, setAnimationSpeed] = useState('normal'); // slow, normal, fast
  const [showTooltips, setShowTooltips] = useState(true);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

  // Enhanced filtering with multiple criteria
  useEffect(() => {
    if (!searchTerm.trim() && connectionType === 'all') {
      setFilteredNotes(notes);
    } else {
      let filtered = notes;
      
      // Text search
      if (searchTerm.trim()) {
        filtered = filtered.filter(note =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          note.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Connection type filtering
      if (connectionType !== 'all') {
        // This would need to be implemented based on actual connection data
        // For now, we'll keep all notes
      }
      
      setFilteredNotes(filtered);
    }
  }, [searchTerm, connectionType, notes]);

  useEffect(() => {
    if (!filteredNotes.length || !svgRef.current) return;

    // Clear previous graph
    const svg = svgRef.current;
    svg.innerHTML = '';

    // Set up dimensions with better responsive handling
    const container = svg.parentElement;
    const width = isExpanded ? container.clientWidth : 320;
    const height = isExpanded ? container.clientHeight : 300;
    
    // For full-screen mode, use viewport dimensions
    const finalWidth = isExpanded ? window.innerWidth : width;
    const finalHeight = isExpanded ? window.innerHeight - 200 : height; // Account for header and controls

    // Create SVG with enhanced styling
    const svgElement = d3.select(svg)
      .append('svg')
      .attr('width', finalWidth)
      .attr('height', finalHeight)
      .style('border', isExpanded ? 'none' : '1px solid oklch(0.8 0.02 240)')
      .style('border-radius', isExpanded ? '0' : '0.75rem')
      .style('background', 'oklch(0.99 0.005 60)')
      .style('font-family', 'Inter, Noto Sans JP, system-ui, sans-serif');

    // Enhanced zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svgElement.call(zoom);

    // Create main group for zooming
    const g = svgElement.append('g');

    // Enhanced arrow markers with Japanese-inspired colors
    const defs = svgElement.append('defs');
    
    const markerTypes = {
      'prerequisite': { color: 'oklch(0.6 0.15 27)', width: 12, height: 8 },
      'related': { color: 'oklch(0.6 0.15 240)', width: 10, height: 7 },
      'derives_from': { color: 'oklch(0.6 0.15 140)', width: 10, height: 7 },
      'enhances': { color: 'oklch(0.7 0.15 60)', width: 10, height: 7 },
      'study_sequence': { color: 'oklch(0.6 0.15 280)', width: 10, height: 7 }
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

    // Enhanced nodes data with more metadata
    const nodes = filteredNotes.map((note) => ({
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
      created_at: note.created_at,
      last_reviewed: note.last_reviewed,
      node_metadata: note.node_metadata || {},
      // Enhanced properties
      importance: note.ai_rating || 0.5,
      complexity: note.difficulty_score || 1.0,
      freshness: note.last_reviewed ? (Date.now() - new Date(note.last_reviewed).getTime()) / (1000 * 60 * 60 * 24) : 0,
      activity: note.review_count || 0
    }));

    // Create intelligent connections
    const links = createIntelligentConnections(nodes);

    // Filter connections based on type
    const filteredLinks = connectionType === 'all' 
      ? links 
      : links.filter(link => link.type === connectionType);

    // Enhanced force simulation with different layout modes
    let simulation;
    const baseDistance = isExpanded ? 150 : 80;
    const baseCharge = isExpanded ? -300 : -150;
    const baseRadius = isExpanded ? 40 : 25;

    switch (layoutMode) {
      case 'hierarchical':
        simulation = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(baseDistance))
          .force('charge', d3.forceManyBody().strength(baseCharge * 0.5))
          .force('center', d3.forceCenter(finalWidth / 2, finalHeight / 2))
          .force('collision', d3.forceCollide().radius(baseRadius))
          .force('x', d3.forceX().x(d => finalWidth / 2).strength(0.1))
          .force('y', d3.forceY().y(d => finalHeight / 2).strength(0.1));
        break;
      case 'circular':
        simulation = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(baseDistance))
          .force('charge', d3.forceManyBody().strength(baseCharge * 0.3))
          .force('center', d3.forceCenter(finalWidth / 2, finalHeight / 2))
          .force('collision', d3.forceCollide().radius(baseRadius))
          .force('radial', d3.forceRadial(100, finalWidth / 2, finalHeight / 2).strength(0.5));
        break;
      default: // force
        simulation = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(baseDistance))
          .force('charge', d3.forceManyBody().strength(baseCharge))
          .force('center', d3.forceCenter(finalWidth / 2, finalHeight / 2))
          .force('collision', d3.forceCollide().radius(baseRadius));
    }

    // Set animation speed
    const speedMultiplier = animationSpeed === 'slow' ? 0.5 : animationSpeed === 'fast' ? 2 : 1;
    simulation.alphaDecay(0.02 * speedMultiplier);

    // Enhanced links with better styling
    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', d => getConnectionColor(d.type))
      .attr('stroke-width', d => Math.max(1, d.weight * 3))
      .attr('stroke-dasharray', d => d.type === 'prerequisite' ? '5,5' : 'none')
      .attr('marker-end', d => `url(#arrowhead-${d.type})`)
      .style('opacity', 0.6)
      .style('transition', 'all 0.2s ease')
      .on('mouseover', (event, d) => {
        setHoveredConnection(d);
        d3.select(event.target)
          .style('opacity', 1)
          .style('stroke-width', Math.max(2, d.weight * 4))
          .style('filter', 'drop-shadow(0 2px 4px oklch(0 0 0 / 0.1))');
      })
      .on('mouseout', (event) => {
        setHoveredConnection(null);
        d3.select(event.target)
          .style('opacity', 0.6)
          .style('stroke-width', Math.max(1, d => d.weight * 3))
          .style('filter', 'none');
      });

    // Enhanced nodes with better interactions
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onNodeSelect(d.id);
        setSelectedNodeDetails(d);
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        d3.select(event.currentTarget)
          .select('circle')
          .style('stroke-width', 4)
          .style('filter', 'drop-shadow(0 4px 8px oklch(0 0 0 / 0.15))');
      })
      .on('mouseout', (event) => {
        setHoveredNode(null);
        d3.select(event.currentTarget)
          .select('circle')
          .style('stroke-width', d => d.id === selectedNote?.id ? 3 : 2)
          .style('filter', 'none');
      });

    // Enhanced main node circle with Japanese-inspired colors
    node.append('circle')
      .attr('r', d => Math.max(10, d.importance * 25))
      .attr('fill', d => showDifficultyColors ? getNodeColor(d.difficulty) : 'oklch(0.4 0.04 240)')
      .attr('stroke', d => d.id === selectedNote?.id ? 'oklch(0.6 0.15 240)' : 'oklch(0.3 0.045 240)')
      .attr('stroke-width', d => d.id === selectedNote?.id ? 3 : 2)
      .style('transition', 'all 0.3s ease')
      .style('filter', 'drop-shadow(0 2px 4px oklch(0 0 0 / 0.1))');

    // Enhanced mastery level indicator
    if (showMasteryLevels) {
      node.append('circle')
        .attr('r', d => Math.max(6, d.importance * 15))
        .attr('fill', d => getMasteryColor(d.mastery_level))
        .attr('stroke', 'oklch(0.99 0.005 60)')
        .attr('stroke-width', 1)
        .style('opacity', 0.9)
        .style('transition', 'all 0.2s ease');
    }

    // Enhanced AI indicator
    if (showAIIndicators) {
      node.append('circle')
        .attr('r', 4)
        .attr('fill', 'oklch(0.6 0.15 280)')
        .attr('stroke', 'oklch(0.99 0.005 60)')
        .attr('stroke-width', 1)
        .style('opacity', d => d.ai_rating > 0.7 ? 1 : 0.4)
        .attr('transform', 'translate(12, -12)');
    }

    // Enhanced node labels with better typography
    node.append('text')
      .text(d => d.title.length > 12 ? d.title.substring(0, 12) + '...' : d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', d => Math.max(15, d.importance * 25) + 18)
      .style('font-size', isExpanded ? '11px' : '9px')
      .style('font-weight', '500')
      .style('fill', 'oklch(0.2 0.05 240)')
      .style('pointer-events', 'none')
      .style('font-family', 'Inter, Noto Sans JP, system-ui, sans-serif')
      .style('letter-spacing', '0.025em');

    // Enhanced tooltips
    if (showTooltips) {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'graph-tooltip')
        .style('position', 'absolute')
        .style('background', 'oklch(0.98 0.01 60)')
        .style('border', '1px solid oklch(0.8 0.02 240)')
        .style('border-radius', '0.5rem')
        .style('padding', '0.75rem')
        .style('font-size', '0.875rem')
        .style('font-family', 'Inter, Noto Sans JP, system-ui, sans-serif')
        .style('box-shadow', '0 4px 6px -1px oklch(0 0 0 / 0.1)')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('transition', 'opacity 0.2s ease')
        .style('z-index', 1000);

      node.on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        
        tooltip.html(`
          <div class="space-y-2">
            <div class="font-semibold text-ink-900">${d.title}</div>
            <div class="text-sm text-ink-600">
              <div>Difficulty: <span class="font-medium">${d.difficulty}</span></div>
              <div>Mastery: <span class="font-medium">${Math.round(d.mastery_level * 100)}%</span></div>
              <div>Reviews: <span class="font-medium">${d.review_count}</span></div>
              ${d.tags.length > 0 ? `<div>Tags: <span class="font-medium">${d.tags.slice(0, 3).join(', ')}</span></div>` : ''}
            </div>
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      });
    }

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
      if (showTooltips) {
        d3.selectAll('.graph-tooltip').remove();
      }
    };
  }, [filteredNotes, selectedNote, connectionType, showAIIndicators, showMasteryLevels, showDifficultyColors, layoutMode, animationSpeed, showTooltips, isExpanded]);

  // Enhanced connection creation with more sophisticated algorithms
  const createIntelligentConnections = (nodes) => {
    const links = [];
    const maxConnections = Math.min(50, nodes.length * 3); // Limit connections for performance

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (links.length >= maxConnections) break;

        const node1 = nodes[i];
        const node2 = nodes[j];

        const keywordSimilarity = calculateKeywordSimilarity(node1, node2);
        const tagSimilarity = calculateTagSimilarity(node1, node2);
        const contentSimilarity = calculateContentSimilarity(node1, node2);
        const difficultyRelationship = analyzeDifficultyRelationship(node1, node2);
        const temporalRelationship = analyzeTemporalRelationship(node1, node2);

        const overallSimilarity = calculateOverallSimilarity(
          keywordSimilarity, tagSimilarity, contentSimilarity, 
          difficultyRelationship, temporalRelationship
        );

        if (overallSimilarity > 0.3) { // Lower threshold for more connections
          const connectionType = determineConnectionType(node1, node2, overallSimilarity);
          
          links.push({
            source: node1.id,
            target: node2.id,
            type: connectionType,
            weight: overallSimilarity,
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

    return links.sort((a, b) => b.weight - a.weight).slice(0, maxConnections);
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
    const content1 = (node1.content || '').toLowerCase();
    const content2 = (node2.content || '').toLowerCase();
    
    if (!content1 || !content2) return 0;
    
    const words1 = new Set(content1.split(/\s+/));
    const words2 = new Set(content2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  const analyzeDifficultyRelationship = (node1, node2) => {
    const diff1 = node1.difficulty_score || 1;
    const diff2 = node2.difficulty_score || 1;
    
    const diffDiff = Math.abs(diff1 - diff2);
    return Math.max(0, 1 - diffDiff);
  };

  const analyzeTemporalRelationship = (node1, node2) => {
    const date1 = new Date(node1.created_at || Date.now());
    const date2 = new Date(node2.created_at || Date.now());
    
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    return Math.max(0, 1 - daysDiff / 30); // Decay over 30 days
  };

  const calculateOverallSimilarity = (keyword, tag, content, difficulty, temporal) => {
    return (keyword * 0.3 + tag * 0.25 + content * 0.2 + difficulty * 0.15 + temporal * 0.1);
  };

  const determineConnectionType = (source, target, similarity) => {
    const diff1 = source.difficulty_score || 1;
    const diff2 = target.difficulty_score || 1;
    
    if (diff1 < diff2) return 'prerequisite';
    else if (similarity > 0.8) return 'related';
    else if (similarity > 0.6) return 'derives_from';
    else if (similarity > 0.4) return 'enhances';
    else return 'related';
  };

  const getConnectionColor = (type) => {
    const colors = {
      'prerequisite': 'oklch(0.6 0.15 27)',
      'related': 'oklch(0.6 0.15 240)',
      'derives_from': 'oklch(0.6 0.15 140)',
      'enhances': 'oklch(0.7 0.15 60)',
      'study_sequence': 'oklch(0.6 0.15 280)'
    };
    return colors[type] || 'oklch(0.4 0.04 240)';
  };

  const getNodeColor = (difficulty) => {
    const colors = {
      'beginner': 'oklch(0.6 0.15 140)',
      'intermediate': 'oklch(0.7 0.15 60)',
      'advanced': 'oklch(0.6 0.15 27)'
    };
    return colors[difficulty] || 'oklch(0.4 0.04 240)';
  };

  const getMasteryColor = (masteryLevel) => {
    if (masteryLevel >= 0.8) return 'oklch(0.6 0.15 140)';
    else if (masteryLevel >= 0.5) return 'oklch(0.7 0.15 60)';
    else return 'oklch(0.6 0.15 27)';
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
      <div className={`${isExpanded ? 'h-full w-full' : 'bg-paper-50 border border-paper-200 shadow-paper p-4'}`}>
        <h3 className="font-semibold text-ink-900 mb-2">Knowledge Graph</h3>
        <div className="text-center py-8 text-ink-600">
          <Network className="w-12 h-12 mx-auto mb-4 text-ink-400" />
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-1">Create notes to see your knowledge graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isExpanded ? 'h-full w-full flex flex-col' : 'bg-paper-50 border border-paper-200 shadow-paper p-4'}`}>
      {/* Enhanced Header with Controls */}
      <div className={`${isExpanded ? 'absolute top-4 right-4 z-40 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg' : 'flex items-center justify-between mb-4'}`}>
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-ink-900">Knowledge Graph</h3>
          <Badge variant="outline" className="text-xs">
            {filteredNotes.length} nodes
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIIndicators(!showAIIndicators)}
            className="h-8 w-8 p-0"
          >
            {showAIIndicators ? <Brain className="w-4 h-4" /> : <Brain className="w-4 h-4 text-ink-400" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMasteryLevels(!showMasteryLevels)}
            className="h-8 w-8 p-0"
          >
            {showMasteryLevels ? <Target className="w-4 h-4" /> : <Target className="w-4 h-4 text-ink-400" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDifficultyColors(!showDifficultyColors)}
            className="h-8 w-8 p-0"
          >
            {showDifficultyColors ? <BarChart3 className="w-4 h-4" /> : <BarChart3 className="w-4 h-4 text-ink-400" />}
          </Button>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className={`${isExpanded ? 'absolute top-4 left-4 z-40 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg' : 'flex items-center space-x-2 mb-4'}`}>
        <div className={`${isExpanded ? 'flex flex-col space-y-2' : 'flex-1'}`}>
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
          
          <div className={`${isExpanded ? 'flex space-x-2' : 'flex items-center space-x-2'}`}>
            <Select value={layoutMode} onValueChange={setLayoutMode}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force">Force</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="circular">Circular</SelectItem>
              </SelectContent>
            </Select>

            <Select value={animationSpeed} onValueChange={setAnimationSpeed}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Graph Container - Fixed for full screen */}
      <div 
        ref={svgRef} 
        className={`${isExpanded ? 'flex-1 w-full' : 'flex justify-center bg-paper-50 rounded-lg border border-paper-200'}`}
        style={isExpanded ? { height: 'calc(100vh - 200px)' } : {}}
      >
        {/* SVG will be inserted here */}
      </div>
      
      {/* Enhanced Legend */}
      <div className={`${isExpanded ? 'absolute bottom-4 left-4 z-40 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg' : 'mt-4 space-y-2'}`}>
        <div className="flex items-center justify-between text-xs text-ink-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-accent-green-500"></div>
              <span>Beginner</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-accent-blue-500"></div>
              <span>Intermediate</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-accent-red-500"></div>
              <span>Advanced</span>
            </div>
          </div>
          <div className="text-xs">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>
        
        <div className="text-xs text-ink-500 space-y-1">
          <p>• Click nodes to select notes • Hover for details • Thicker lines = stronger connections</p>
          <p>• Inner circle = mastery level • Purple dot = AI enhanced content</p>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNodeDetails && (
        <div className="mt-4 p-3 bg-paper-100 rounded-lg border border-paper-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-ink-900">{selectedNodeDetails.title}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNodeDetails(null)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-ink-600">
            <div>Difficulty: <span className="font-medium">{selectedNodeDetails.difficulty}</span></div>
            <div>Mastery: <span className="font-medium">{Math.round(selectedNodeDetails.mastery_level * 100)}%</span></div>
            <div>Reviews: <span className="font-medium">{selectedNodeDetails.review_count}</span></div>
            <div>AI Rating: <span className="font-medium">{Math.round(selectedNodeDetails.ai_rating * 100)}%</span></div>
          </div>
        </div>
      )}
    </div>
  );
}; 