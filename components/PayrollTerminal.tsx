'use client';

import { useState, useEffect, useRef } from 'react';

interface TerminalStep {
    text: string;
    duration: number;
}

const DEMO_STEPS: TerminalStep[] = [
    { text: 'Resolving party session (JSON API actAs)…', duration: 500 },
    { text: 'Fetching PayrollOrganization + employment contracts…', duration: 700 },
    { text: 'Exercising RunPayroll choice…', duration: 1000 },
    { text: 'Command accepted by participant…', duration: 800 },
    { text: 'Ledger update committed ✓', duration: 400 },
];

interface PayrollTerminalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Truncated JSON API exercise response, if any. */
    ledgerSummary?: string | null;
    isLive?: boolean;
}

export function PayrollTerminal({ isOpen, onClose, ledgerSummary, isLive }: PayrollTerminalProps) {
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

        if (ledgerSummary) {
            const s = String(ledgerSummary);
            steps.push({
                text: `Last response: ${s.length > 72 ? `${s.slice(0, 72)}…` : s}`,
                duration: 0,
            });
        }

        if (!isLive) {
            steps.push({ text: '(Demo — set NEXT_PUBLIC_CANTON_JSON_API_URL for a live ledger)', duration: 0 });
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
    }, [isOpen, ledgerSummary, isLive]);

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
                    <span className="terminal-title">CantonPay — executor {isLive ? '(live)' : '(demo)'}</span>
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
