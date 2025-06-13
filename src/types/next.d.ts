import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';

export type NextApiResponseServerIO = {
    socketServer: HTTPServer & {
        io?: IOServer;
    };
};
