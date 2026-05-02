'use client';

import { EmployeeTable } from './EmployeeTable';

interface EmployeeListProps {
    addresses: string[];
    isEmployer: boolean;
    onRemove: (address: string) => Promise<string>;
    isLoading: boolean;
    walletAddress: string;
    contractAddress: string;
    nftAddress?: `0x${string}`;
}

export function EmployeeList({
    addresses,
    isEmployer,
    onRemove,
    isLoading,
    walletAddress,
    contractAddress,
    nftAddress
}: EmployeeListProps) {
    const handleFire = async (address: string) => {
        try {
            await onRemove(address);
        } catch (err) {
            console.error('Failed to remove employee:', err);
        }
    };

    return (
        <EmployeeTable
            addresses={addresses}
            isEmployer={isEmployer}
            isLoading={isLoading}
            onFire={handleFire}
            walletAddress={walletAddress}
            contractAddress={contractAddress}
            nftAddress={nftAddress}
        />
    );
}
