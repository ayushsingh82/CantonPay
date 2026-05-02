'use client';

import { useState, useEffect, useCallback } from 'react';

const HEX_CHARS = '0123456789ABCDEF';
const SCRAMBLE_ITERATIONS = 8;
const SCRAMBLE_INTERVAL = 40;

interface CipherTextProps {
    value: string;
    revealed: boolean;
    onToggle: () => void;
}

export function CipherText({ value, revealed, onToggle }: CipherTextProps) {
    const [displayText, setDisplayText] = useState('[ENCRYPTED]');
    const [isAnimating, setIsAnimating] = useState(false);

    const scrambleReveal = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);

        const target = value;
        let iteration = 0;

        const interval = setInterval(() => {
            setDisplayText(
                target
                    .split('')
                    .map((char, idx) => {
                        if (idx < Math.floor((iteration / SCRAMBLE_ITERATIONS) * target.length)) {
                            return char;
                        }
                        return HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
                    })
                    .join('')
            );

            iteration++;

            if (iteration > SCRAMBLE_ITERATIONS) {
                clearInterval(interval);
                setDisplayText(target);
                setIsAnimating(false);
            }
        }, SCRAMBLE_INTERVAL);
    }, [value, isAnimating]);

    const scrambleHide = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);

        const source = value;
        let iteration = 0;

        const interval = setInterval(() => {
            setDisplayText(
                source
                    .split('')
                    .map((char, idx) => {
                        if (idx >= source.length - Math.floor((iteration / SCRAMBLE_ITERATIONS) * source.length)) {
                            return HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
                        }
                        return char;
                    })
                    .join('')
            );

            iteration++;

            if (iteration > SCRAMBLE_ITERATIONS) {
                clearInterval(interval);
                setDisplayText('[ENCRYPTED]');
                setIsAnimating(false);
            }
        }, SCRAMBLE_INTERVAL);
    }, [value, isAnimating]);

    useEffect(() => {
        if (revealed) {
            scrambleReveal();
        } else if (displayText !== '[ENCRYPTED]' && !isAnimating) {
            scrambleHide();
        }
    }, [revealed]);

    if (!revealed && displayText === '[ENCRYPTED]') {
        return (
            <span className="encrypted-badge" onClick={onToggle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="m7 11 0-4a5 5 0 0 1 10 0l0 4" />
                </svg>
                ENCRYPTED
            </span>
        );
    }

    return (
        <span className="cipher-value" onClick={onToggle} style={{ cursor: 'pointer' }}>
            {displayText}
        </span>
    );
}
