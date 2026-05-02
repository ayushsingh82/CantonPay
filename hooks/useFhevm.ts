import { useState, useEffect, useCallback, useRef } from 'react';
import {
    initSDK,
    createInstance,
    SepoliaConfig,
} from '@zama-fhe/relayer-sdk/web';
import { getAddress, BrowserProvider } from 'ethers';

type FhevmInstance = Awaited<ReturnType<typeof createInstance>>;

// Module-level singleton — survives HMR and re-renders
let _instance: FhevmInstance | null = null;
let _initPromise: Promise<FhevmInstance> | null = null;

const toHex = (u8: Uint8Array | string): `0x${string}` => {
    if (typeof u8 === 'string') return (u8.startsWith('0x') ? u8 : '0x' + u8) as `0x${string}`;
    return ('0x' + Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;
};

async function getOrCreateInstance(): Promise<FhevmInstance> {
    if (_instance) return _instance;
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
        // 1. Load WASM binaries
        console.log('[fhevmjs] Loading WASM from /tfhe_bg.wasm and /kms_lib_bg.wasm...');
        await initSDK({
            tfheParams: '/tfhe_bg.wasm',
            kmsParams: '/kms_lib_bg.wasm',
        });
        console.log('[fhevmjs] WASM loaded via initSDK');

        // 2. Network Check
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const currentChainId = Number(network.chainId);
        console.log('[fhevmjs] Wallet connected to Chain ID:', currentChainId);

        if (currentChainId !== SepoliaConfig.chainId) {
            throw new Error(`[fhevmjs] Network mismatch! Your wallet is on Chain ID ${currentChainId}, but Zama Relayer expects ${SepoliaConfig.chainId} (Sepolia). Please switch your network in MetaMask.`);
        }

        // 3. Create instance using SepoliaConfig + window.ethereum as recommended by Zama docs
        const config = {
            ...SepoliaConfig,
            network: window.ethereum,
        };

        console.log('[fhevmjs] Creating instance via Zama Relayer SDK...');
        const inst = await createInstance(config);
        console.log('[fhevmjs] Instance created successfully');

        if (!inst || typeof (inst as any).createEncryptedInput !== 'function') {
            throw new Error('Zama Relayer SDK: createInstance returned an invalid instance.');
        }

        _instance = inst as FhevmInstance;
        return _instance;
    })();

    _initPromise.catch((err) => {
        console.error('[fhevmjs] initPromise failed:', err);
        _initPromise = null;
    });
    return _initPromise;
}

export function useFhevm() {
    const [instance, setInstance] = useState<FhevmInstance | null>(_instance);
    const [isInitializing, setIsInitializing] = useState(!_instance);
    const [error, setError] = useState<string | null>(null);
    const attemptedRef = useRef(false);

    useEffect(() => {
        if (_instance) { setInstance(_instance); setIsInitializing(false); return; }
        if (attemptedRef.current) return;
        attemptedRef.current = true;

        getOrCreateInstance()
            .then(inst => {
                setInstance(inst);
                setIsInitializing(false);
            })
            .catch(err => {
                console.error('[fhevmjs] useFhevm useEffect init failed:', err);
                setError(err.message || String(err));
                setIsInitializing(false);
            });
    }, []);

    const encrypt64 = useCallback(
        async (value: number | bigint, contractAddress: string, userAddress: string) => {
            const inst = await getOrCreateInstance();

            const input = inst.createEncryptedInput(
                getAddress(contractAddress) as `0x${string}`,
                getAddress(userAddress) as `0x${string}`
            );
            input.add64(typeof value === 'bigint' ? value : BigInt(value));

            const encrypted = await input.encrypt();

            const handle = encrypted.handles[0];
            const proof = encrypted.inputProof;

            return {
                inputHandle: toHex(handle as unknown as Uint8Array | string),
                inputProof: toHex(proof as unknown as Uint8Array | string),
            };
        },
        []
    );

    const decrypt64 = useCallback(
        async (handleInput: string | bigint, contractAddress: string, userAddress: string): Promise<bigint> => {
            const inst = await getOrCreateInstance();

            // Ensure handle is a hex string starting with 0x
            let handle: string;
            if (typeof handleInput === 'bigint') {
                handle = '0x' + handleInput.toString(16).padStart(64, '0');
            } else {
                const hex = (handleInput as string).startsWith('0x') ? (handleInput as string).slice(2) : (handleInput as string);
                handle = '0x' + hex.padStart(64, '0');
            }

            console.log('[fhevmjs] Decrypting handle:', handle, `(Length: ${handle.length})`);

            // 1. Generate ephemeral keypair
            const keypair = inst.generateKeypair();

            // 2. Create EIP712 request
            const startTimestamp = Math.floor(Date.now() / 1000);
            const durationDays = 1;

            const eip712 = inst.createEIP712(
                keypair.publicKey,
                [getAddress(contractAddress)],
                startTimestamp,
                durationDays
            );

            console.log('[fhevmjs] EIP-712 Request:', eip712);

            // 3. User signs
            const signature = await window.ethereum.request({
                method: 'eth_signTypedData_v4',
                params: [
                    userAddress,
                    JSON.stringify(eip712, (_key, value) =>
                        typeof value === 'bigint' ? value.toString() : value
                    ),
                ],
            });

            // 4. Decrypt
            const results = await inst.userDecrypt(
                [{ handle, contractAddress: getAddress(contractAddress) }],
                keypair.privateKey,
                keypair.publicKey,
                signature as string,
                [getAddress(contractAddress)],
                getAddress(userAddress),
                startTimestamp,
                durationDays
            );

            console.log('[fhevmjs] Decryption results:', results);

            // Search for the handle in the results map (case-insensitive lookup as fallback)
            const handleLower = handle.toLowerCase();
            const matchingKey = Object.keys(results).find(k => k.toLowerCase() === handleLower);

            if (!matchingKey || (results as any)[matchingKey] === undefined) {
                console.error('[fhevmjs] Decryption result not found for handle. Results:', results);
                throw new Error(`Decryption failed: result not found for handle ${handle}.`);
            }

            const clearValue = (results as any)[matchingKey];
            console.log('[fhevmjs] Decrypted value:', clearValue);

            return BigInt(clearValue as string | number | boolean);
        },
        []
    );

    const decryptPublic = useCallback(
        async (handleInput: string | bigint): Promise<bigint> => {
            const inst = await getOrCreateInstance();

            let handle: string;
            if (typeof handleInput === 'bigint') {
                handle = '0x' + handleInput.toString(16).padStart(64, '0');
            } else {
                const hex = (handleInput as string).startsWith('0x') ? (handleInput as string).slice(2) : (handleInput as string);
                handle = '0x' + hex.padStart(64, '0');
            }

            console.log('[fhevmjs] Publicly decrypting handle:', handle);
            const handleHex = handle as `0x${string}`;
            const results = await inst.publicDecrypt([handleHex]);

            const clearValue = results.clearValues[handleHex];
            console.log('[fhevmjs] Public decryption result:', clearValue);

            return BigInt(clearValue as string | number);
        },
        []
    );

    return { instance, isInitializing, error, encrypt64, decrypt64, decryptPublic };
}
