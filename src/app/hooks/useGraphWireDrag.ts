"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { edgeBetweenPorts, type GraphPort } from "@/app/lib/graph-wires";
import {
  connectionError,
  type GraphEdge,
  type TransferGraph,
} from "@/app/lib/transfer-graph";

type WireDrag = {
  anchor: GraphPort;
  original?: GraphEdge;
  point: { x: number; y: number };
  target: GraphPort | null;
  error: string | null;
  moved: boolean;
  pointerId: number;
  startX: number;
  startY: number;
};

export function useGraphWireDrag({
  graph,
  world,
  zoom,
  disabled,
  commit,
  announce,
  validate,
}: {
  graph: { nodes: { id: string }[]; edges: GraphEdge[] };
  world: RefObject<HTMLDivElement | null>;
  zoom: number;
  disabled: boolean;
  commit: (edge: GraphEdge, original?: GraphEdge) => void;
  announce: (message: string) => void;
  validate?: (edge: GraphEdge, original?: GraphEdge) => string | null;
}) {
  const [draft, setDraft] = useState<WireDrag | null>(null);
  const session = useRef<WireDrag | null>(null);
  const suppressUntil = useRef(0);
  const localPoint = (x: number, y: number) => {
    const rect = world.current?.getBoundingClientRect();
    return {
      x: (x - (rect?.left ?? 0)) / zoom,
      y: (y - (rect?.top ?? 0)) / zoom,
    };
  };
  const cancel = () => {
    session.current = null;
    setDraft(null);
  };
  useEffect(() => {
    if (!draft) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        session.current = null;
        setDraft(null);
        announce("Wire drag cancelled. Existing connections kept.");
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [draft, announce]);
  const start = (
    event: ReactPointerEvent<Element>,
    anchor: GraphPort,
    original?: GraphEdge,
  ) => {
    if (disabled || event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const next: WireDrag = {
      anchor,
      original,
      point: localPoint(event.clientX, event.clientY),
      target: null,
      error: null,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    session.current = next;
    setDraft(next);
  };
  const track = (event: ReactPointerEvent<Element>) => {
    const current = session.current;
    if (!current || current.pointerId !== event.pointerId) return null;
    const element = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-graph-port]");
    const target: GraphPort | null =
      element && world.current?.contains(element)
        ? {
            node: element.dataset.node ?? "",
            direction:
              element.dataset.graphPort === "output" ? "output" : "input",
            input: Number(element.dataset.input ?? 0),
          }
        : null;
    const edge = target ? edgeBetweenPorts(current.anchor, target) : null;
    const error = target
      ? edge
        ? validate
          ? validate(edge, current.original)
          : connectionError(
              graph.nodes as TransferGraph["nodes"],
              graph.edges.filter((link) => link !== current.original),
              edge,
            )
        : "Connect an output to an input."
      : null;
    const next = {
      ...current,
      point: localPoint(event.clientX, event.clientY),
      moved:
        current.moved ||
        Math.hypot(
          event.clientX - current.startX,
          event.clientY - current.startY,
        ) > 4,
      target,
      error,
    };
    session.current = next;
    setDraft(next);
    return next;
  };
  const finish = (event: ReactPointerEvent<Element>) => {
    const current = track(event);
    if (!current) return;
    cancel();
    if (!current.moved) return;
    suppressUntil.current = performance.now() + 300;
    const edge = current.target
      ? edgeBetweenPorts(current.anchor, current.target)
      : null;
    if (edge && !current.error && !disabled) commit(edge, current.original);
    else
      announce(
        current.error || "Drop on a matching port. Existing connections kept.",
      );
  };
  return {
    draft,
    start,
    track,
    finish,
    cancel,
    suppressClick: () => performance.now() < suppressUntil.current,
  };
}
