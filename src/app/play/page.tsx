'use client';

import { useSearchParams } from 'next/navigation';
import ChessBoard from '@/components/ChessBoard';

export default function PlayPage() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('room') || 'default';
    const playerName = searchParams.get('name') || 'Anonymous';

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-4">
            <h1 className="text-2xl font-extrabold mb-4 text-brand animate-pulse tracking-widest uppercase">
                Room: {roomCode} | Player: {playerName}
            </h1>

            <div className="w-full max-w-2xl relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand via-pink-500 to-brand opacity-20 blur-2xl animate-pulse"></div>

                <div className="relative z-10 p-4 rounded-2xl bg-gray-800/40 backdrop-blur-md border border-brand/30 shadow-xl">
                    <ChessBoard />
                </div>
            </div>
        </main>
    );
}
