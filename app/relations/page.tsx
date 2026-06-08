"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CATEGORIES } from "@/lib/types";

interface RelationTriple {
  subject: string;
  subjectLabel: string;
  subjectType: string;
  predicate: string;
  object: string;
  objectLabel: string;
  objectType: string;
}

interface NodeData {
  id: string;
  label: string;
  type: string;
}

interface PositionedNode extends NodeData {
  x: number;
  y: number;
}

interface Connection {
  // source -> target follow the semantic direction (subject -> object)
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  key: string;
  // ids of both endpoints, used for hover highlighting
  a: string;
  b: string;
  // true when this edge links two satellites (only drawn on hover)
  inter: boolean;
}

// Human-friendly labels for each ontology predicate (no raw RDF terms)
const PREDICATE_LABELS: Record<string, string> = {
  isFrameworkOf: "framework of",
  isORMFor: "ORM for",
  isBuiltOn: "built on",
  implementsSpec: "implements",
  usesLanguage: "uses language",
  compatibleWith: "compatible with",
  alternativeTo: "alternative to",
  alternatives: "alternative to",
  connectsTo: "connects to",
  integratesWith: "integrates with",
  testedWith: "tested with",
  deployedOn: "deployed on",
  managedBy: "managed by",
  hostedBy: "hosted on",
  monitoredBy: "monitored by",
  ciWith: "CI/CD with",
  usesBroker: "uses broker",
  searchedWith: "searched with",
  storedWith: "stored with",
  designedWith: "designed with",
  versionControlledBy: "version controlled by",
  databases: "supports",
};

function formatPredicate(prop: string): string {
  if (PREDICATE_LABELS[prop]) return PREDICATE_LABELS[prop];
  // Fallback: split camelCase / snake_case into readable words
  return prop
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .trim();
}

