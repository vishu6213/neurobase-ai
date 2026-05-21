"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerformanceBudget } from "@/hooks/use-performance-budget";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  logo?: string; // Added for coin logos
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const { isMobile } = usePerformanceBudget();
  const [isVisible, setIsVisible] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [viewMode, setViewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    if (isMobile || !isVisible) return;
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.2) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 60);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode, isMobile, isVisible]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200; // Adjusted radius for better spacing
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-green-500/20 border-green-500/50";
      case "in-progress":
        return "text-yellow-500 bg-yellow-500/20 border-yellow-500/50";
      case "pending":
        return "text-white/40 bg-white/5 border-white/10";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-transparent overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1200px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Central Core */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/40 via-red-500/40 to-purple-500/40 animate-pulse flex items-center justify-center z-10 backdrop-blur-xl border border-white/10">
            <div className="absolute w-32 h-32 rounded-full border border-white/5 animate-ping opacity-30"></div>
            <div
              className="absolute w-40 h-40 rounded-full border border-white/5 animate-ping opacity-20"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Neural<br/>Core</div>
          </div>

          {/* Orbital Rings */}
          <div className="absolute w-[480px] h-[480px] rounded-full border border-white/5 pointer-events-none"></div>
          <div className="absolute w-[520px] h-[520px] rounded-full border border-white/5 opacity-30 pointer-events-none"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon as any;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 500 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => { nodeRefs.current[item.id] = el; }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute rounded-full -inset-4 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`,
                  }}
                ></div>

                {/* Node Orb */}
                <div
                  className={`
                  w-14 h-14 rounded-full flex items-center justify-center overflow-hidden
                  ${
                    isExpanded
                      ? "bg-white text-black scale-125"
                      : isRelated
                      ? "bg-white/30 text-white"
                      : "bg-black/60 text-white backdrop-blur-md"
                  }
                  border-2 
                  ${
                    isExpanded
                      ? "border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.4)]"
                      : isRelated
                      ? "border-white animate-pulse"
                      : "border-white/10"
                  }
                  transition-all duration-500 transform
                `}
                >
                  {item.logo ? (
                    <img src={item.logo} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>

                {/* Label */}
                <div
                  className={`
                  absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[10px] font-black tracking-[0.2em] uppercase
                  transition-all duration-300
                  ${isExpanded ? "text-yellow-500 scale-110" : "text-white/40"}
                `}
                >
                  {item.title}
                </div>

                {/* Card UI */}
                {isExpanded && (
                  <Card className="absolute top-24 left-1/2 -translate-x-1/2 w-72 bg-black/95 backdrop-blur-3xl border-white/10 shadow-2xl overflow-visible z-[600]">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-yellow-500/50"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className={`px-2 py-0 h-5 text-[8px] font-black ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                        <span className="text-[9px] font-black text-white/30 tracking-widest">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-black tracking-tighter text-white mt-2">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/60 space-y-4">
                      <p className="leading-relaxed">{item.content}</p>

                      <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-2">
                          <span className="flex items-center gap-1 text-white/40">
                            <Zap size={10} className="text-yellow-500" />
                            Holding Weight
                          </span>
                          <span className="text-yellow-500">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-red-600 rounded-full"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center mb-3">
                            <Link size={10} className="text-white/20 mr-2" />
                            <h4 className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20">
                              Connected Assets
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-[9px] font-black rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/10 text-white/40 hover:text-white transition-all uppercase tracking-widest"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={10}
                                    className="ml-2 text-white/20"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
