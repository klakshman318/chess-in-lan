import { NextRequest, NextResponse } from 'next/server';
import { Server as IOServer } from 'socket.io';

const io: IOServer | null = null;

export async function POST(req: NextRequest) {
    const { roomCode } = await req.json();

    if (!io) {
        return NextResponse.json({ exists: false });
    }

    const clients = io.sockets.adapter.rooms.get(roomCode);
    const exists = !!clients;

    return NextResponse.json({ exists });
}
