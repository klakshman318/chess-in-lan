'use client';

import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

let socket: ReturnType<typeof io> | null = null;

const ChessBoard: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const roomCode = searchParams.get('room') || 'default';
    const playerName = searchParams.get('name') || 'Anonymous';
    const role = searchParams.get('role') || 'joiner';
    const roomName = searchParams.get('roomName') || 'Chess Room';

    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [isEndingRoom, setIsEndingRoom] = useState(false);
    const [currentTurn, setCurrentTurn] = useState('white');
    const [opponentConnected, setOpponentConnected] = useState(false);
    const [opponentName, setOpponentName] = useState('Opponent');

    // Determine player color and board orientation
    const playerColor = role === 'creator' ? 'white' : 'black';
    const boardOrientation = playerColor;

    useEffect(() => {
        socket = io('ws://192.168.1.35:3000', { path: '/api/socket' });

        socket.emit('join', { room: roomCode, name: playerName, role });

        socket.on('invalid-room', () => {
            toast.error('Invalid room code! Please check again.', {
                icon: '❌',
                style: {
                    background: '#222',
                    color: '#fff',
                    border: '1px solid #c4541c',
                },
            });
            setTimeout(() => router.push('/'), 2000);
        });

        socket.on('message', (msg) => {
            if (msg === 'A new player has joined!' || msg === 'You have successfully joined the room.') {
                setOpponentConnected(true);
                if (role === 'joiner') {
                    setOpponentName('Creator');
                }
                toast.success('Player joined!', { icon: '⚔️' });
            }
        });

        socket.on('player-joined', ({ name }) => {
            setOpponentConnected(true);
            setOpponentName(name);
            toast.success(`${name} joined the game!`, { icon: '⚔️' });
        });

        socket.on('opponent-move', (move) => {
            game.move(move);
            setFen(game.fen());
            setMoveHistory(game.history());
            setCurrentTurn(game.turn() === 'w' ? 'white' : 'black');
        });

        socket.on('restart', () => {
            const newGame = new Chess();
            setGame(newGame);
            setFen(newGame.fen());
            setMoveHistory([]);
            setCurrentTurn('white');
        });

        socket.on('end-room', () => {
            toast.error('Room ended by creator.', { icon: '⚠️' });
            setTimeout(() => router.push('/'), 2000);
        });

        return () => {
            socket?.disconnect();
        };
    }, [roomCode, playerName, role, router, game]);

    const onDrop = (source: string, target: string) => {
        try {
            const move = game.move({ from: source, to: target, promotion: 'q' });

            if (move === null) {
                toast.error('Illegal move! Try again.', {
                    style: {
                        background: '#222',
                        color: '#fff',
                        border: '1px solid #c4541c',
                    },
                    icon: '⚠️',
                });
                return false;
            }

            setFen(game.fen());
            setMoveHistory(game.history());
            setCurrentTurn(game.turn() === 'w' ? 'white' : 'black');
            socket?.emit('move', { room: roomCode, move });
            return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error('Illegal move! Try again.', {
                style: {
                    background: '#222',
                    color: '#fff',
                    border: '1px solid #c4541c',
                },
                icon: '⚠️',
            });
            return false;
        }
    };

    const restartGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setMoveHistory([]);
        setCurrentTurn('white');

        socket?.emit('restart', { room: roomCode });
    };

    const endRoom = () => {
        if (role === 'creator') {
            setIsEndingRoom(true);
            socket?.emit('end-room', { room: roomCode });

            // Allow a short delay for socket to notify joiner
            setTimeout(() => {
                router.push('/');
            }, 1000);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col items-center gap-1 w-full max-w-md text-xs text-gray-400 uppercase tracking-wider">
                <div className="flex justify-between w-full">
                    <span className={playerColor === 'white' ? 'text-white' : 'text-gray-400'}>
                        White: {playerColor === 'white' ? playerName : opponentName}
                    </span>
                    <span>{roomName}</span>
                    <span className={playerColor === 'black' ? 'text-white' : 'text-gray-400'}>
                        Black: {playerColor === 'black' ? playerName : opponentName}
                    </span>
                </div>
                <div className="flex justify-center w-full text-xs text-gray-400 uppercase tracking-wider">
                    Turn: <span className="ml-1 text-white">{currentTurn}</span>
                </div>
                {!opponentConnected && (
                    <div className="text-xs text-yellow-400 animate-pulse">
                        Waiting for opponent...
                    </div>
                )}
            </div>

            <div className="rounded-xl overflow-hidden border border-brand/50 shadow-brand/50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                <Chessboard
                    position={fen}
                    onPieceDrop={onDrop}
                    boardWidth={400}
                    boardOrientation={boardOrientation}
                />
            </div>

            <div className="flex gap-2 mt-4 w-full max-w-md">
                <button
                    onClick={restartGame}
                    className="flex-1 py-2 rounded bg-brand text-white font-bold hover:scale-105 hover:opacity-80 transform transition shadow-lg"
                >
                    Restart Game
                </button>

                {role === 'creator' && (
                    <button
                        onClick={endRoom}
                        className="flex-1 py-2 rounded bg-red-600 text-white font-bold hover:scale-105 hover:opacity-80 transform transition shadow-lg"
                    >
                        End Room
                    </button>
                )}
            </div>

            {isEndingRoom && role === 'creator' && (
                <div className="flex justify-center items-center gap-2 text-xs text-gray-300 animate-pulse mt-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        />
                    </svg>
                    Ending room...
                </div>
            )}

            <div className="mt-4 w-full max-w-md bg-black/30 rounded p-2 text-xs text-gray-300 backdrop-blur-md border border-brand/30">
                <h3 className="font-semibold text-brand mb-1">Move History</h3>
                <div className="overflow-y-auto max-h-32 text-gray-300">
                    {moveHistory.map((move, idx) => (
                        <div key={idx}>{idx + 1}. {move}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChessBoard;
