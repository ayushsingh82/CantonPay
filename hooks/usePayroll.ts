import { useState, useCallback, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { PAYROLL_ABI } from '../config/contracts';
import { useFhevm } from './useFhevm';

export function usePayroll(contractAddress: `0x${string}`) {
  const { address } = useAccount();
  const { encrypt64 } = useFhevm();

  // ── Read employer address ──
  const { data: employer } = useReadContract({
    address: contractAddress,
    abi: PAYROLL_ABI,
    functionName: 'employer',
    query: { enabled: !!contractAddress },
  });

  // ── Read full employee list from chain ──
  const {
    data: employeeAddresses,
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
  } = useReadContract({
    address: contractAddress,
    abi: PAYROLL_ABI,
    functionName: 'getEmployees',
    query: { enabled: !!contractAddress },
  });

  // ── Read token address ──
  const { data: tokenAddress } = useReadContract({
    address: contractAddress,
    abi: PAYROLL_ABI,
    functionName: 'token',
    query: { enabled: !!contractAddress },
  });

  // ── Read NFT address ──
  const { data: nftAddress } = useReadContract({
    address: contractAddress,
    abi: PAYROLL_ABI,
    functionName: 'nft',
    query: { enabled: !!contractAddress },
  });

  // ── Read Treasury Handle ──
  const { data: treasuryHandle, refetch: refetchTreasury } = useReadContract({
    address: contractAddress,
    abi: PAYROLL_ABI,
    functionName: 'getTreasuryHandle',
    account: address,
    query: { enabled: !!contractAddress && !!address },
  });

  // ── Read Payroll Cooldown ──
  const { data: payrollCooldown, refetch: refetchCooldown } = useReadContract({
    address: contractAddress,
    abi: PAYROLL_ABI,
    functionName: 'payrollCooldown',
    query: { enabled: !!contractAddress },
  });

  // ── Read Last Payroll Run ──
  const { data: lastPayrollRun, refetch: refetchLastRun } = useReadContract({
    address: contractAddress,
    abi: PAYROLL_ABI,
    functionName: 'lastPayrollRun',
    query: { enabled: !!contractAddress },
  });

  // ── Write contract ──
  const { writeContractAsync, data: txHash, isPending: isTxPending } = useWriteContract();

  // ── Wait for tx receipt ──
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ── Auto-refetch after transaction confirmation ──
  useEffect(() => {
    if (isConfirmed) {
      refetchEmployees();
    }
  }, [isConfirmed, refetchEmployees]);

  // ── Run Payroll ──
  const runPayroll = useCallback(async (): Promise<string> => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: PAYROLL_ABI,
      functionName: 'runPayroll',
    });
    return hash;
  }, [writeContractAsync, contractAddress]);

  // ── Add Employee (with FHE encryption) ──
  const addEmployee = useCallback(
    async (employeeAddress: string, salaryAmount: number, callerAddress: string): Promise<string> => {
      const { inputHandle, inputProof } = await encrypt64(
        salaryAmount,
        contractAddress,
        callerAddress
      );

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: PAYROLL_ABI,
        functionName: 'addEmployee',
        args: [employeeAddress as `0x${string}`, inputHandle, inputProof],
      });

      return hash;
    },
    [writeContractAsync, encrypt64, refetchEmployees, contractAddress]
  );

  // ── Remove Employee ──
  const removeEmployee = useCallback(
    async (employeeAddress: string): Promise<string> => {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: PAYROLL_ABI,
        functionName: 'removeEmployee',
        args: [employeeAddress as `0x${string}`],
      });

      return hash;
    },
    [writeContractAsync, refetchEmployees, contractAddress]
  );

  // ── Update Salary (with FHE encryption) ──
  const updateSalary = useCallback(
    async (employeeAddress: string, salaryAmount: number, callerAddress: string): Promise<string> => {
      const { inputHandle, inputProof } = await encrypt64(
        salaryAmount,
        contractAddress,
        callerAddress
      );

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: PAYROLL_ABI,
        functionName: 'updateSalary',
        args: [employeeAddress as `0x${string}`, inputHandle, inputProof],
      });

      return hash;
    },
    [writeContractAsync, encrypt64, contractAddress]
  );

  // ── Pay Bonus (with FHE encryption) ──
  const payBonus = useCallback(
    async (employeeAddress: string, bonusAmount: number, memo: string, callerAddress: string): Promise<string> => {
      const { inputHandle, inputProof } = await encrypt64(
        bonusAmount,
        contractAddress,
        callerAddress
      );

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: PAYROLL_ABI,
        functionName: 'payBonus',
        args: [employeeAddress as `0x${string}`, inputHandle, inputProof, memo],
      });

      return hash;
    },
    [writeContractAsync, encrypt64, contractAddress]
  );

  // ── Set Payroll Cooldown ──
  const setPayrollCooldown = useCallback(
    async (cooldownInSeconds: number): Promise<string> => {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: PAYROLL_ABI,
        functionName: 'setPayrollCooldown',
        args: [BigInt(cooldownInSeconds)],
      });
      return hash;
    },
    [writeContractAsync, contractAddress]
  );

  // ── Grant Salary Access ──
  const grantSalaryAccess = useCallback(
    async (thirdPartyAddress: string): Promise<string> => {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: PAYROLL_ABI,
        functionName: 'grantSalaryAccess',
        args: [thirdPartyAddress as `0x${string}`],
      });
      return hash;
    },
    [writeContractAsync, contractAddress]
  );

  // ── Sync Treasury Allowance ──
  const syncTreasuryAllowance = useCallback(async (): Promise<string> => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: PAYROLL_ABI,
      functionName: 'syncTreasuryAllowance',
      gas: 5_000_000n,
    });
    return hash;
  }, [writeContractAsync, contractAddress]);

  return {
    // Data
    employer: employer as `0x${string}` | undefined,
    tokenAddress: tokenAddress as `0x${string}` | undefined,
    nftAddress: nftAddress as `0x${string}` | undefined,
    employeeAddresses: (employeeAddresses || []) as string[],
    isLoadingEmployees,
    refetchEmployees,

    // Transaction state
    txHash,
    isTxPending,
    isConfirming,
    isConfirmed,

    // Actions
    addEmployee,
    removeEmployee,
    runPayroll,
    grantSalaryAccess,
    syncTreasuryAllowance,
    updateSalary,
    payBonus,
    setPayrollCooldown,

    // State
    payrollCooldown: payrollCooldown as bigint | undefined,
    lastPayrollRun: lastPayrollRun as bigint | undefined,
    refetchCooldown,
    refetchLastRun,

    // Treasury
    treasuryHandle: treasuryHandle as bigint | undefined,
    refetchTreasury,

    // Config
    contractAddress,
    isConfigured: !!contractAddress,
  };
}