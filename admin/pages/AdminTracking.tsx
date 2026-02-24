import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Activity, MapPin, Radar, Signal, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrackingEvent {
  id: string;
  type: "user" | "owner" | "delivery";
  timestamp: number;
  data: Record<string, any>;
}

const ADMIN_SOCKET_URL = (() => {
  const envUrl = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";
  return envUrl.replace(/\/api$/, "");
})();

const formatTimestamp = (ts: number) => new Date(ts).toLocaleTimeString();

const AdminTracking = () => {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(ADMIN_SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit("subscribeToAdminTracking");
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    const pushEvent = (type: TrackingEvent["type"], data: Record<string, any>) => {
      setEvents((prev) => {
        const next: TrackingEvent[] = [
          {
            id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            type,
            timestamp: Date.now(),
            data,
          },
          ...prev,
        ];
        return next.slice(0, 50);
      });
    };

    socket.on("userLocationUpdated", (payload) => pushEvent("user", payload));
    socket.on("ownerLocationUpdated", (payload) => pushEvent("owner", payload));
    socket.on("deliveryBoyLocationUpdated", (payload) => pushEvent("delivery", payload));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const summary = useMemo(() => {
    const totals = { user: 0, owner: 0, delivery: 0 } as Record<TrackingEvent["type"], number>;
    events.forEach((event) => {
      totals[event.type] += 1;
    });
    return totals;
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">Live location visibility</p>
          <h1 className="text-xl font-semibold text-foreground">Admin Tracking</h1>
        </div>
        <Badge variant={status === "connected" ? "default" : "destructive"}>
          {status === "connected" ? "Connected" : status === "connecting" ? "Connecting" : "Disconnected"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><Radar className="h-4 w-4 text-primary" />User Updates</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-semibold">{summary.user}</p><p className="text-xs text-muted-foreground">Sessions sending location</p></CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-primary" />Owners</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-semibold">{summary.owner}</p><p className="text-xs text-muted-foreground">Restaurants broadcasting</p></CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" />Delivery</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-semibold">{summary.delivery}</p><p className="text-xs text-muted-foreground">Delivery partners tracked</p></CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Live feed (latest 50)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {events.length === 0 && <p className="text-sm text-muted-foreground">Waiting for events from the socket...</p>}
          {events.map((event) => (
            <div key={event.id} className="border border-border rounded-lg p-3 bg-background/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{event.type}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Timer className="h-3 w-3" />{formatTimestamp(event.timestamp)}</span>
                </div>
                <Badge variant="secondary">Read-only</Badge>
              </div>
              <pre className="mt-2 text-xs bg-muted/60 p-2 rounded-md overflow-x-auto">{JSON.stringify(event.data, null, 2)}</pre>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTracking;
