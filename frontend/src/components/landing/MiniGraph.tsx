import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface MiniGraphProps {
  height?: number
}

export default function MiniGraph({ height = 360 }: MiniGraphProps) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    // Measure container width for better fit
    const parent = (ref.current.parentElement as HTMLElement) || document.body
    const width = Math.max(420, parent.clientWidth)

    const svg = d3
      .select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('border-radius', '12px')
      .style('background', '#ffffff')

    // Two clusters, diagonally placed, with mild cycles
    const total = 34
    const clusterA = Math.floor(total * 0.45)
    const clusterB = total - clusterA

    type NodeT = { id: number; cluster: number; x?: number; y?: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null }
    const nodes: NodeT[] = Array.from({ length: total }, (_, i) => ({ id: i, cluster: i < clusterA ? 0 : 1 }))

    const links: Array<{ source: number; target: number }> = []
    for (let i = 1; i < clusterA; i++) {
      const parentIdx = Math.floor(Math.random() * i)
      links.push({ source: parentIdx, target: i })
    }
    for (let i = clusterA + 1; i < total; i++) {
      const parentIdx = clusterA + Math.floor(Math.random() * (i - clusterA))
      links.push({ source: parentIdx, target: i })
    }
    const extraA = Math.floor(clusterA * 0.6)
    for (let k = 0; k < extraA; k++) {
      const a = Math.floor(Math.random() * clusterA)
      const b = Math.floor(Math.random() * clusterA)
      if (a !== b) links.push({ source: Math.min(a, b), target: Math.max(a, b) })
    }
    const extraB = Math.floor(clusterB * 0.5)
    for (let k = 0; k < extraB; k++) {
      const a = clusterA + Math.floor(Math.random() * clusterB)
      const b = clusterA + Math.floor(Math.random() * clusterB)
      if (a !== b) links.push({ source: Math.min(a, b), target: Math.max(a, b) })
    }

    const ORANGE = '#f97316'
    const ORANGE_DARK = '#ea580c'
    const LINK_COLOR = '#475569'

    const cxA = width * 0.35
    const cyA = height * 0.40
    const cxB = width * 0.65
    const cyB = height * 0.60
    const linkDist = Math.max(48, Math.min(width, height) * 0.17)

    const simulation = d3
      .forceSimulation(nodes as any)
      .alpha(1)
      .alphaDecay(0.06)
      .velocityDecay(0.35)
      .force('link', d3.forceLink(links as any).distance(linkDist).strength(0.95))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('x', d3.forceX<NodeT>().x((d) => (d.cluster === 0 ? cxA : cxB)).strength(0.14))
      .force('y', d3.forceY<NodeT>().y((d) => (d.cluster === 0 ? cyA : cyB)).strength(0.14))
      .force('collide', d3.forceCollide<NodeT>().radius(8).iterations(1))

    const link = svg
      .append('g')
      .attr('stroke', LINK_COLOR)
      .attr('stroke-opacity', 0.75)
      .attr('vector-effect', 'non-scaling-stroke')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 1.2)
      .attr('stroke-linecap', 'round')

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('fill', ORANGE)
      .attr('stroke', ORANGE_DARK)
      .attr('stroke-width', 1.2)
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGCircleElement, any>()
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
          })
      )

    node
      .on('mouseenter', function (_event, d: any) {
        d3.select(this).transition().duration(150).attr('r', 7)
        link
          .transition()
          .duration(150)
          .attr('stroke', (l: any) => (l.source === d || l.target === d ? ORANGE : LINK_COLOR))
          .attr('stroke-opacity', (l: any) => (l.source === d || l.target === d ? 0.95 : 0.25))
          .attr('stroke-width', (l: any) => (l.source === d || l.target === d ? 1.6 : 1))
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(150).attr('r', 5)
        link
          .transition()
          .duration(150)
          .attr('stroke', LINK_COLOR)
          .attr('stroke-opacity', 0.75)
          .attr('stroke-width', 1.2)
      })

    // Label a few nodes with titles
    const labelMap: Array<{ id: number; text: string }> = []
    // Choose safe representative ids based on cluster sizes
    if (clusterA >= 3) {
      labelMap.push({ id: 0, text: 'Japanese computers' })
      labelMap.push({ id: Math.floor(clusterA / 2), text: 'Kana input layouts' })
    }
    if (clusterB >= 3) {
      labelMap.push({ id: clusterA + 1, text: 'Ancient philosophy' })
      labelMap.push({ id: total - 2, text: 'Socratic method' })
    }

    const labels = svg
      .append('g')
      .selectAll('text')
      .data(labelMap)
      .enter()
      .append('text')
      .text((d) => d.text)
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('font-family', "var(--font-fallback-jp), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif")
      .attr('fill', '#1f2937')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('paint-order', 'stroke')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.9em')
      .style('pointer-events', 'none')

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)

      // position labels above their nodes
      labels
        .attr('x', (d) => nodes[d.id].x ?? 0)
        .attr('y', (d) => (nodes[d.id].y ?? 0) - 8)
    })

    return () => {
      simulation.stop()
      svg.selectAll('*').remove()
    }
  }, [height])

  return <svg ref={ref} style={{ width: '100%', height }} />
}
