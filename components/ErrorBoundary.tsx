'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.fallback) return this.fallback;
            return (
                <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center' }}>
                    <div className="lock-grid-bg" />
                    <div style={{ zIndex: 1, maxWidth: '440px' }}>
                        <h1 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Something went wrong</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            className="send-action-btn"
                            onClick={() => window.location.reload()}
                            style={{ width: '100%' }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }

    private get fallback() {
        return this.props.fallback;
    }
}
