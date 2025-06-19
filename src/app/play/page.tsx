'use client';

import { useSearchParams } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import ChessBoard from '@/components/ChessBoard';
import RoomCode from '@/components/RoomCode';

export default function PlayPage() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('room') || 'default';
    const playerName = searchParams.get('name') || 'Anonymous';

    return (
        <main className="relative flex flex-col items-center justify-center min-h-screen  text-white overflow-hidden">

            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/chess_bg.png"
                    alt="Chess background"
                    fill
                    className="object-cover opacity-30"
                    priority
                />
            </div>

            <header className="relative z-10 text-center mb-8 space-y-4">
                <div className="flex items-center justify-center gap-4">
                    <RoomCode code={roomCode} />
                </div>
                <div className="flex items-center justify-center gap-3 mt-3">
                    <UserCircleIcon className="w-9 h-9 text-brand drop-shadow" />
                    <p className="text-2xl md:text-3xl font-extrabold text-brand drop-shadow-sm">
                        Welcome, <span className="text-white underline underline-offset-4">{playerName}</span>!
                    </p>
                </div>
            </header>

            <div className="relative z-10 w-full max-w-3xl p-8 bg-white/20 rounded-3xl border-4 border-brand/60 shadow-2xl backdrop-blur-2xl">
                <ChessBoard />
            </div>
        </main>
    );
}
