import { Server as IOServer } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/next';
import { NextRequest } from 'next/server';

// Keep a single Socket.io server across hot reloads
let io: IOServer | null = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
    if (!io) {
        // Create Socket.io server if it doesn't exist
        console.log('Initializing new Socket.io server...');
        const res = new Response(null, { status: 200 });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - NextResponse has NodeResponse under the hood
        const socketServer = (res as unknown as NextApiResponseServerIO);
        io = new IOServer(socketServer.socketServer, {
            path: '/api/socket', // match frontend path
        });

        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('join', ({ room }) => {
                console.log(`${socket.id} joined room ${room}`);
                socket.join(room);
            });

            socket.on('move', ({ room, move }) => {
                console.log(`Move in room ${room}:`, move);
                socket.to(room).emit('opponent-move', move);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    return new Response(null, { status: 200 });
}
