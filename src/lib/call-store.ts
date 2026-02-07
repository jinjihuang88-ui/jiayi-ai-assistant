/**
 * 通话房间内存存储（信令用）。生产环境可改为 Redis/DB。
 */
export type CallType = "video" | "voice";
export type CallRole = "member" | "rcic" | "team";

export interface CallRoom {
  roomId: string;
  caseId: string;
  type: CallType;
  initiatorRole: CallRole;
  initiatorId: string;
  status: "ringing" | "active" | "ended";
  signals: { type: string; data: unknown }[];
  createdAt: number;
}

const rooms = new Map<string, CallRoom>();

const ROOM_TTL_MS = 30 * 60 * 1000; // 30 分钟无活动可清理

function generateRoomId(): string {
  return "call_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

export function createRoom(params: {
  caseId: string;
  type: CallType;
  initiatorRole: CallRole;
  initiatorId: string;
}): CallRoom {
  const roomId = generateRoomId();
  const room: CallRoom = {
    roomId,
    caseId: params.caseId,
    type: params.type,
    initiatorRole: params.initiatorRole,
    initiatorId: params.initiatorId,
    status: "ringing",
    signals: [],
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId: string): CallRoom | undefined {
  return rooms.get(roomId);
}

export function getRoomsByCaseId(caseId: string): CallRoom[] {
  const now = Date.now();
  return Array.from(rooms.values()).filter(
    (r) => r.caseId === caseId && r.status === "ringing" && now - r.createdAt < ROOM_TTL_MS
  );
}

export function joinRoom(roomId: string): CallRoom | undefined {
  const room = rooms.get(roomId);
  if (room && room.status === "ringing") {
    room.status = "active";
    return room;
  }
  return undefined;
}

export function addSignal(roomId: string, type: string, data: unknown): boolean {
  const room = rooms.get(roomId);
  if (!room || room.status === "ended") return false;
  room.signals.push({ type, data });
  return true;
}

export function getSignalsAfter(roomId: string, afterIndex: number): { type: string; data: unknown }[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  return room.signals.slice(afterIndex);
}

export function endRoom(roomId: string): void {
  const room = rooms.get(roomId);
  if (room) room.status = "ended";
}

export function getRoomWithSignals(roomId: string): CallRoom | undefined {
  return rooms.get(roomId);
}
