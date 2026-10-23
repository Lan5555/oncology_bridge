import type { GraphEdge, GraphNode } from "./transfer-graph";

export type GraphPort = {
  node: string;
  direction: "input" | "output";
  input: number;
};
export const GRAPH_NODE_WIDTH = 260;
export const PORT_OFFSET_Y = 71;

/** Normalize both drag directions into the same typed edge. */
export function edgeBetweenPorts(a: GraphPort, b: GraphPort): GraphEdge | null {
  if (a.direction === b.direction) return null;
  const output = a.direction === "output" ? a : b;
  const input = a.direction === "input" ? a : b;
  return { from: output.node, to: input.node, input: input.input };
}
export function portPoint(
  nodes: Pick<GraphNode, "id" | "x" | "y">[],
  port: GraphPort,
): { x: number; y: number } | null {
  const node = nodes.find((item) => item.id === port.node);
  return node
    ? {
        x: node.x + (port.direction === "output" ? GRAPH_NODE_WIDTH : 0),
        y:
          node.y +
          PORT_OFFSET_Y +
          (port.direction === "input" ? port.input * 32 : 0),
      }
    : null;
}
export function wireCurve(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const bend = Math.max(70, Math.abs(to.x - from.x) / 2);
  return `M${from.x},${from.y} C${from.x + bend},${from.y} ${to.x - bend},${to.y} ${to.x},${to.y}`;
}
