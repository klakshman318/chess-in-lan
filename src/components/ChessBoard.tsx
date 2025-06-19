'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowPathIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { thinkingDialogues } from '@/constants';

let socket: ReturnType<typeof io> | null = null;

const ChessBoard: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const roomCode = searchParams.get('room') || 'default';
    const playerName = searchParams.get('name') || 'Anonymous';
    const role = searchParams.get('role') || 'joiner';
    const roomName = searchParams.get('roomName') || 'Chess Room';
    const timerMinutes = Number(searchParams.get('timer')) || 15;

    const gameRef = useRef(new Chess());
    const [fen, setFen] = useState(() => gameRef.current.fen());
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [isEndingRoom, setIsEndingRoom] = useState(false);

    const [myName, setMyName] = useState(playerName);
    const [opponentName, setOpponentName] = useState('Opponent');

    const [opponentConnected, setOpponentConnected] = useState(false);
    const [currentDialogue, setCurrentDialogue] = useState('');
    const [loading, setLoading] = useState(true);

    const [whiteCaptures, setWhiteCaptures] = useState<string[]>([]);
    const [blackCaptures, setBlackCaptures] = useState<string[]>([]);

    const [whiteTime, setWhiteTime] = useState(timerMinutes * 60);
    const [blackTime, setBlackTime] = useState(timerMinutes * 60);

    const [timerRunning, setTimerRunning] = useState(false);
    const [activeTimer, setActiveTimer] = useState<'white' | 'black'>('white');

    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const illegalToastId = useRef<string | null>(null);

    const playerColor = role === 'creator' ? 'white' : 'black';
    const boardOrientation = playerColor;

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getCurrentTurn = () => (gameRef.current.turn() === 'w' ? 'white' : 'black');

    const resetGame = useCallback(() => {
        const newGame = new Chess();
        gameRef.current = newGame;
        setFen(newGame.fen());
        setMoveHistory([]);
        setWhiteCaptures([]);
        setBlackCaptures([]);
        setWhiteTime(timerMinutes * 60);
        setBlackTime(timerMinutes * 60);
        setTimerRunning(false);
        setActiveTimer('white');
        setGameResult(null);
    }, [timerMinutes]);

    const [gameResult, setGameResult] = useState<{ winner: string | null; reason: string } | null>(null);

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const getIllegalMoveMessage = (source: string, target: string) => {
        const possibleMoves = gameRef.current.moves({ square: source, verbose: true });
        if (possibleMoves.length === 0) {
            return "This piece can't move anywhere.";
        }
        if (!possibleMoves.find(m => m.to === target)) {
            return `This piece cannot move to ${target.toUpperCase()}.`;
        }
        return "Illegal move!";
    };

    useEffect(() => {
        const currentTurn = getCurrentTurn();
        const name =
            currentTurn === 'white'
                ? playerColor === 'white'
                    ? myName
                    : opponentName
                : playerColor === 'black'
                    ? myName
                    : opponentName;
        const message = thinkingDialogues[Math.floor(Math.random() * thinkingDialogues.length)].replace(
            '{player}',
            name || (currentTurn === 'white' ? 'White' : 'Black')
        );
        setCurrentDialogue(message);
    }, [fen, myName, opponentName, opponentConnected, playerColor]);

    useEffect(() => {
        if (role === 'creator' && !timerRunning) {
            setTimerRunning(true);
            setActiveTimer('white');
        }
    }, [role, timerRunning]);

    useEffect(() => {
        socket = io('ws://192.168.31.229:3000', { path: '/api/socket' });

        socket.on('connect', () => setLoading(false));
        socket.on('disconnect', () => setLoading(true));

        socket.emit('join', { room: roomCode, name: playerName, role });

        socket.on('invalid-room', () => {
            toast.error('Invalid room code! Please check again.', {
                icon: '❌',
                style: { background: '#222', color: '#fff', border: '1px solid #c4541c' },
            });
            setTimeout(() => router.push('/'), 2000);
        });

        socket.on('player-joined', ({ name }) => {
            setOpponentConnected(true);
            setOpponentName(name);
            if (role === 'creator') {
                toast.success(`${name} joined the game!`, { icon: '⚔️' });
            }
            setTimerRunning(true);
            setActiveTimer('white');
        });

        socket.on('room-creator', ({ name }) => {
            setOpponentConnected(true);
            setOpponentName(name);
            if (role === 'joiner') {
                toast.success(`Connected with ${name}!`, { icon: '⚔️' });
            }
            setTimerRunning(true);
            setActiveTimer('white');
        });

        socket.on('opponent-move', (move: { from: string; to: string; promotion?: string; captured?: string; color?: string }) => {
            const newGame = new Chess(gameRef.current.fen());
            const result = newGame.move(move);

            if (!result) {
                console.error('Received invalid move:', move);
                toast.error('Opponent made an invalid move.', { icon: '⚠️' });
                return;
            }

            gameRef.current = newGame;
            setFen(newGame.fen());
            setMoveHistory(newGame.history());

            if (result.captured) {
                if (result.color === 'w') {
                    setWhiteCaptures((caps) => [...caps, result.captured!]);
                } else {
                    setBlackCaptures((caps) => [...caps, result.captured!]);
                }
            }

            setActiveTimer(newGame.turn() === 'w' ? 'white' : 'black');

            if (typeof newGame.isCheckmate === 'function' && newGame.isCheckmate()) {
                setTimerRunning(false);
                const winnerColor = newGame.turn() === 'w' ? 'black' : 'white'; 
                const winnerMessage = playerColor === winnerColor ? 'You win!' : 'You lose!';
                setGameResult({ winner: winnerColor, reason: 'Checkmate' });
                toast.success(`${winnerMessage} Checkmate!`, { icon: '🏆' });
                triggerConfetti();
            }
        });

        socket.on('timer-update', ({ white, black, active }: { white: number; black: number; active: 'white' | 'black' }) => {
            setWhiteTime(white);
            setBlackTime(black);
            setActiveTimer(active);
        });

        socket.on('restart', () => {
            resetGame();
            toast('Game restarted', { icon: '🔄' });
        });

        socket.on('end-room', (data: { winner?: string; reason?: string }) => {
            setTimerRunning(false);
            setGameResult({ winner: data?.winner || null, reason: data?.reason || 'Room ended' });
            toast.error('Room ended by creator.', { icon: '⚠️' });
            setTimeout(() => router.push('/'), 15000);
        });

        socket.emit('request-room-info', { room: roomCode });

        socket.on('room-info', ({ creatorName, joinerName }) => {
            if (role === 'creator') {
                setMyName(creatorName);
                setOpponentName(joinerName || 'Opponent');
            } else {
                setMyName(joinerName);
                setOpponentName(creatorName || 'Opponent');
            }
        });

        return () => {
            socket?.disconnect();
        };
    }, [roomCode, playerName, role, router, resetGame]);

    useEffect(() => {
        if (!timerRunning) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            if (!timerRunning) return;

            if (activeTimer === 'white') {
                if (whiteTime <= 0) {
                    setTimerRunning(false);
                    setGameResult({ winner: 'black', reason: 'Time out' });
                    toast.error('Time up! Black wins!', { icon: '⌛' });
                    socket?.emit('end-room', { room: roomCode, winner: 'black', reason: 'Time out' });
                } else {
                    setWhiteTime((t) => t - 1);
                    socket?.emit('timer-update', { room: roomCode, white: whiteTime - 1, black: blackTime, active: 'white' });
                }
            } else {
                if (blackTime <= 0) {
                    setTimerRunning(false);
                    setGameResult({ winner: 'white', reason: 'Time out' });
                    toast.error('Time up! White wins!', { icon: '⌛' });
                    socket?.emit('end-room', { room: roomCode, winner: 'white', reason: 'Time out' });
                } else {
                    setBlackTime((t) => t - 1);
                    socket?.emit('timer-update', { room: roomCode, white: whiteTime, black: blackTime - 1, active: 'black' });
                }
            }
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [timerRunning, activeTimer, whiteTime, blackTime, roomCode]);

    const isDraggablePiece = ({ piece }: { piece: string; sourceSquare: string }) => {
        if (!timerRunning) return false;
        if (gameResult) return false;
        if (getCurrentTurn() !== playerColor) return false;
        const pieceColor = piece[0] === 'w' ? 'white' : 'black';
        return pieceColor === playerColor;
    };

    const customSquareStyles: Record<string, React.CSSProperties> = {};
    for (let i = 0; i < 8; ++i) {
        for (let j = 0; j < 8; ++j) {
            const file = String.fromCharCode(97 + i);
            const rank = (j + 1).toString();
            const squareVal = `${file}${rank}`;
            const piece = gameRef.current.get(squareVal);
            if (piece) {
                const pieceColor = piece.color === 'w' ? 'white' : 'black';
                if (pieceColor !== playerColor) {
                    customSquareStyles[squareVal] = {
                        pointerEvents: 'none',
                        opacity: 0.65,
                    };
                }
            }
        }
    }

    const onDrop = (source: string, target: string) => {
        if (!timerRunning || gameResult) {
            toast.error('Game is not active.', { icon: '⌛' });
            return false;
        }
        if (getCurrentTurn() !== playerColor) {
            toast.error("It's not your turn.", { icon: '🚫' });
            return false;
        }

        const possibleMoves = gameRef.current.moves({ square: source, verbose: true });
        const legalMove = possibleMoves.find(m => m.to === target);

        if (!legalMove) {
            const message = getIllegalMoveMessage(source, target);
            toast.error(message, {
                style: { background: '#222', color: '#fff', border: '1px solid #c4541c' },
                icon: '⚠️',
                duration: 4000,
            });
            return false;
        }

        const newGame = new Chess(gameRef.current.fen());
        const move = newGame.move({ from: source, to: target, promotion: legalMove.promotion || 'q' });

        if (!move) {
            toast.error('Invalid move! Please try again.', {
                style: { background: '#222', color: '#fff', border: '1px solid #c4541c' },
                icon: '⚠️',
                duration: 4000,
            });
            return false;
        }

        if (illegalToastId.current) {
            toast.dismiss(illegalToastId.current);
            illegalToastId.current = null;
        }

        gameRef.current = newGame;
        setFen(newGame.fen());
        setMoveHistory(newGame.history());

        if (move.captured) {
            if (move.color === 'w') {
                setWhiteCaptures((caps) => [...caps, move.captured!]);
            } else {
                setBlackCaptures((caps) => [...caps, move.captured!]);
            }
        }

        socket?.emit('move', { room: roomCode, move });
        setActiveTimer(newGame.turn() === 'w' ? 'white' : 'black');

        if (newGame.isCheckmate()) {
            setTimerRunning(false);
            const winnerColor = newGame.turn() === 'w' ? 'black' : 'white'; 
            const winnerMessage = playerColor === winnerColor ? 'You win!' : 'You lose!';
            setGameResult({ winner: winnerColor, reason: 'Checkmate' });
            toast.success(`${winnerMessage} Checkmate!`, { icon: '🏆' });
            triggerConfetti();
            socket?.emit('end-room', { room: roomCode, winner: winnerColor, reason: 'Checkmate' });
        }

        return true;
    };

    const restartGame = () => {
        resetGame();
        socket?.emit('restart', { room: roomCode });
    };

    const endRoom = () => {
        if (role === 'creator') {
            setIsEndingRoom(true);
            setTimerRunning(false);
            socket?.emit('end-room', { room: roomCode });
            setTimeout(() => {
                router.push('/');
            }, 1000);
        }
    };

    useEffect(() => {
        if (gameResult) {
            const isLoser = gameResult.winner !== null && playerColor !== gameResult.winner;
            if (isLoser) {
                const timer = setTimeout(() => {
                    router.push('/');
                }, 15000);
                return () => clearTimeout(timer);
            }
        }
    }, [gameResult, playerColor, router]);

    const renderPieceIcon = (piece: string) => {
        const icons: Record<string, string> = {
            p: '♟',
            n: '♞',
            b: '♝',
            r: '♜',
            q: '♛',
        };
        return icons[piece.toLowerCase()] || piece;
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full relative">
            {loading && (
                <div className="fixed inset-0 flex justify-center items-center rounded-3xl bg-black/70 z-50">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                    <style>{`
                        .loader { border-top-color: #c4541c; animation: spin 1s linear infinite;}
                        @keyframes spin { 0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);}}
                    `}</style>
                </div>
            )}

            <div className="flex w-full justify-center items-start gap-2">

                <div className="flex flex-col items-center text-4xl text-red-500 select-none min-w-[40px] mt-8">
                    {whiteCaptures.map((cap, i) => (
                        <span key={i}>{renderPieceIcon(cap)}</span>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-4 w-full text-xs text-gray-400 uppercase tracking-wider">

                    <div className="w-full max-w-md mx-auto mb-2">
                        <div className="grid grid-cols-3 items-center w-full">

                            <div className="flex items-center gap-2 min-w-0 relative">
                                {!loading && opponentConnected && getCurrentTurn() === "white" && (
                                    <div className="flex items-center absolute left-[-170px] top-1/2 -translate-y-1/2 z-20 animate-fade-in">
                                        <span className="px-3 py-1 rounded-xl bg-black/80 text-white font-medium shadow text-[11px] border border-white/10 min-w-[110px] max-w-[160px] text-center break-words">
                                            {currentDialogue}
                                        </span>
                                        <span className="w-0 h-0 border-y-6 border-y-transparent border-l-[10px] border-l-black/80" />
                                    </div>
                                )}
                                <UserCircleIcon className="w-7 h-7 text-brand drop-shadow" />
                                <span className="font-bold text-lg truncate text-white" title={playerColor === 'white' ? myName : opponentName}>
                                    {playerColor === 'white' ? myName : opponentName}
                                </span>
                            </div>
                            <span className="justify-self-center font-extrabold text-base text-gray-300 px-2">VS</span>
                            <div className="flex items-center gap-2 min-w-0 justify-end relative">
                                {!loading && opponentConnected && getCurrentTurn() === "black" && (
                                    <div className="flex items-center absolute right-[-185px] top-1/2 -translate-y-1/2 z-20 animate-fade-in">
                                        <span className="w-0 h-0 border-y-6 border-y-transparent border-r-[10px] border-r-black/80" />
                                        <span className="px-3 py-1 rounded-xl bg-black/80 text-white font-medium shadow text-[11px] border border-white/10 min-w-[110px] max-w-[160px] text-center break-words">
                                            {currentDialogue}
                                        </span>
                                    </div>
                                )}
                                <span className="font-bold text-lg truncate text-white" title={playerColor === 'white' ? opponentName : myName}>
                                    {playerColor === 'white' ? opponentName : myName}
                                </span>
                                <UserCircleIcon className="w-7 h-7 text-gray-400 drop-shadow" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between w-full z-10 relative items-center gap-2">
                        <div className="flex items-center gap-3">
                            {getCurrentTurn() === "white" && (
                                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500" title="White's turn" />
                            )}
                            <span className="w-5 h-5 rounded border-2 border-white bg-white shadow-lg" />
                            <span className="text-white font-semibold text-base">White</span>
                            <span className="flex items-center gap-1 font-semibold text-white text-sm">
                                <ClockIcon className="h-5 w-5 text-brand" />{formatTime(whiteTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 bg-brand/20 px-4 py-1 rounded-lg border border-brand/70 shadow-md text-brand font-bold text-base md:text-lg mx-2 select-none" title="Room/Game Name">
                            <TrophyIcon className="w-7 h-7 text-yellow-400 drop-shadow" />
                            <span className="text-center truncate max-w-xs text-white">{roomName}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-semibold text-white text-sm">
                                <ClockIcon className="h-5 w-5 text-brand" />{formatTime(blackTime)}
                            </span>
                            <span className="w-5 h-5 rounded border-2 border-black bg-black shadow-lg" />
                            <span className="text-white font-semibold text-base">Black</span>
                            {getCurrentTurn() === "black" && (
                                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500" title="Black's turn" />
                            )}
                        </div>
                    </div>

                    {!opponentConnected && (
                        <div className="flex items-center gap-2 text-xs text-yellow-400 animate-pulse z-10 relative font-bold">
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Waiting for opponent to join..
                        </div>
                    )}

                    {gameResult && (
                        <div className="mt-2 text-base text-amber-400 font-bold bg-black/50 rounded p-2 text-center max-w-md">
                            Game Over: {gameResult.reason}{" "}
                            {gameResult.winner && (() => {
                                const winnerName = gameResult.winner === 'white' ? myName : opponentName;
                                const isWinner = playerColor === gameResult.winner;
                                return (
                                    <>
                                        | Winner: <span className="text-emerald-400">{winnerName}</span>
                                        <div className="mt-1 text-sm font-semibold text-gray-200">
                                            {isWinner
                                                ? "🎉 You Win! Congratulations!"
                                                : "😞 You Lost. Better luck next time."}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    <div className="rounded-xl overflow-hidden border-4 border-brand/60 shadow-2xl backdrop-blur-xl bg-white/10"
                        style={{
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            border: '2.5px solid rgba(255, 255, 255, 0.27)'
                        }}>
                        <Chessboard
                            position={fen}
                            onPieceDrop={onDrop}
                            boardWidth={400}
                            boardOrientation={boardOrientation}
                            isDraggablePiece={isDraggablePiece}
                            customBoardStyle={{
                                background: 'rgba(30,58,138,0.2)',
                                backdropFilter: 'blur(12px)'
                            }}
                            customSquareStyles={customSquareStyles}
                        />
                    </div>

                    <div className="flex gap-4 mt-4 w-full max-w-md">
                        <button
                            onClick={restartGame}
                            className="flex-1 flex items-center text-sm gap-2 justify-center py-2 rounded bg-brand text-white font-bold hover:scale-105 hover:opacity-80 transition shadow-lg cursor-pointer"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                            Restart Game
                        </button>
                        {role === 'creator' && (
                            <button
                                onClick={endRoom}
                                className="flex-1 flex items-center text-sm gap-2 justify-center py-2 rounded bg-red-600 text-white font-bold hover:scale-105 hover:opacity-80 transition shadow-lg cursor-pointer"
                            >
                                <XCircleIcon className="h-5 w-5" />
                                End Room
                            </button>
                        )}
                    </div>

                    {isEndingRoom && role === 'creator' && (
                        <div className="flex justify-center items-center gap-2 text-xs text-gray-300 animate-pulse mt-2">
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Ending room...
                        </div>
                    )}

                    <div className="mt-4 w-full max-w-md bg-black/30 rounded p-2 text-xs text-gray-300 backdrop-blur-md border border-brand/30 max-h-32 overflow-y-auto">
                        <h3 className="font-semibold text-brand mb-1 text-sm">Move History</h3>
                        {moveHistory.length === 0 && <div className="text-gray-200">No moves yet</div>}
                        {moveHistory.map((move, idx) => (
                            <div key={idx}>{idx + 1}. {move}</div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center text-2xl text-red-500 select-none min-w-[40px]">
                    {blackCaptures.map((cap, i) => (
                        <span key={i}>{renderPieceIcon(cap)}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChessBoard;
