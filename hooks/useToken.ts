import { useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { TOKEN_ABI, TOKEN_ADDRESS } from '../config/contracts';
import { useFhevm } from './useFhevm';

export function useToken() {
    const { address } = useAccount();
    const { decrypt64, encrypt64 } = useFhevm();

    // ── Read balance handle ──
    const { data: balanceHandle, refetch: refetchBalance } = useReadContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        account: address,
        query: { enabled: !!address && !!TOKEN_ADDRESS },
    });

    // ── Write contract ──
    const { writeContractAsync, data: txHash, isPending: isTxPending } = useWriteContract();

    // ── Wait for tx receipt ──
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // ── Reveal balance ──
    const revealBalance = useCallback(
        async (walletAddress: string): Promise<bigint> => {
            if (!balanceHandle) throw new Error('Balance handle not available');

            // TOKEN_ADDRESS is contractAddress here — balance handle belongs to token contract
            return await decrypt64(balanceHandle as bigint, TOKEN_ADDRESS, walletAddress);
        },
        [balanceHandle, decrypt64]
    );

    // ── Send tokens (with FHE encryption) ──
    const sendTokens = useCallback(
        async (to: string, amount: number, senderAddress: string): Promise<string> => {
            // 1. Encrypt the amount for the TOKEN_ADDRESS contract
            const { inputHandle, inputProof } = await encrypt64(
                amount,
                TOKEN_ADDRESS,
                senderAddress
            );

            // 2. Call transfer on MockUSDC
            const hash = await writeContractAsync({
                address: TOKEN_ADDRESS,
                abi: TOKEN_ABI,
                functionName: 'transfer',
                args: [to as `0x${string}`, inputHandle, inputProof],
            });

            return hash;
        },
        [encrypt64, writeContractAsync]
    );

    return {
        // Data
        balanceHandle: balanceHandle as bigint | undefined,
        refetchBalance,

        // Transaction state
        txHash,
        isTxPending,
        isConfirming,
        isConfirmed,

        // Actions
        revealBalance,
        sendTokens,

        // Config
        tokenAddress: TOKEN_ADDRESS,
        isConfigured: !!TOKEN_ADDRESS,
    };
}
