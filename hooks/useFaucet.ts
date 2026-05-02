import { useState, useCallback } from 'react';

export function useFaucet() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const requestMUSDC = useCallback(async (address: string) => {
        if (!address) return;

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            console.log('[useFaucet] Requesting 10,000 mUSDC for:', address);
            
            // Integrated faucet URL. In development hooks this might be http://localhost:3001/request,
            // but in the Docker Compose production setup it is proxied via /faucet/request
            const faucetUrl = process.env.NEXT_PUBLIC_FAUCET_URL || '/faucet/request';
            console.log(faucetUrl);
            const response = await fetch(faucetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('[useFaucet] Success! TX:', data.txHash);
                setStatus('success');
                setMessage('✅ 10,000 mUSDC sent to your wallet from the faucet service');
            } else {
                const err = await response.json();
                console.error('[useFaucet] Request failed:', err.error);
                setStatus('error');
                setMessage(`❌ Request failed: ${err.error || 'System error'}`);
            }
        } catch (error: any) {
            console.error('[useFaucet] Request failed:', error);
            setStatus('error');
            setMessage('❌ Request failed. Ensure the faucet service is running.');
        } finally {
            setIsLoading(false);

            // Reset after 5 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        }
    }, []);

    return {
        requestMUSDC,
        isLoading,
        status,
        message
    };
}
