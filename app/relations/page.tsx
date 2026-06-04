"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

export default function RelationsMapPage() {
  const [relations, setRelations] = useState<RelationTriple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected/centered node in the graph
  const [focusNodeId, setFocusNodeId] = useState<string>("NextJS");
  
  // Graph view states
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
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

  // Center coordinate of container
  const size = 600;
  const cx = size / 2;
  const cy = size / 2;

  // Find all related connections for the focused node
  const getGraphData = () => {
    if (relations.length === 0) return { centerNode: null, satellites: [], connections: [] };

    // Get center node data
    const centerTriple = relations.find((r) => r.subject === focusNodeId || r.object === focusNodeId);
    if (!centerTriple) return { centerNode: null, satellites: [], connections: [] };

    const centerNode: NodeData = {
      id: focusNodeId,
      label: centerTriple.subject === focusNodeId ? centerTriple.subjectLabel : centerTriple.objectLabel,
      type: centerTriple.subject === focusNodeId ? centerTriple.subjectType : centerTriple.objectType,
    };

    // Find first-degree neighbors
    const neighbors = new Map<string, NodeData>();
    relations.forEach((rel) => {
      if (rel.subject === focusNodeId && rel.object !== focusNodeId) {
        neighbors.set(rel.object, { id: rel.object, label: rel.objectLabel, type: rel.objectType });
      } else if (rel.object === focusNodeId && rel.subject !== focusNodeId) {
        neighbors.set(rel.subject, { id: rel.subject, label: rel.subjectLabel, type: rel.subjectType });
      }
    });

    const satellites = Array.from(neighbors.values());

    // Calculate layout coordinates for satellites
    const radius = 180;
    const positionedSatellites = satellites.map((sat, i) => {
      const angle = (i / satellites.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return { ...sat, x, y };
    });

    // Determine connection lines
    const connections: Array<{ x1: number; y1: number; x2: number; y2: number; label: string; key: string }> = [];

    // Connections from center to satellites
    positionedSatellites.forEach((sat) => {
      // Find matching predicate relation
      const directRel = relations.find(
        (r) => (r.subject === focusNodeId && r.object === sat.id) || (r.subject === sat.id && r.object === focusNodeId)
      );
      connections.push({
        x1: cx,
        y1: cy,
        x2: sat.x,
        y2: sat.y,
        label: directRel ? directRel.predicate : "relatesTo",
        key: `center-${sat.id}`,
      });
    });

    // Connections between satellites themselves (if any exist in our triples data)
    for (let i = 0; i < positionedSatellites.length; i++) {
      for (let j = i + 1; j < positionedSatellites.length; j++) {
        const satA = positionedSatellites[i];
        const satB = positionedSatellites[j];

        const innerRel = relations.find(
          (r) => (r.subject === satA.id && r.object === satB.id) || (r.subject === satB.id && r.object === satA.id)
        );

        if (innerRel) {
          connections.push({
            x1: satA.x,
            y1: satA.y,
            x2: satB.x,
            y2: satB.y,
            label: innerRel.predicate,
            key: `inter-${satA.id}-${satB.id}`,
          });
        }
      }
    }

    return { centerNode, satellites: positionedSatellites, connections };
  };

  const { centerNode, satellites, connections } = getGraphData();

  // Mouse Handlers for Dragging / Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom control helpers
  const zoomIn = () => setScale((s) => Math.min(2, s + 0.1));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));
  const zoomReset = () => {
    setScale(1);
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
          <div className="px-6 mb-8">
            <Link href="/" className="hover:opacity-90">
              <h2 className="text-sm font-mono text-[#838383] uppercase tracking-widest mb-1">Tech Registry</h2>
            </Link>
            <p className="text-[10px] font-mono text-[#838383]">v1.4.2-stable</p>
          </div>
          <div className="flex flex-col gap-1 px-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/?category=${cat.value}`}
                className="flex items-center gap-3 text-left w-full pl-4 py-3 rounded-lg text-[#c3c6d7] hover:bg-[#2a2a2a] hover:text-[#e5e2e1] duration-150 ease-in-out font-body text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {cat.value === "Language" ? "code" : 
                   cat.value === "Framework" ? "architecture" : 
                   cat.value === "Library" ? "library_books" : 
                   cat.value === "Database" ? "database" : "terminal"}
                </span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-auto px-4 pt-6 border-t border-[#333333] flex flex-col gap-1">
            <Link 
              href="/"
              className="w-full bg-[#2a2a2a] text-center text-[#e5e2e1] py-2 rounded mb-4 font-mono text-xs hover:bg-[#2563eb] hover:text-[#eeefff] transition-all block"
            >
              Back to Explorer
            </Link>
            <a className="flex items-center gap-3 text-[#c3c6d7] pl-4 py-2 hover:text-[#b4c5ff] text-xs" href="#">
              <span className="material-symbols-outlined text-[16px]">settings</span>
              <span>Settings</span>
            </a>
            <a className="flex items-center gap-3 text-[#c3c6d7] pl-4 py-2 hover:text-[#b4c5ff] text-xs" href="#">
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span>API Status</span>
            </a>
          </div>
        </aside>

        {/* Main Graph Content */}
        <main className="flex-1 lg:ml-64 p-8 min-h-screen">
          <div className="max-w-[1200px] mx-auto w-full">
            
            {/* Title Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="font-headline text-3xl font-bold text-[#e5e2e1] mb-2">Peta Relasi Semantik</h1>
                <p className="text-sm text-[#838383]">
                  Visualisasi graf ontologi dari relasi antar teknologi. Klik pada node satelit untuk memindahkan fokus.
                </p>
              </div>

              {/* Focus Node Selector */}
              {!isLoading && relations.length > 0 && (
                <div className="flex items-center gap-3 bg-[#1b1b1b] border border-[#333333] px-4 py-2.5 rounded-xl shadow-md">
                  <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">center_focus_weak</span>
                  <label className="text-[11px] text-[#838383] font-mono uppercase tracking-wider whitespace-nowrap">Pilih Fokus:</label>
                  <select
                    value={focusNodeId}
                    onChange={(e) => {
                      setFocusNodeId(e.target.value);
                      setScale(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    className="bg-[#131313] border border-[#333333] text-[#e5e2e1] text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b4c5ff] cursor-pointer"
                  >
                    {(() => {
                      const nodesMap = new Map<string, string>();
                      relations.forEach((r) => {
                        nodesMap.set(r.subject, r.subjectLabel);
                        nodesMap.set(r.object, r.objectLabel);
                      });
                      return Array.from(nodesMap.entries())
                        .sort((a, b) => a[1].localeCompare(b[1]))
                        .map(([id, label]) => (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        ));
                    })()}
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
              >
                {/* Grid Dots */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                
                {/* Control Panel (Zoom) */}
                <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); zoomIn(); }} 
                    className="w-10 h-10 bg-[#1b1b1b] border border-[#333333] hover:border-[#b4c5ff] text-[#e5e2e1] rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                  >
                    +
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); zoomOut(); }} 
                    className="w-10 h-10 bg-[#1b1b1b] border border-[#333333] hover:border-[#b4c5ff] text-[#e5e2e1] rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                  >
                    -
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); zoomReset(); }} 
                    className="w-10 h-10 bg-[#1b1b1b] border border-[#333333] hover:border-[#b4c5ff] text-[#e5e2e1] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">fit_screen</span>
                  </button>
                </div>

                {/* Legend Box */}
                {(() => {
                  const activeTypes = new Set<string>();
                  if (centerNode) activeTypes.add(centerNode.type.toLowerCase());
                  satellites.forEach((sat) => activeTypes.add(sat.type.toLowerCase()));

                  const allMappedKeys = [
                    "framework", "database", "triplestore", "language", "runtime", 
                    "apitool", "semanticwebspec", "buildtool", "packagemanager", 
                    "linter", "monorepo", "testingtool", "deploymenttool", "orm", "cssframework"
                  ];

                  const legendItems = [
                    { keys: ["framework"], label: "Frameworks", color: "bg-[#38bdf8]" },
                    { keys: ["database", "triplestore"], label: "Databases & Triplestores", color: "bg-[#f97316]" },
                    { keys: ["language", "runtime"], label: "Languages & Runtimes", color: "bg-[#2563eb]" },
                    { 
                      keys: ["library"], 
                      label: "Libraries & Helpers", 
                      color: "bg-[#a78bfa]",
                      checkFallback: true 
                    },
                    { keys: ["apitool", "semanticwebspec"], label: "APIs & Specifications", color: "bg-[#14b8a6]" },
                    { keys: ["buildtool", "packagemanager", "linter", "monorepo"], label: "Build Tools & DevOps", color: "bg-[#10b981]" },
                    { keys: ["testingtool"], label: "Testing Tools", color: "bg-[#eab308]" },
                    { keys: ["deploymenttool"], label: "Deployment & Hosting", color: "bg-[#f43f5e]" },
                    { keys: ["orm"], label: "ORMs & Builders", color: "bg-[#f59e0b]" },
                    { keys: ["cssframework"], label: "CSS Frameworks", color: "bg-[#06b6d4]" },
                  ];

                  const visibleLegendItems = legendItems.filter(item => {
                    const hasDirectKey = item.keys.some(k => activeTypes.has(k));
                    if (hasDirectKey) return true;
                    if (item.checkFallback) {
                      // Show library category if any active type is not in all mapped keys
                      return Array.from(activeTypes).some(t => !allMappedKeys.includes(t));
                    }
                    return false;
                  });

                  if (visibleLegendItems.length === 0) return null;

                  return (
                    <div className="absolute bottom-6 left-6 z-30 bg-[#131313]/95 border border-[#333333] rounded-xl p-4 w-56 shadow-lg pointer-events-auto max-h-48 overflow-y-auto custom-scrollbar">
                      <h4 className="font-mono text-[10px] text-[#838383] uppercase tracking-wider mb-2">LEGENDA KATEGORI</h4>
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

                {/* Graph Viewport */}
                <div 
                  className="absolute inset-0 origin-center transition-transform duration-75"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    transformOrigin: "center",
                  }}
                >
                  {/* SVG paths / connection lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {connections.map((c) => (
                      <line 
                        key={c.key}
                        x1={c.x1} 
                        y1={c.y1} 
                        x2={c.x2} 
                        y2={c.y2} 
                        stroke="#2563eb" 
                        strokeDasharray="4" 
                        strokeWidth="1.5"
                        className="opacity-40"
                      />
                    ))}
                  </svg>

                  {/* Centered Node */}
                  <div 
                    style={{ position: "absolute", left: cx, top: cy }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 text-center"
                  >
                    <div 
                      onClick={() => router.push(`/tech/${centerNode.id}`)}
                      className={`w-32 h-32 rounded-full border-2 bg-[#131313] hover:bg-[#1b1b1b] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${getNodeColor(centerNode.type)}`}
                    >
                      <span className="text-xs font-bold text-[#e5e2e1] px-1">{centerNode.label}</span>
                      <span className="text-[8px] text-[#838383] uppercase tracking-wider mt-1">{centerNode.type}</span>
                    </div>
                  </div>

                  {/* Satellite Nodes */}
                  {satellites.map((sat) => (
                    <div 
                      key={sat.id}
                      style={{ position: "absolute", left: sat.x, top: sat.y }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 text-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusNodeId(sat.id);
                      }}
                    >
                      <div 
                        className={`w-20 h-20 rounded-full border bg-[#1b1b1b] hover:scale-105 active:scale-95 flex flex-col items-center justify-center transition-all duration-200 ${getNodeColor(sat.type)}`}
                      >
                        <span className="text-[10px] font-bold text-[#e5e2e1] px-1 truncate w-full">{sat.label}</span>
                        <span className="text-[7px] text-[#838383] uppercase tracking-wider mt-0.5">{sat.type}</span>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#131313] border-t border-[#333333] mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-8 max-w-[1440px] mx-auto">
          <div className="flex flex-col items-center md:items-start gap-1 mb-4 md:mb-0">
            <span className="text-xs font-mono text-[#e5e2e1]">WebDev Semantic Directory</span>
            <p className="font-body text-xs text-[#838383]">© 2024 WebDev Semantic Directory. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">Documentation</a>
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">API Reference</a>
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">GitHub Repository</a>
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">Terms of Service</a>
            <a className="font-body text-xs text-[#838383] hover:text-[#b4c5ff] underline opacity-100 hover:opacity-80 transition-all" href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
