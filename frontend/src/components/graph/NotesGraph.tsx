'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { select } from 'd3-selection'
import { zoom, type D3ZoomEvent } from 'd3-zoom'
import { drag, type D3DragEvent } from 'd3-drag'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum, type SimulationLinkDatum } from 'd3-force'
import { api, APIError, type GraphData, type GraphNode } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, RefreshCw } from 'lucide-react'

interface NotesGraphProps {
  onNodeClick: (nodeId: string) => void
}

// Extend GraphNode with D3.js simulation properties
interface GraphSimulationNode extends GraphNode, SimulationNodeDatum {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

// D3.js link interface
interface GraphSimulationLink extends SimulationLinkDatum<GraphSimulationNode> {
  source: GraphSimulationNode
  target: GraphSimulationNode
  similarity: number
  connection_type: string
}

export function NotesGraph({ onNodeClick }: NotesGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interactionMode, setInteractionMode] = useState<'repel' | 'attract'>('repel')
  const interactionModeRef = useRef<'repel' | 'attract'>(interactionMode)
  const isDraggingRef = useRef<boolean>(false)

  useEffect(() => {
    interactionModeRef.current = interactionMode
  }, [interactionMode])

  const loadGraphData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getNotesGraph()
      setGraphData(data)
    } catch (err) {
      console.error('Failed to load graph data:', err)
      if (err instanceof APIError) {
        setError(`Failed to load graph (status ${err.status}): ${err.message}`)
      } else {
        setError('Failed to load graph data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGraphData()
  }, [])

  const renderGraph = useCallback((): (() => void) | void => {
    if (!graphData || !svgRef.current) return

    // Validate graph data
    if (!graphData.nodes || !Array.isArray(graphData.nodes) || graphData.nodes.length === 0) {
      console.warn('No valid nodes found in graph data')
      return
    }

    if (!graphData.connections || !Array.isArray(graphData.connections)) {
      console.warn('No valid connections found in graph data')
      return
    }

    // Convert nodes to simulation nodes
    const simulationNodes: GraphSimulationNode[] = graphData.nodes.map(node => ({
      ...node,
      x: undefined,
      y: undefined,
      fx: null,
      fy: null
    }))

    // Create a map for quick node lookup
    const nodeMap = new Map(simulationNodes.map(node => [node.id, node]))

    // Filter and transform connections to D3.js format
    const validConnections: GraphSimulationLink[] = graphData.connections
      .filter(connection => {
        const sourceExists = nodeMap.has(connection.source_id)
        const targetExists = nodeMap.has(connection.target_id)
        return sourceExists && targetExists
      })
      .map(connection => ({
        source: nodeMap.get(connection.source_id)!,
        target: nodeMap.get(connection.target_id)!,
        similarity: connection.similarity || 0.5,
        connection_type: connection.connection_type || 'similarity'
      }))

    console.log('Graph data:', {
      nodes: simulationNodes.length,
      connections: validConnections.length,
      totalConnections: graphData.connections.length
    })

    const svg = select(svgRef.current)
    svg.selectAll('*').remove()

    // Responsive sizing based on container width
    const parent = (svgRef.current.parentElement as HTMLElement) || document.body
    const width = Math.max(600, parent.clientWidth)
    const height = 600
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    // Layers: zoom/pan on rootG, chart elements inside chartG with margins
    const defs = svg.append('defs')
    const glow = defs.append('filter')
      .attr('id', 'link-glow')
      .attr('height', '200%')
      .attr('width', '200%')
      .attr('x', '-50%')
      .attr('y', '-50%')
    glow.append('feGaussianBlur')
      .attr('stdDeviation', 2)
      .attr('result', 'coloredBlur')
    const feMerge = glow.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    const rootG = svg.append('g').attr('class', 'zoom-layer')
    const g = rootG.append('g')
      .attr('class', 'chart-layer')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Node radius helper
    const nodeRadius = (d: GraphSimulationNode) => Math.min(32, Math.sqrt((d.word_count || 100) / 10) + 8)

    // Forces
    const chargeForce = forceManyBody().strength(-260)

    // Create simulation with tuned forces to reduce jitter/overlap
    const simulation = forceSimulation<GraphSimulationNode>(simulationNodes)
      .force('link', forceLink<GraphSimulationNode, GraphSimulationLink>(validConnections)
        .id((d: GraphSimulationNode) => d.id)
        .distance(120)
        .strength(0.6))
      .force('charge', chargeForce)
      .force('center', forceCenter((width - margin.left - margin.right) / 2, (height - margin.top - margin.bottom) / 2))
      .force('collision', forceCollide<GraphSimulationNode>().radius((d: GraphSimulationNode) => nodeRadius(d) + 6).iterations(2))
      .alpha(1)
      .alphaDecay(0.06)
      .velocityDecay(0.5)

    // Link color by type for better visibility
    const linkColor = (d: GraphSimulationLink) => {
      if (d.connection_type && d.connection_type.toLowerCase().includes('backlink')) return '#fb923c' // orange-400
      if (d.connection_type && d.connection_type.toLowerCase().includes('keyword')) return '#60a5fa' // blue-400
      return '#94a3b8' // slate-400 fallback
    }

    // Create links
    const links = g.append('g')
      .selectAll('line')
      .data(validConnections)
      .enter()
      .append('line')
      .attr('stroke', (d: GraphSimulationLink) => linkColor(d))
      .attr('stroke-width', (d: GraphSimulationLink) => 1 + d.similarity * 2)
      .attr('stroke-opacity', 0.85)
      .style('filter', 'url(#link-glow)')

    // Create nodes
    const nodes = g.append('g')
      .selectAll('circle')
      .data(simulationNodes)
      .enter()
      .append('circle')
      .attr('r', (d: GraphSimulationNode) => nodeRadius(d))
      .attr('fill', '#f97316')
      .attr('stroke', '#ea580c')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(drag<SVGCircleElement, GraphSimulationNode>()
        .on('start', (event: D3DragEvent<SVGCircleElement, GraphSimulationNode, GraphSimulationNode | undefined>, d: GraphSimulationNode) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          // Adjust physics on drag start based on interaction mode
          if (interactionModeRef.current === 'attract') {
            chargeForce.strength(240)
          } else {
            chargeForce.strength(-300)
          }
          isDraggingRef.current = true
          // Suppress any tooltip while dragging
          select('body').selectAll('div.tooltip').style('visibility', 'hidden')
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event: D3DragEvent<SVGCircleElement, GraphSimulationNode, GraphSimulationNode | undefined>, d: GraphSimulationNode) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event: D3DragEvent<SVGCircleElement, GraphSimulationNode, GraphSimulationNode | undefined>, d: GraphSimulationNode) => {
          if (!event.active) simulation.alphaTarget(0)
          // Reset physics to default repel after drag ends
          chargeForce.strength(-260)
          isDraggingRef.current = false
          d.fx = null
          d.fy = null
        }))

    // Add click handler to nodes
    nodes.on('click', (_event: MouseEvent, d: GraphSimulationNode) => {
      onNodeClick(d.id)
    })

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(simulationNodes)
      .enter()
      .append('text')
      .text((d: GraphSimulationNode) => (d.title || 'Untitled').length > 20 ? (d.title || 'Untitled').substring(0, 20) + '...' : (d.title || 'Untitled'))
      .attr('font-size', '12px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('fill', '#374151')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('paint-order', 'stroke')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('pointer-events', 'none')

    // Add tooltips (clean any existing first) and configure interactions
    select('body').selectAll('div.tooltip').remove()
    const tooltip = select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('max-width', '200px')
      .style('z-index', '1000')

    let hoverTimeout: ReturnType<typeof setTimeout> | null = null
    const showTooltip = (html: string) => {
      tooltip.style('visibility', 'visible').html(html)
    }
    const hideTooltip = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
      }
      tooltip.style('visibility', 'hidden')
    }

    // Precompute neighbors for highlighting
    const neighborMap = new Map<string, Set<string>>()
    validConnections.forEach((l) => {
      const s = String(l.source.id)
      const t = String(l.target.id)
      if (!neighborMap.has(s)) neighborMap.set(s, new Set<string>())
      if (!neighborMap.has(t)) neighborMap.set(t, new Set<string>())
      neighborMap.get(s)!.add(t)
      neighborMap.get(t)!.add(s)
    })

    const dimRest = (id: string) => {
      nodes.style('opacity', (d: GraphSimulationNode) => (d.id === id || neighborMap.get(String(id))?.has(String(d.id)) ? 1 : 0.25))
      labels.style('opacity', (d: GraphSimulationNode) => (d.id === id || neighborMap.get(String(id))?.has(String(d.id)) ? 1 : 0.25))
      links
        .attr('stroke-opacity', (l: GraphSimulationLink) => (l.source.id === id || l.target.id === id ? 1 : 0.15))
        .attr('stroke-width', (l: GraphSimulationLink) => (l.source.id === id || l.target.id === id ? 2.5 + l.similarity * 2 : 1 + l.similarity * 1.5))
    }

    const clearDim = () => {
      nodes.style('opacity', 1)
      labels.style('opacity', 1)
      links
        .attr('stroke-opacity', 0.85)
        .attr('stroke-width', (d: GraphSimulationLink) => 1 + d.similarity * 2)
    }

    nodes
      .on('mouseover', (_event: MouseEvent, d: GraphSimulationNode) => {
        if (isDraggingRef.current) return
        if (hoverTimeout) clearTimeout(hoverTimeout)
        hoverTimeout = setTimeout(() => {
          if (isDraggingRef.current) return
          dimRest(String(d.id))
          showTooltip(`
            <strong>${d.title || 'Untitled'}</strong><br/>
            ${d.content_preview || 'No preview available'}<br/>
            <em>${d.word_count || 0} words</em>
          `)
        }, 250)
      })
      .on('mousemove', (event: MouseEvent) => {
        if (tooltip.style('visibility') === 'visible') {
          tooltip.style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px')
        }
      })
      .on('mouseout', () => {
        hideTooltip()
        clearDim()
      })

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: GraphSimulationLink) => d.source.x || 0)
        .attr('y1', (d: GraphSimulationLink) => d.source.y || 0)
        .attr('x2', (d: GraphSimulationLink) => d.target.x || 0)
        .attr('y2', (d: GraphSimulationLink) => d.target.y || 0)

      nodes
        .attr('cx', (d: GraphSimulationNode) => d.x || 0)
        .attr('cy', (d: GraphSimulationNode) => d.y || 0)

      labels
        .attr('x', (d: GraphSimulationNode) => d.x || 0)
        .attr('y', (d: GraphSimulationNode) => (d.y || 0) + nodeRadius(d) + 13)
    })

    // Hide tooltip on clicks
    const onAnyClick = () => {
      select('body').selectAll('div.tooltip').style('visibility', 'hidden')
    }
    document.addEventListener('click', onAnyClick)

    // Stop simulation when stabilized to reduce jitter
    simulation.on('end', () => {
      simulation.alphaTarget(0)
    })

    // Zoom & pan
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        rootG.attr('transform', event.transform.toString())
      })

    svg.call(zoomBehavior)

    // Cleanup function
    return () => {
      tooltip.remove()
      simulation.stop()
      svg.on('.zoom', null)
      document.removeEventListener('click', onAnyClick)
    }
  }, [graphData, onNodeClick])

  useEffect(() => {
    if (!graphData || !svgRef.current) return
    const cleanup = renderGraph()
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [graphData, renderGraph])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Notes Graph</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading graph...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Notes Graph</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <Button onClick={loadGraphData}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Notes Graph</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes to visualize</h3>
            <p className="text-gray-600">Create at least 2 notes to see connections between them.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Notes Graph</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${interactionMode === 'repel' ? 'bg-orange-50 text-orange-700' : 'bg-white text-gray-700'} hover:bg-orange-50`}
                onClick={() => setInteractionMode('repel')}
              >
                Repel
              </button>
              <button
                className={`px-3 py-1 text-sm border-l border-gray-200 ${interactionMode === 'attract' ? 'bg-orange-50 text-orange-700' : 'bg-white text-gray-700'} hover:bg-orange-50`}
                onClick={() => setInteractionMode('attract')}
              >
                Attract
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadGraphData}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Visualizing {graphData.nodes.length} notes with {graphData.connections?.length || 0} connections.
          Click on nodes to view notes, drag to rearrange.
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg ref={svgRef} className="border border-gray-200 rounded"></svg>
        </div>
      </CardContent>
    </Card>
  )
}

