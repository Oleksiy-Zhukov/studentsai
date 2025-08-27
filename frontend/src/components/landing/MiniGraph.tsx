'use client'

import React, { useEffect, useRef } from 'react'
import { select } from 'd3-selection'
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from 'd3-force'
import { drag } from 'd3-drag'

interface MiniGraphProps {
  height?: number
}

interface Node {
  id: number
  cluster?: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: Node | number
  target: Node | number
}

export default function MiniGraph({ height = 360 }: MiniGraphProps) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    // Measure container width for better fit
    const parent = (ref.current.parentElement as HTMLElement) || document.body
    const width = Math.max(420, parent.clientWidth)

    const svg = select(ref.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('border-radius', '12px')
      .style('background', '#ffffff')

    // Two clusters, diagonally placed, with mild cycles
    const total = 34
    const clusterA = Math.floor(total * 0.45)
    const clusterB = total - clusterA


    const nodes: Node[] = Array.from({ length: total }, (_, i) => ({ 
      id: i, 
      cluster: i < clusterA ? 0 : 1 
    }))

    const links: Link[] = []
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

    const simulation = forceSimulation(nodes)
      .alpha(1)
      .alphaDecay(0.06)
      .velocityDecay(0.35)
      .force('link', forceLink(links).distance(linkDist).strength(0.95))
      .force('charge', forceManyBody().strength(-200))
      .force('x', forceX<Node>().x((d) => (d.cluster === 0 ? cxA : cxB)).strength(0.14))
      .force('y', forceY<Node>().y((d) => (d.cluster === 0 ? cyA : cyB)).strength(0.14))
      .force('collide', forceCollide<Node>().radius(8).iterations(1))

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
        drag<SVGCircleElement, Node>()
          .on('start', (event, d: Node) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d: Node) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d: Node) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    node
      .on('mouseenter', function (_event, d: Node) {
        select(this).attr('r', 7)
        // Highlight connected links
        link
          .attr('stroke', (l: Link) => (l.source === d || l.target === d ? ORANGE : LINK_COLOR))
          .attr('stroke-opacity', (l: Link) => (l.source === d || l.target === d ? 0.95 : 0.25))
          .attr('stroke-width', (l: Link) => (l.source === d || l.target === d ? 1.6 : 1))
      })
      .on('mouseleave', function () {
        select(this).attr('r', 5)
        // Reset link appearance
        link
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
        .attr('x1', (d: Link) => (d.source as Node).x ?? 0)
        .attr('y1', (d: Link) => (d.source as Node).y ?? 0)
        .attr('x2', (d: Link) => (d.target as Node).x ?? 0)
        .attr('y2', (d: Link) => (d.target as Node).y ?? 0)

      node.attr('cx', (d: Node) => d.x ?? 0).attr('cy', (d: Node) => d.y ?? 0)

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
