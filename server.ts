import { createServer } from 'http';
import next from 'next';
import { Server as IOServer } from 'socket.io';

const rooms: Record<
    string,
    {
        creatorName: string;
        joinerName?: string;
        creatorSocketId?: string;
        joinerSocketId?: string;
    }
> = {};

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => handle(req, res));

    const io = new IOServer(server, {
        path: '/api/socket',
        cors: { origin: '*' },
    });

    io.on('connection', (socket) => {
        socket.on('join', ({ room, name, role }) => {
            const clients = io.sockets.adapter.rooms.get(room);

            if (!clients && role === 'joiner') {
                socket.emit('invalid-room');
                return;
            }

            socket.join(room);

            if (role === 'creator') {
                if (!rooms[room]) {
                    rooms[room] = {
                        creatorName: name,
                        creatorSocketId: socket.id,
                    };
                } else {
                    rooms[room].creatorName = name;
                    rooms[room].creatorSocketId = socket.id;
                }
            } else if (role === 'joiner') {
                if (!rooms[room]) {
                    rooms[room] = { creatorName: '', joinerName: name, joinerSocketId: socket.id };
                } else {
                    rooms[room].joinerName = name;
                    rooms[room].joinerSocketId = socket.id;
                }
                socket.to(room).emit('player-joined', { name });
                const creatorName = rooms[room].creatorName || '';
                socket.emit('room-creator', { name: creatorName });
                socket.emit('message', 'You have successfully joined the room.');
            }

            io.to(room).emit('room-info', {
                creatorName: rooms[room]?.creatorName || '',
                joinerName: rooms[room]?.joinerName || '',
            });

            console.log(`${socket.id} joined room ${room} as ${name} (${role})`);
        });

        socket.on('request-room-info', ({ room }) => {
            const roomObj = rooms[room] || {};
            socket.emit('room-info', {
                creatorName: roomObj.creatorName || '',
                joinerName: roomObj.joinerName || '',
            });
        });

        socket.on('move', ({ room, move }) => {
            socket.to(room).emit('opponent-move', move);
        });

        socket.on('restart', ({ room }) => {
            socket.to(room).emit('restart');
        });

        socket.on('end-room', ({ room, winner, reason }) => {
            socket.to(room).emit('end-room', { winner, reason });
            delete rooms[room];
            io.socketsLeave(room);
            console.log(`Room ${room} ended by creator. Winner: ${winner}, Reason: ${reason}`);
        });

        socket.on('check-room', ({ room }) => {
            const clients = io.sockets.adapter.rooms.get(room);
            socket.emit('room-exists', !!clients);
        });

        socket.on('disconnect', () => {
            for (const [room, info] of Object.entries(rooms)) {
                if (info.creatorSocketId === socket.id) {
                    delete rooms[room];
                    io.to(room).emit('end-room', { winner: null, reason: 'Creator disconnected' });
                    io.socketsLeave(room);
                } else if (info.joinerSocketId === socket.id) {
                    rooms[room].joinerName = '';
                    rooms[room].joinerSocketId = undefined;
                    io.to(room).emit('room-info', {
                        creatorName: info.creatorName,
                        joinerName: '',
                    });
                }
            }
            console.log('Client disconnected:', socket.id);
        });
    });

    server.listen(3000, () => {
        console.log('> Ready on http://localhost:3000');
    });
});
