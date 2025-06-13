import { createServer } from 'http';
import next from 'next';
import { Server as IOServer } from 'socket.io';

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
        console.log('New client connected:', socket.id);

        socket.on('join', ({ room, name, role }) => {
            const clients = io.sockets.adapter.rooms.get(room);

            if (!clients && role === 'joiner') {
                socket.emit('invalid-room');
                return;
            }

            socket.join(room);

            if (role === 'joiner') {
                // Notify the creator of the joiner's name
                socket.to(room).emit('player-joined', { name });
                // Notify joiner of successful join
                socket.emit('message', 'You have successfully joined the room.');
            }

            console.log(`${socket.id} joined room ${room} as ${name}`);
        });

        socket.on('move', ({ room, move }) => {
            socket.to(room).emit('opponent-move', move);
        });

        socket.on('restart', ({ room }) => {
            socket.to(room).emit('restart');
        });

        socket.on('end-room', ({ room }) => {
            socket.to(room).emit('end-room');
            io.socketsLeave(room);
            console.log(`Room ${room} ended by creator`);
        });

        socket.on('check-room', ({ room }) => {
            const clients = io.sockets.adapter.rooms.get(room);
            socket.emit('room-exists', !!clients);
        });


        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    server.listen(3000, () => {
        console.log('> Ready on http://localhost:3000');
    });
});