export default function RelationsMapPage() {
  const router = useRouter();
  const [relations, setRelations] = useState<RelationTriple[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected/centered node in the graph
  const [focusNodeId, setFocusNodeId] = useState<string>("NextJS");

  // Hovered satellite id (for highlighting its edge + showing the predicate)
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Active sidebar category filter (drives the focus dropdown + node emphasis)
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Graph view states
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Track whether the pointer actually moved, so a drag doesn't fire a click
  const movedRef = useRef(false);

  // Fetch relations on load
  useEffect(() => {
    fetch("/api/relations")
      .then((r) => r.json())
      .then((data: RelationTriple[]) => {
        setRelations(data);
        // Default focus to NextJS if present, otherwise first available subject
        const nextJsNode = data.find((t) => t.subject === "NextJS" || t.object === "NextJS");
        if (nextJsNode) {
          setFocusNodeId("NextJS");
        } else if (data.length > 0) {
          setFocusNodeId(data[0].subject);
        }
      })
      .catch((err) => console.error("Error loading relations:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Center coordinate of the (square) graph canvas
  const size = 600;
  const cx = size / 2;
  const cy = size / 2;

  // Build the graph for the focused node
  const { centerNode, satellites, connections, nodeD } = useMemo<{
    centerNode: NodeData | null;
    satellites: PositionedNode[];
    connections: Connection[];
    nodeD: number;
  }>(() => {
    if (relations.length === 0) return { centerNode: null, satellites: [], connections: [], nodeD: 80 };

    const centerTriple = relations.find((r) => r.subject === focusNodeId || r.object === focusNodeId);
    if (!centerTriple) return { centerNode: null, satellites: [], connections: [], nodeD: 80 };

    const centerNode: NodeData = {
      id: focusNodeId,
      label: centerTriple.subject === focusNodeId ? centerTriple.subjectLabel : centerTriple.objectLabel,
      type: centerTriple.subject === focusNodeId ? centerTriple.subjectType : centerTriple.objectType,
    };

    // First-degree neighbors
    const neighbors = new Map<string, NodeData>();
    relations.forEach((rel) => {
      if (rel.subject === focusNodeId && rel.object !== focusNodeId) {
        neighbors.set(rel.object, { id: rel.object, label: rel.objectLabel, type: rel.objectType });
      } else if (rel.object === focusNodeId && rel.subject !== focusNodeId) {
        neighbors.set(rel.subject, { id: rel.subject, label: rel.subjectLabel, type: rel.subjectType });
      }
    });

    const satList = Array.from(neighbors.values());
    const count = satList.length;

    // Node diameter shrinks as the graph gets busier so labels stop colliding
    const nodeD = count > 24 ? 54 : count > 14 ? 66 : 80;
    const half = nodeD / 2;
    const centerR = 64; // radius of the center node (w-32)

    // Distribute satellites across concentric rings. Each ring holds as many
    // nodes as its circumference allows, so nothing overlaps even at 35+ nodes.
    const arcSpacing = nodeD + 14; // min center-to-center distance along a ring
    const ringGap = nodeD + 24; // radial distance between rings
    const firstR = centerR + half + (count <= 8 ? 56 : 28);

    const ringSizes: number[] = [];
    let remaining = count;
    let r = firstR;
    while (remaining > 0) {
      const cap = Math.max(1, Math.floor((2 * Math.PI * r) / arcSpacing));
      const take = Math.min(cap, remaining);
      ringSizes.push(take);
      remaining -= take;
      r += ringGap;
    }

    const positionedSatellites: PositionedNode[] = [];
    let idx = 0;
    ringSizes.forEach((take, ring) => {
      const ringR = firstR + ring * ringGap;
      // Offset alternating rings by half a step so spokes don't align radially
      const angleOffset = ring % 2 === 0 ? 0 : Math.PI / take;
      for (let k = 0; k < take; k++) {
        const sat = satList[idx++];
        const angle = (k / take) * Math.PI * 2 - Math.PI / 2 + angleOffset;
        positionedSatellites.push({
          ...sat,
          x: cx + ringR * Math.cos(angle),
          y: cy + ringR * Math.sin(angle),
        });
      }
    });

    const connections: Connection[] = [];

    // Center <-> satellite edges (oriented along the semantic subject -> object direction)
    positionedSatellites.forEach((sat) => {
      const directRel = relations.find(
        (r) => (r.subject === focusNodeId && r.object === sat.id) || (r.subject === sat.id && r.object === focusNodeId)
      );
      const centerIsSubject = directRel ? directRel.subject === focusNodeId : true;
      // Trim both ends to the node rims so spokes fan out cleanly instead of
      // piling up at the exact center point.
      const ang = Math.atan2(sat.y - cy, sat.x - cx);
      const centerPt = { x: cx + Math.cos(ang) * (centerR + 6), y: cy + Math.sin(ang) * (centerR + 6) };
      const satPt = { x: sat.x - Math.cos(ang) * (half + 6), y: sat.y - Math.sin(ang) * (half + 6) };
      connections.push({
        x1: centerIsSubject ? centerPt.x : satPt.x,
        y1: centerIsSubject ? centerPt.y : satPt.y,
        x2: centerIsSubject ? satPt.x : centerPt.x,
        y2: centerIsSubject ? satPt.y : centerPt.y,
        label: directRel ? formatPredicate(directRel.predicate) : "related to",
        key: `center-${sat.id}`,
        a: focusNodeId,
        b: sat.id,
        inter: false,
      });
    });

    // Edges between satellites that are themselves related (drawn only on hover)
    for (let i = 0; i < positionedSatellites.length; i++) {
      for (let j = i + 1; j < positionedSatellites.length; j++) {
        const satA = positionedSatellites[i];
        const satB = positionedSatellites[j];
        const innerRel = relations.find(
          (r) => (r.subject === satA.id && r.object === satB.id) || (r.subject === satB.id && r.object === satA.id)
        );
        if (innerRel) {
          const aIsSubject = innerRel.subject === satA.id;
          const src = aIsSubject ? satA : satB;
          const dst = aIsSubject ? satB : satA;
          // Trim both ends to the satellite rims as well.
          const ang = Math.atan2(dst.y - src.y, dst.x - src.x);
          connections.push({
            x1: src.x + Math.cos(ang) * (half + 6),
            y1: src.y + Math.sin(ang) * (half + 6),
            x2: dst.x - Math.cos(ang) * (half + 6),
            y2: dst.y - Math.sin(ang) * (half + 6),
            label: formatPredicate(innerRel.predicate),
            key: `inter-${satA.id}-${satB.id}`,
            a: satA.id,
            b: satB.id,
            inter: true,
          });
        }
      }
    }

    return { centerNode, satellites: positionedSatellites, connections, nodeD };
  }, [relations, focusNodeId, cx, cy]);

  // Scale needed for the whole graph to fit inside the 600px canvas
  const fitScale = useMemo(() => {
    if (satellites.length === 0) return 1;
    const maxR = Math.max(...satellites.map((s) => Math.hypot(s.x - cx, s.y - cy)));
    return Math.min(1, Math.max(0.5, 290 / (maxR + nodeD / 2)));
  }, [satellites, nodeD, cx, cy]);

  // Re-fit whenever the focus node changes
  useEffect(() => {
    setScale(fitScale);
    setPan({ x: 0, y: 0 });
  }, [focusNodeId, fitScale]);

  // All selectable nodes, sorted by label
  const allNodes = useMemo(() => {
    const nodesMap = new Map<string, string>();
    relations.forEach((r) => {
      nodesMap.set(r.subject, r.subjectLabel);
      nodesMap.set(r.object, r.objectLabel);
    });
    return Array.from(nodesMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [relations]);

  // Lookup: node id -> its category/type
  const nodeTypeById = useMemo(() => {
    const m = new Map<string, string>();
    relations.forEach((r) => {
      m.set(r.subject, r.subjectType);
      m.set(r.object, r.objectType);
    });
    return m;
  }, [relations]);

  // How many nodes exist per category (drives sidebar badges + disabled state)
  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    nodeTypeById.forEach((type) => {
      c[type] = (c[type] || 0) + 1;
    });
    return c;
  }, [nodeTypeById]);

  // Nodes shown in the focus dropdown, narrowed by the active category
  const visibleNodes = useMemo(() => {
    if (activeCategory === "all") return allNodes;
    return allNodes.filter(([id]) => nodeTypeById.get(id) === activeCategory);
  }, [allNodes, activeCategory, nodeTypeById]);

  // Mouse handlers for dragging / panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    movedRef.current = false;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    movedRef.current = true;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom (zoom toward the cursor feel by keeping pan, clamped 0.5–2.5)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setScale((s) => Math.min(2.5, Math.max(0.4, +(s + delta).toFixed(2))));
  };

  const focusOn = (id: string) => {
    setFocusNodeId(id);
    setHoveredId(null);
    // If we focus a node outside the active category filter, clear the filter
    setActiveCategory((cur) => (cur !== "all" && nodeTypeById.get(id) !== cur ? "all" : cur));
    // scale + pan are re-fitted by the effect above
  };

  // Sidebar category click: filter the graph context to that category and
  // jump focus to the first matching technology (stays on this page).
  const selectCategory = (cat: string) => {
    if (cat === "all") {
      setActiveCategory("all");
      return;
    }
    const first = allNodes.find(([id]) => nodeTypeById.get(id) === cat);
    if (!first) return; // no nodes of this category — ignore the click
    setActiveCategory(cat);
    focusOn(first[0]);
  };

  // Zoom control helpers
  const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.4, +(s - 0.1).toFixed(2)));
  const zoomReset = () => {
    setScale(fitScale);
    setPan({ x: 0, y: 0 });
  };

  // Color mapping based on category style
  const getNodeColor = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
      case "framework":
        return "border-[#38bdf8] text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.2)] bg-[#38bdf8]/5";
      case "database":
      case "triplestore":
        return "border-[#f97316] text-[#f97316] shadow-[0_0_15px_rgba(249,115,22,0.2)] bg-[#f97316]/5";
      case "language":
      case "runtime":
        return "border-[#2563eb] text-[#2563eb] shadow-[0_0_15px_rgba(37,99,235,0.2)] bg-[#2563eb]/5";
      case "apitool":
      case "semanticwebspec":
        return "border-[#14b8a6] text-[#14b8a6] shadow-[0_0_15px_rgba(20,184,166,0.2)] bg-[#14b8a6]/5";
      case "buildtool":
      case "packagemanager":
      case "linter":
      case "monorepo":
        return "border-[#10b981] text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-[#10b981]/5";
      case "testingtool":
        return "border-[#eab308] text-[#eab308] shadow-[0_0_15px_rgba(234,179,8,0.2)] bg-[#eab308]/5";
      case "deploymenttool":
        return "border-[#f43f5e] text-[#f43f5e] shadow-[0_0_15px_rgba(244,63,94,0.2)] bg-[#f43f5e]/5";
      case "orm":
        return "border-[#f59e0b] text-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-[#f59e0b]/5";
      case "cssframework":
        return "border-[#06b6d4] text-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-[#06b6d4]/5";
      default: // library, uicomponentlib, animation, statemanagement, authtool etc.
        return "border-[#a78bfa] text-[#a78bfa] shadow-[0_0_15px_rgba(167,139,250,0.2)] bg-[#a78bfa]/5";
    }
  };


  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1] font-body selection:bg-primary selection:text-on-primary">
      <Navbar />

      <div className="flex pt-16 min-h-screen">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-[#1b1b1b] border-r border-[#333333] py-6 overflow-y-auto">
          <div className="px-5 mb-2">
            <p className="text-[10px] font-mono text-[#5f5f5f] uppercase tracking-widest">Filter by category</p>
          </div>
          <div className="flex flex-col gap-1 px-2">
            {CATEGORIES.map((cat) => {
              const count = cat.value === "all" ? nodeTypeById.size : categoryCounts[cat.value] || 0;
              const isActive = activeCategory === cat.value;
              const isEmpty = count === 0;
              return (
                <button
                  key={cat.value}
                  type="button"
                  disabled={isEmpty}
                  onClick={() => selectCategory(cat.value)}
                  title={isEmpty ? `${cat.label} (no relations)` : `Focus on ${cat.label}`}
                  className={`flex items-center gap-3 text-left w-full pl-4 pr-3 py-3 rounded-lg duration-150 ease-in-out font-body text-xs border-l-2 ${
                    isActive
                      ? "bg-[#2a2a2a] text-[#b4c5ff] border-[#b4c5ff]"
                      : isEmpty
                      ? "text-[#5a5a5a] border-transparent cursor-not-allowed"
                      : "text-[#c3c6d7] border-transparent hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {cat.value === "all" ? "hub" :
                     cat.value === "Language" ? "code" :
                     cat.value === "Framework" ? "architecture" :
                     cat.value === "Library" ? "library_books" :
                     cat.value === "Database" ? "database" : "terminal"}
                  </span>
                  <span className="flex-1 truncate">{cat.label}</span>
                  {!isEmpty && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? "bg-[#b4c5ff]/15 text-[#b4c5ff]" : "bg-[#333333] text-[#838383]"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto px-4 pt-6 border-t border-[#333333] flex flex-col gap-1">
            <Link
              href="/"
              className="w-full bg-[#2a2a2a] text-center text-[#e5e2e1] py-2 rounded mb-4 font-mono text-xs hover:bg-[#2563eb] hover:text-[#eeefff] transition-all block"
            >
              Back to Explorer
            </Link>
          </div>
        </aside>

        {/* Main Graph Content */}
        <main className="flex-1 lg:ml-64 p-8 min-h-screen">
          <div className="max-w-[1200px] mx-auto w-full">
            {/* Title Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="font-headline text-3xl font-bold text-[#e5e2e1] mb-2">Semantic Relation Map</h1>
                <p className="text-sm text-[#838383]">
                  An ontology graph of how technologies relate. Click a satellite node to shift focus, or click the
                  center node to open its detail page.
                </p>
                {activeCategory !== "all" && (
                  <button
                    onClick={() => setActiveCategory("all")}
                    className="mt-3 inline-flex items-center gap-1.5 bg-[#b4c5ff]/10 border border-[#b4c5ff]/30 text-[#b4c5ff] text-[11px] font-mono rounded-full pl-3 pr-2 py-1 hover:bg-[#b4c5ff]/20 transition-colors"
                  >
                    <span>Filter: {CATEGORIES.find((c) => c.value === activeCategory)?.label ?? activeCategory}</span>
                    {/* clear filter */}
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>

              {/* Focus Node Selector */}
              {!isLoading && relations.length > 0 && (
                <div className="flex items-center gap-3 bg-[#1b1b1b] border border-[#333333] px-4 py-2.5 rounded-xl shadow-md">
                  <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">center_focus_weak</span>
                  <label className="text-[11px] text-[#838383] font-mono uppercase tracking-wider whitespace-nowrap">Focus on:</label>
                  <select
                    value={focusNodeId}
                    onChange={(e) => focusOn(e.target.value)}
                    className="bg-[#131313] border border-[#333333] text-[#e5e2e1] text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b4c5ff] cursor-pointer"
                  >
                    {visibleNodes.map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Loading placeholder */}
            {isLoading && (
              <div className="h-[600px] bg-[#0e0e0e]/40 rounded-xl border border-[#333333] flex flex-col items-center justify-center">
                <div className="skeleton w-32 h-32 rounded-full mb-4" />
                <div className="skeleton w-48 h-4 rounded" />
              </div>
            )}

            {!isLoading && centerNode && (
              <div
                className="relative h-[600px] bg-[#0e0e0e]/50 border border-[#333333] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                {/* Grid Dots */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

                {/* Control Panel (Zoom) */}
                <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                    title="Zoom in"
                    className="w-10 h-10 bg-[#1b1b1b] border border-[#333333] hover:border-[#b4c5ff] text-[#e5e2e1] rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                    title="Zoom out"
                    className="w-10 h-10 bg-[#1b1b1b] border border-[#333333] hover:border-[#b4c5ff] text-[#e5e2e1] rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                  >
                    -
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); zoomReset(); }}
                    title="Reset view"
                    className="w-10 h-10 bg-[#1b1b1b] border border-[#333333] hover:border-[#b4c5ff] text-[#e5e2e1] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">fit_screen</span>
                  </button>
                </div>

                {/* Info chip: focus + neighbor count + zoom level */}
                <div className="absolute top-6 right-6 z-30 flex items-center gap-3 bg-[#131313]/95 border border-[#333333] rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-mono text-[#838383] uppercase tracking-wider">Focus</span>
                    <span className="text-xs font-bold text-[#e5e2e1]">{centerNode.label}</span>
                  </div>
                  <span className="w-px h-7 bg-[#333333]" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-mono text-[#838383] uppercase tracking-wider">Relations</span>
                    <span className="text-xs font-bold text-[#b4c5ff]">{satellites.length}</span>
                  </div>
                  <span className="w-px h-7 bg-[#333333]" />
                  <span className="text-[11px] font-mono text-[#838383]">{Math.round(scale * 100)}%</span>
                </div>

                {/* Legend Box */}
                {(() => {
                  const activeTypes = new Set<string>();
                  if (centerNode) activeTypes.add(centerNode.type.toLowerCase());
                  satellites.forEach((sat) => activeTypes.add(sat.type.toLowerCase()));

                  const allMappedKeys = [
                    "framework", "database", "triplestore", "language", "runtime",
                    "apitool", "semanticwebspec", "buildtool", "packagemanager",
                    "linter", "monorepo", "testingtool", "deploymenttool", "orm", "cssframework",
                  ];

                  const legendItems = [
                    { keys: ["framework"], label: "Frameworks", color: "bg-[#38bdf8]" },
                    { keys: ["database", "triplestore"], label: "Databases & Triplestores", color: "bg-[#f97316]" },
                    { keys: ["language", "runtime"], label: "Languages & Runtimes", color: "bg-[#2563eb]" },
                    { keys: ["library"], label: "Libraries & Helpers", color: "bg-[#a78bfa]", checkFallback: true },
                    { keys: ["apitool", "semanticwebspec"], label: "APIs & Specifications", color: "bg-[#14b8a6]" },
                    { keys: ["buildtool", "packagemanager", "linter", "monorepo"], label: "Build Tools & DevOps", color: "bg-[#10b981]" },
                    { keys: ["testingtool"], label: "Testing Tools", color: "bg-[#eab308]" },
                    { keys: ["deploymenttool"], label: "Deployment & Hosting", color: "bg-[#f43f5e]" },
                    { keys: ["orm"], label: "ORMs & Builders", color: "bg-[#f59e0b]" },
                    { keys: ["cssframework"], label: "CSS Frameworks", color: "bg-[#06b6d4]" },
                  ];

                  const visibleLegendItems = legendItems.filter((item) => {
                    const hasDirectKey = item.keys.some((k) => activeTypes.has(k));
                    if (hasDirectKey) return true;
                    if (item.checkFallback) {
                      return Array.from(activeTypes).some((t) => !allMappedKeys.includes(t));
                    }
                    return false;
                  });

                  if (visibleLegendItems.length === 0) return null;

                  return (
                    <div className="absolute bottom-6 left-6 z-30 bg-[#131313]/95 border border-[#333333] rounded-xl p-4 w-56 shadow-lg pointer-events-auto max-h-48 overflow-y-auto custom-scrollbar">
                      <h4 className="font-mono text-[10px] text-[#838383] uppercase tracking-wider mb-2">CATEGORY LEGEND</h4>
                      <div className="space-y-2">
                        {visibleLegendItems.map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                            <span className="text-[11px] text-[#c3c6d7]">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Hint */}
                <div className="absolute bottom-6 right-6 z-30 hidden md:flex items-center gap-2 bg-[#131313]/80 border border-[#333333] rounded-lg px-3 py-1.5 text-[10px] font-mono text-[#838383]">
                  <span className="material-symbols-outlined text-[14px]">drag_pan</span>
                  drag to pan · scroll to zoom
                </div>

                {/* Graph Viewport — centered square canvas */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="relative transition-transform duration-75 pointer-events-none"
                    style={{
                      width: size,
                      height: size,
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    }}
                  >
                    {/* SVG connection lines + arrows + edge labels */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" width={size} height={size}>
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b5bdb" />
                        </marker>
                        <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#b4c5ff" />
                        </marker>
                      </defs>
                      {connections.map((c) => {
                        const active = hoveredId !== null && (c.a === hoveredId || c.b === hoveredId);
                        // Satellite-to-satellite edges stay hidden until one end is hovered,
                        // which keeps the center from turning into a tangle of lines.
                        if (c.inter && !active) return null;
                        const dimmed = hoveredId !== null && !active;
                        // Bias the label toward the outer (satellite) end so it
                        // sits beside its node instead of colliding at the hub.
                        const d1 = Math.hypot(c.x1 - cx, c.y1 - cy);
                        const d2 = Math.hypot(c.x2 - cx, c.y2 - cy);
                        const t = c.inter ? 0.5 : d2 >= d1 ? 0.66 : 0.34;
                        const lx = c.x1 + (c.x2 - c.x1) * t;
                        const ly = c.y1 + (c.y2 - c.y1) * t;
                        const labelW = c.label.length * 6.1 + 16;
                        return (
                          <g key={c.key} className={dimmed ? "opacity-15" : ""}>
                            <line
                              x1={c.x1}
                              y1={c.y1}
                              x2={c.x2}
                              y2={c.y2}
                              stroke={active ? "#b4c5ff" : "#3b5bdb"}
                              strokeDasharray={active ? "0" : "5 4"}
                              strokeWidth={active ? 2 : 1.5}
                              markerEnd={active ? "url(#arrow-active)" : "url(#arrow)"}
                              className={active ? "opacity-90" : "opacity-30"}
                            />
                            {active && (
                              <g>
                                <rect
                                  x={lx - labelW / 2}
                                  y={ly - 10}
                                  width={labelW}
                                  height={20}
                                  rx={10}
                                  fill="#1b1b1b"
                                  stroke="#b4c5ff"
                                  strokeWidth="1"
                                  opacity="0.97"
                                />
                                <text
                                  x={lx}
                                  y={ly}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fontSize="10.5"
                                  fontFamily="monospace"
                                  fill="#e5e2e1"
                                  className="select-none"
                                >
                                  {c.label}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Centered Node */}
                    <div
                      style={{ position: "absolute", left: cx, top: cy }}
                      className="-translate-x-1/2 -translate-y-1/2 z-20 text-center pointer-events-auto group"
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (movedRef.current) return;
                          router.push(`/tech/${centerNode.id}`);
                        }}
                        title={`Open ${centerNode.label} details`}
                        className={`w-32 h-32 rounded-full border-2 bg-[#131313] hover:bg-[#1b1b1b] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${getNodeColor(centerNode.type)}`}
                      >
                        <span className="text-xs font-bold text-[#e5e2e1] px-1">{centerNode.label}</span>
                        <span className="text-[8px] text-[#838383] uppercase tracking-wider mt-1">{centerNode.type}</span>
                        <span className="material-symbols-outlined text-[14px] mt-1 opacity-0 group-hover:opacity-70 transition-opacity">open_in_new</span>
                      </div>
                    </div>

                    {/* Satellite Nodes — size adapts to how busy the graph is */}
                    {satellites.map((sat) => {
                      const dimmed = hoveredId !== null && hoveredId !== sat.id;
                      const small = nodeD <= 54;
                      return (
                        <div
                          key={sat.id}
                          style={{ position: "absolute", left: sat.x, top: sat.y, zIndex: hoveredId === sat.id ? 25 : 20 }}
                          className={`-translate-x-1/2 -translate-y-1/2 text-center cursor-pointer pointer-events-auto transition-opacity ${dimmed ? "opacity-40" : "opacity-100"}`}
                          onMouseEnter={() => setHoveredId(sat.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (movedRef.current) return;
                            focusOn(sat.id);
                          }}
                        >
                          <div
                            style={{ width: nodeD, height: nodeD }}
                            className={`rounded-full border bg-[#1b1b1b] hover:scale-110 active:scale-95 flex flex-col items-center justify-center transition-all duration-200 ${getNodeColor(sat.type)}`}
                          >
                            <span className={`${small ? "text-[8px]" : "text-[10px]"} font-bold text-[#e5e2e1] px-1 truncate w-full leading-tight`}>{sat.label}</span>
                            {!small && (
                              <span className="text-[7px] text-[#838383] uppercase tracking-wider mt-0.5 truncate w-full px-1">{sat.type}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Empty neighbors state */}
                {satellites.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <p className="text-sm text-[#838383] bg-[#131313]/80 border border-[#333333] rounded-lg px-4 py-2">
                      This node has no recorded relations yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* No data at all */}
            {!isLoading && !centerNode && (
              <div className="h-[600px] bg-[#0e0e0e]/40 rounded-xl border border-[#333333] flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-[#838383] text-[40px]">hub</span>
                <p className="text-sm text-[#838383]">No relation data available to display.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#131313] border-t border-[#333333] mt-12 lg:ml-64">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-8 max-w-[1440px] mx-auto">
          <div className="flex flex-col items-center md:items-start gap-1 mb-4 md:mb-0">
            <span className="text-xs font-mono text-[#e5e2e1]">WebDev Semantic Directory</span>
            <p className="font-body text-xs text-[#838383]">© 2024 WebDev Semantic Directory. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">Documentation</a>
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="https://github.com/Fzzrr/semantic-webdev">GitHub Repository</a>
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">Terms of Service</a>
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
