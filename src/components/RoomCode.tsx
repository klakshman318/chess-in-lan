import { ClipboardIcon } from '@heroicons/react/24/outline';
import { KeyIcon } from '@heroicons/react/24/solid';
import { useState, useRef } from 'react';

export default function RoomCode({ code }: { code: string }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [copied, setCopied] = useState(false);
    const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleShowTooltip = () => {
        if (copied) return;
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        setShowTooltip(true);
    };

    const handleHideTooltip = () => {
        if (copied) return;
        tooltipTimeout.current = setTimeout(() => setShowTooltip(false), 300);
    };

    const handleCopy = async () => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setShowTooltip(true);
                tooltipTimeout.current = setTimeout(() => {
                    setShowTooltip(false);
                    setCopied(false);
                }, 1000);
            } catch {
                setCopied(false);
            }
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setShowTooltip(true);
                tooltipTimeout.current = setTimeout(() => {
                    setShowTooltip(false);
                    setCopied(false);
                }, 1000);
            } catch {
                setCopied(false);
            }
            document.body.removeChild(textarea);
        }
    };

    const handleClick = () => handleCopy();

    return (
        <div
            className="flex items-center gap-2 relative select-none cursor-pointer group"
            tabIndex={0}
            aria-label="Room code"
            onMouseEnter={handleShowTooltip}
            onMouseLeave={handleHideTooltip}
            onFocus={handleShowTooltip}
            onBlur={handleHideTooltip}
            onClick={handleClick}
            onTouchStart={handleShowTooltip}
            onTouchEnd={handleCopy}
            style={{ outline: 'none' }}
        >
            <KeyIcon className="w-7 h-7 text-brand drop-shadow" />
            <span className="font-mono text-2xl md:text-3xl font-extrabold tracking-wider px-2 py-1 bg-black/30 rounded-lg border border-brand/60 text-white shadow-lg transition-transform group-active:scale-95 group-hover:scale-105">
                {code}
            </span>
            <span className="relative flex items-center">
                <ClipboardIcon className="w-5 h-5 text-white opacity-90 transition-transform group-hover:scale-110" />
                <span
                    className={`
                        absolute left-1/2 top-[150%] -translate-x-1/2 px-4 py-2 rounded shadow
                        text-xs font-semibold border border-brand text-white pointer-events-none
                        transition-all duration-200 z-40
                        ${showTooltip || copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                        ${copied ? 'bg-emerald-600 border-emerald-500' : 'bg-black/90'}
                    `}
                    style={{
                        whiteSpace: 'nowrap',
                    }}
                >
                    {copied ? "Copied!" : "Copy code"}
                    <span
                        className={`
                            absolute left-1/2 -top-2 -translate-x-1/2
                            w-0 h-0
                            border-x-8 border-x-transparent
                            ${copied
                                ? 'border-b-[10px] border-b-emerald-600'
                                : 'border-b-[10px] border-b-black/90'}
                        `}
                        style={{
                            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.07))',
                        }}
                    />
                    <span
                        className={`
                            absolute left-1/2 -top-[10px] -translate-x-1/2
                            w-0 h-0
                            border-x-8 border-x-transparent
                            ${copied
                                ? 'border-b-[12px] border-b-emerald-500'
                                : 'border-b-[12px] border-b-brand'}
                            z-[-1]
                        `}
                    />
                </span>
            </span>
        </div>
    );
}
