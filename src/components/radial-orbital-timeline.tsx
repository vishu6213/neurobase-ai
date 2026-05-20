"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link as LinkIcon, Zap, Bot, Shield, TrendingUp, Activity, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  className?: string;
}

export default function RadialOrbitalTimeline({
  timelineData,
  className,
}: RadialOrbitalTimelineProps) {
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
    let requestRef: number;

    const animate = () => {
      if (autoRotate && viewMode === "orbital") {
        setRotationAngle((prev) => (prev + 0.3) % 360);
      }
      requestRef = requestAnimationFrame(animate);
    };

    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 240;
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
        return "text-black bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.5)]";
      case "in-progress":
        return "text-white bg-red-600 border-red-600 shadow-[0_0_10px_rgba(255,0,0,0.5)]";
      case "pending":
        return "text-white bg-black/60 border-white/20";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center bg-transparent relative overflow-hidden",
        className
      )}
      ref={containerRef}
      onClick={handleContainerClick}
    >

      <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Central Core */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 via-red-600 to-black animate-pulse flex items-center justify-center z-10 shadow-[0_0_60px_rgba(255,215,0,0.3)]">
            <div className="absolute w-32 h-32 rounded-full border border-yellow-500/20 animate-ping opacity-70"></div>
            <div
              className="absolute w-40 h-40 rounded-full border border-red-600/10 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-2 border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.5)] backdrop-blur-md">
               <Bot className="w-8 h-8 text-yellow-500 animate-bounce" />
            </div>
          </div>

          <div className="absolute w-[480px] h-[480px] rounded-full border border-white/5"></div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-white/5"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon: any = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
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
                <div
                  className={`absolute rounded-full -inset-1 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, ${item.status === 'completed' ? 'rgba(255,215,0,0.2)' : 'rgba(255,0,0,0.2)'} 0%, rgba(0,0,0,0) 70%)`,
                    width: `${item.energy * 0.8 + 60}px`,
                    height: `${item.energy * 0.8 + 60}px`,
                    left: `-${(item.energy * 0.8 + 60 - 40) / 2}px`,
                    top: `-${(item.energy * 0.8 + 60 - 40) / 2}px`,
                  }}
                ></div>

                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 transform border-2",
                    isExpanded
                      ? "bg-yellow-500 text-black border-yellow-500 scale-125 shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                      : isRelated
                      ? "bg-red-600/50 text-white border-red-600 animate-pulse"
                      : "bg-black/80 text-white border-white/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  )}
                >
                  <Icon size={28} className={cn(isExpanded && "animate-spin-slow")} />
                </div>

                <div
                  className={cn(
                    "absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                    isExpanded ? "text-yellow-500 scale-125" : "text-white/40"
                  )}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute top-24 left-1/2 -translate-x-1/2 w-72 glass border-yellow-500/30 shadow-2xl shadow-black overflow-visible">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-yellow-500/50"></div>
                    <CardHeader className="pb-3 px-6 pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <Badge
                          className={cn("px-3 py-1 text-[8px] font-black tracking-widest rounded-full", getStatusStyles(item.status))}
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground tracking-tighter">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-black uppercase text-white tracking-tighter">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-5">
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {item.content}
                      </p>

                      <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="flex items-center text-yellow-500">
                            <Zap size={12} className="mr-2" />
                            Neural Energy
                          </span>
                          <span className="text-white">{item.energy}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.energy}%` }}
                            className="h-full bg-gradient-to-r from-yellow-500 to-red-600"
                          ></motion.div>
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center mb-3">
                            <LinkIcon size={12} className="text-yellow-500 mr-2" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                              Synapse Links
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
                                  className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-xl border-white/10 bg-white/5 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={10}
                                    className="ml-2"
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
