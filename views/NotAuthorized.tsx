"use client";

import { Lock, Home } from "lucide-react";
import Link from "next/link";

interface NotAuthorizedProps {
    message?: string;
}

export function NotAuthorized({ message = "You are not part of this organization" }: NotAuthorizedProps) {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'var(--bg-root)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
            }}>
                <Lock size={32} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Access Denied</h1>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px', maxWidth: '400px' }}>
                {message}
            </p>

            <Link
                href="/"
                className="send-action-btn"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center' }}
            >
                <Home size={16} style={{ marginRight: '8px' }} />
                Back to Home
            </Link>
        </div>
    );
}
