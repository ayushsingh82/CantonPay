import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';

export function useWallet() {
    const { address, isConnected, chain } = useAccount();
    const { connect, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();

    const connectWallet = () => {
        connect({ connector: injected(), chainId: sepolia.id });
    };

    return {
        address,
        isConnected,
        isConnecting,
        chain,
        connect: connectWallet,
        disconnect,
        switchChain: () => switchChain({ chainId: sepolia.id }),
    };
}
