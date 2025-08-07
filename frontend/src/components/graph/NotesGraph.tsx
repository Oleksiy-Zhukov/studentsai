'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { api, type GraphData, type GraphNode, type GraphConnection } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, RefreshCw } from 'lucide-react'

interface NotesGraphProps {
  onNodeClick: (nodeId: string) => void
}

// Extend GraphNode with D3.js simulation properties
interface SimulationNode extends GraphNode, d3.SimulationNodeDatum {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

// D3.js link interface
interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: SimulationNode
  target: SimulationNode
  similarity: number
  connection_type: string
}

export function NotesGraph({ onNodeClick }: NotesGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadGraphData()
  }, [])

  useEffect(() => {
    if (graphData && svgRef.current) {
      renderGraph()
    }
  }, [graphData])

  const loadGraphData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getNotesGraph()
      setGraphData(data)
    } catch (err) {
      console.error('Failed to load graph data:', err)
      setError('Failed to load graph data')
    } finally {
      setLoading(false)
    }
  }

  const renderGraph = () => {
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
    const simulationNodes: SimulationNode[] = graphData.nodes.map(node => ({
      ...node,
      x: undefined,
      y: undefined,
      fx: null,
      fy: null
    }))

    // Create a map for quick node lookup
    const nodeMap = new Map(simulationNodes.map(node => [node.id, node]))

    // Filter and transform connections to D3.js format
    const validConnections: SimulationLink[] = graphData.connections
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

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    svg.attr('width', width).attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create simulation with proper typing
    const simulation = d3.forceSimulation<SimulationNode>(simulationNodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(validConnections)
        .id((d: SimulationNode) => d.id)
        .distance(100)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create links
    const links = g.append('g')
      .selectAll('line')
      .data(validConnections)
      .enter()
      .append('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', (d) => Math.sqrt(d.similarity * 5))
      .attr('stroke-opacity', 0.6)

    // Create nodes
    const nodes = g.append('g')
      .selectAll('circle')
      .data(simulationNodes)
      .enter()
      .append('circle')
      .attr('r', (d) => Math.sqrt((d.word_count || 100) / 10) + 8)
      .attr('fill', '#f97316')
      .attr('stroke', '#ea580c')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, SimulationNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }))

    // Add click handler to nodes
    nodes.on('click', (event, d) => {
      onNodeClick(d.id)
    })

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(simulationNodes)
      .enter()
      .append('text')
      .text((d) => (d.title || 'Untitled').length > 20 ? (d.title || 'Untitled').substring(0, 20) + '...' : (d.title || 'Untitled'))
      .attr('font-size', '12px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('fill', '#374151')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('pointer-events', 'none')

    // Add tooltips
    const tooltip = d3.select('body').append('div')
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

    nodes
      .on('mouseover', (event, d) => {
        tooltip.style('visibility', 'visible')
          .html(`
            <strong>${d.title || 'Untitled'}</strong><br/>
            ${d.content_preview || 'No preview available'}<br/>
            <em>${d.word_count || 0} words</em>
          `)
      })
      .on('mousemove', (event) => {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden')
      })

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: SimulationLink) => d.source.x || 0)
        .attr('y1', (d: SimulationLink) => d.source.y || 0)
        .attr('x2', (d: SimulationLink) => d.target.x || 0)
        .attr('y2', (d: SimulationLink) => d.target.y || 0)

      nodes
        .attr('cx', (d: SimulationNode) => d.x || 0)
        .attr('cy', (d: SimulationNode) => d.y || 0)

      labels
        .attr('x', (d: SimulationNode) => d.x || 0)
        .attr('y', (d: SimulationNode) => (d.y || 0) + 25)
    })

    // Cleanup function
    return () => {
      tooltip.remove()
      simulation.stop()
    }
  }

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

