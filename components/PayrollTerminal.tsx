'use client';

import { useState, useEffect, useRef } from 'react';

interface TerminalStep {
    text: string;
    duration: number;
}

const DEMO_STEPS: TerminalStep[] = [
    { text: 'Initializing FHEVM instance...', duration: 800 },
    { text: 'Fetching employee roster...', duration: 600 },
    { text: 'Encrypting salary batch via coprocessor...', duration: 1400 },
    { text: 'Building transaction calldata...', duration: 500 },
    { text: 'Submitting tx to Sepolia...', duration: 1200 },
    { text: 'Awaiting coprocessor confirmation...', duration: 1800 },
    { text: 'Block confirmed ✓', duration: 400 },
];

interface PayrollTerminalProps {
    isOpen: boolean;
    onClose: () => void;
    txHash?: string | null;
    isLive?: boolean;
}

export function PayrollTerminal({ isOpen, onClose, txHash, isLive }: PayrollTerminalProps) {
    const [lines, setLines] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setLines([]);
            setIsComplete(false);
            setShowCursor(true);
            return;
        }

        let stepIdx = 0;
        let timeout: ReturnType<typeof setTimeout>;

        const steps = [...DEMO_STEPS];

        // If there's a real tx hash, replace the last step
        if (txHash) {
            steps.push({ text: `Tx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`, duration: 0 });
        }

        if (!isLive) {
            steps.push({ text: '(Demo mode — connect wallet for live execution)', duration: 0 });
        }

        const runStep = () => {
            if (stepIdx >= steps.length) {
                setIsComplete(true);
                setShowCursor(false);
                return;
            }

            const step = steps[stepIdx];
            setLines(prev => [...prev, step.text]);
            stepIdx++;

            timeout = setTimeout(runStep, step.duration);
        };

        timeout = setTimeout(runStep, 400);

        return () => clearTimeout(timeout);
    }, [isOpen, txHash, isLive]);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [lines]);

    if (!isOpen) return null;

    return (
        <div className="terminal-overlay" onClick={isComplete ? onClose : undefined}>
            <div className="terminal" onClick={e => e.stopPropagation()}>
                <div className="terminal-header">
                    <div className="terminal-dot red" />
                    <div className="terminal-dot yellow" />
                    <div className="terminal-dot green" />
                    <span className="terminal-title">canton-payroll — executor {isLive ? '(live)' : '(demo)'}</span>
                </div>
                <div className="terminal-body" ref={bodyRef}>
                    {lines.map((line, i) => (
                        <div
                            key={i}
                            className={`terminal-line ${i === lines.length - 1 && isComplete ? 'done' : ''}`}
                        >
                            <span className="prefix">&gt;</span>
                            {line}
                        </div>
                    ))}
                    {showCursor && <span className="terminal-cursor" />}
                </div>
                {isComplete && (
                    <div className="terminal-footer">
                        <button className="btn btn-primary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
