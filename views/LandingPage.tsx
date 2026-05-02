import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useWallet } from "../hooks/useWallet";
import {
  Plus,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Hash,
  Coins,
  ExternalLink,
  Lock,
  Eye,
  Fingerprint,
  Zap,
  Shield,
  Database,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FACTORY_ADDRESS, FACTORY_ABI } from "../config/contracts";
import { formatEther, isAddress, decodeEventLog } from "viem";
import { Globe, Building2 } from "lucide-react";
import { useFaucet } from "../hooks/useFaucet";
import { motion } from "motion/react";
import { NzuzoLogo } from "../components/NzuzoLogo";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function LandingPage() {
  const {
    address,
    isConnected,
    connect,
    isConnecting: isWalletConnecting,
    chain,
    switchChain,
  } = useWallet();
  const isWrongNetwork = isConnected && chain?.id !== 11155111;
  const navigate = useNavigate();
  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });
  const {
    requestMUSDC,
    isLoading: isFaucetLoading,
    status: faucetStatus,
    message: faucetMessage,
  } = useFaucet();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const { data: deploymentFee } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "deploymentFee",
  });

  const handleCreateOrg = async () => {
    if (!deploymentFee) return;
    try {
      await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createPayroll",
        value: deploymentFee as bigint,
      });
    } catch (err) {
      console.error("[LandingPage] Deployment failed:", err);
    }
  };

  // Watch for receipt and redirect to the new organization
  useEffect(() => {
    if (receipt) {
      const log = receipt.logs.find(
        (l) => l.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase(),
      );
      if (log) {
        try {
          const decoded = decodeEventLog({
            abi: FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "PayrollCreated") {
            const { payrollContract } = decoded.args as any;
            if (payrollContract) {
              setIsCreateModalOpen(false);
              navigate(`/org/${payrollContract}`);
            }
          }
        } catch (e) {
          console.error("Failed to decode deployment log", e);
        }
      }
    }
  }, [receipt, navigate]);

if (!isConnected) {
    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
      },
    };
    const item = {
      hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.55 },
      },
    };
    const fadeUp = {
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
      <div
        className="app-layout"
        style={{
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "40px",
        }}
      >
        <div className="lock-grid-bg" />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ maxWidth: "600px", textAlign: "center", zIndex: 1 }}
        >
          
          <motion.div variants={item} style={{ marginBottom: "36px", marginTop:'4rem' }}>
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                filter: "blur(20px)",
                transform: "translate(-50%, -50%)",
                left: "50%",
                top: "60px",
                pointerEvents: "none",
              }}
            />

            
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                width: "88px",
                height: "88px",
                margin: "0 auto",
                position: "relative",
              }}
            >
           
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "24px",
                  border: "1px solid var(--accent)",
                  opacity: 0.25,
                 
                }}
              />
             
              <div
                style={{
                  position: "absolute",
                  inset: "3px",
                  borderRadius: "21px",
                  background:
                    "linear-gradient(135deg, var(--accent-dim) 0%, rgba(16,185,129,0.06) 100%)",
                  border: "1px solid var(--accent)",
                 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
              
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 42 42"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                
                  <path
                    d="M21 4L8 9V20C8 28.4 13.6 36.2 21 38C28.4 36.2 34 28.4 34 20V9L21 4Z"
                    fill="var(--accent)"
                    fillOpacity="0.12"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
              
                  <text
                    x="21"
                    y="27"
                    textAnchor="middle"
                    fill="var(--accent)"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize="20"
                    fontWeight="800"
                    letterSpacing="-0.5"
                  >
                    N
                  </text>
               
                  <circle cx="21" cy="33" r="1.5" fill="var(--accent)" fillOpacity="0.5" />
                </svg>
              </div>
            </motion.div>
          </motion.div>

      
          <motion.div variants={item} style={{ marginBottom: "4px" }}>
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Nzuzo{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, #34d399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Pay
              </span>
            </h1>
          </motion.div>
          <motion.div variants={item} style={{ marginBottom: "24px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent)",
                background: "var(--accent-dim)",
                border: "1px solid var(--accent)",
                // borderOpacity: 0.25,
                borderRadius: "99px",
                padding: "4px 12px",
              }}
            >
           
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              FHE-Powered · Sepolia Testnet
            </span>
          </motion.div>

        
          <motion.p
            variants={item}
            style={{
              fontSize: "17px",
              color: "var(--text-secondary)",
              marginBottom: "40px",
              lineHeight: 1.65,
              maxWidth: "460px",
              margin: "0 auto 40px",
            }}
          >
            Privacy-first payroll management powered by Fully Homomorphic
            Encryption. Keep your organization's financial data confidential
            on-chain.
          </motion.p>

        
          <motion.div variants={item} style={{ marginBottom: "0" }}>
            <motion.button
              className="send-action-btn"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                padding: "16px 40px",
                fontSize: "16px",
                margin: "0 auto",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 0 32px rgba(16,185,129,0.2)",
              }}
              onClick={connect}
              disabled={isWalletConnecting}
            >
              {isWalletConnecting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                    style={{ marginRight: "4px" }}
                  />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Wallet to Start
                 
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: "inline-flex" }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </>
              )}
            </motion.button>
          </motion.div>

         
          <motion.div
            variants={fadeUp}
            style={{
              marginTop: "56px",
              padding: "32px",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius)",
              background: "var(--bg-elevated)",
              textAlign: "left",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Coins size={20} /> Mint Testnet Tokens
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              To use Nzuzo Pay on Sepolia you need testnet tokens.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  Sepolia ETH — required for gas fees
                </h3>
                <a
                  href="https://sepolia-faucet.pk910.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reveal-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    height: "36px",
                  }}
                >
                  Get Sepolia ETH <ExternalLink size={14} />
                </a>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  mUSDC — required to fund your payroll treasury
                </h3>
                <div title={!isConnected ? "Connect wallet first" : ""}>
                  <button
                    className="send-action-btn"
                    onClick={() => address && requestMUSDC(address)}
                    disabled={!isConnected || isFaucetLoading}
                    style={{
                      height: "36px",
                      width: "100%",
                      justifyContent: "center",
                      opacity: !isConnected ? 0.5 : 1,
                    }}
                  >
                    {isFaucetLoading
                      ? "Minting..."
                      : faucetStatus === "success"
                      ? "✅ 10,000 minted"
                      : faucetStatus === "error"
                      ? "❌ Mint failed"
                      : "Mint mUSDC"}
                  </button>
                  {faucetMessage && (
                    <p
                      style={{
                        fontSize: "11px",
                        marginTop: "4px",
                        textAlign: "center",
                        color:
                          faucetStatus === "success"
                            ? "var(--accent)"
                            : "var(--status-danger)",
                      }}
                    >
                      {faucetMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div
        className="app-layout"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className="lock-grid-bg" />
        <div
          style={{
            maxWidth: "400px",
            textAlign: "center",
            padding: "40px",
            zIndex: 1,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius)",
          }}
        >
          <div style={{ color: "var(--status-danger)", marginBottom: "16px" }}>
            <ShieldCheck size={48} style={{ margin: "0 auto" }} />
          </div>
          <h2
            style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}
          >
            Wrong Network
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            Nzuzo Pay operates exclusively on Ethereum Sepolia. Please switch
            your network to continue.
          </p>
          <button
            className="send-action-btn"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={switchChain}
          >
            Switch to Sepolia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout" style={{ padding: "40px", overflowY: "auto" }}>
      <div className="lock-grid-bg" />
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          width: "100%",
          zIndex: 1,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "48px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: "var(--text-tertiary)" }}>
              Manage your organizations or join a new one.
            </p>
          </div>
          <button
            className="send-action-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} style={{ marginRight: "8px" }} />
            Create Organization
          </button>
        </div>

  
        <div
          style={{
            padding: "32px",
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--radius)",
            background: "var(--bg-elevated)",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Coins size={20} /> Mint Testnet Tokens
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            To use Nzuzo Pay on Sepolia you need testnet tokens.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                Sepolia ETH — required for gas fees
              </h3>
              <a
                href="https://sepolia-faucet.pk910.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="reveal-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  height: "36px",
                }}
              >
                Get Sepolia ETH <ExternalLink size={14} />
              </a>
            </div>

            <div>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                mUSDC — required to fund your payroll treasury
              </h3>
              <div title={!isConnected ? "Connect wallet first" : ""}>
                <button
                  className="send-action-btn"
                  onClick={() => address && requestMUSDC(address)}
                  disabled={!isConnected || isFaucetLoading}
                  style={{
                    height: "36px",
                    width: "100%",
                    justifyContent: "center",
                    opacity: !isConnected ? 0.5 : 1,
                  }}
                >
                  {isFaucetLoading
                    ? "Minting..."
                    : faucetStatus === "success"
                    ? "✅ 10,000 minted"
                    : faucetStatus === "error"
                    ? "❌ Mint failed"
                    : "Mint mUSDC"}
                </button>
                {faucetMessage && (
                  <p
                    style={{
                      fontSize: "11px",
                      marginTop: "4px",
                      textAlign: "center",
                      color:
                        faucetStatus === "success"
                          ? "var(--accent)"
                          : "var(--status-danger)",
                    }}
                  >
                    {faucetMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "64px",
          }}
        >
         
          <div
            style={{
              padding: "32px",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius)",
              background: "var(--bg-elevated)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "var(--accent-dim)",
                color: "var(--accent)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Join Organization
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                Ask your organization admin to share their private invite link
                to get started as an employee or partner.
              </p>
            </div>
          </div>

       
          <div
            style={{
              padding: "32px",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius)",
              background: "var(--bg-elevated)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-tertiary)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Hash size={24} />
            </div>
            <div style={{ flex: 1, width: "100%" }}>
              <h2
                style={{
                  margin: "0 0 4px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Direct Access
              </h2>
              <p
                style={{
                  margin: "0 0 16px",
                  color: "var(--text-tertiary)",
                  fontSize: "12px",
                }}
              >
                Enter the contract address manually
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="0x..."
                  className="terminal-input"
                  style={{ height: "40px", flex: 1 }}
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  disabled={isJoining}
                />
                <button
                  className="reveal-btn"
                  style={{
                    height: "40px",
                    padding: "0 16px",
                    minWidth: "80px",
                  }}
                  onClick={() => {
                    if (isAddress(manualUrl)) {
                      setIsJoining(true);
                      navigate(`/org/${manualUrl}`);
                    }
                  }}
                  disabled={!isAddress(manualUrl) || isJoining}
                >
                  {isJoining ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      Go
                      <ArrowRight size={14} style={{ marginLeft: "8px" }} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "440px" }}>
            <h2 style={{ margin: "0 0 12px" }}>New Organization</h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              You are about to deploy a fresh Confidential Payroll instance.
              This contract will use MockUSDC for payments and enable
              FHE-powered privacy for all your employees.
            </p>

            <div
              style={{
                background: "var(--bg-root)",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
                border: "1px solid var(--border-hairline)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{ fontSize: "13px", color: "var(--text-tertiary)" }}
                >
                  Deployment Fee
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {deploymentFee
                    ? `${formatEther(deploymentFee as bigint)} ETH`
                    : "Loading..."}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-tertiary)",
                  fontStyle: "italic",
                }}
              >
                * Network gas fees will be additional.
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="fire-btn"
                style={{
                  flex: 1,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-hairline)",
                  color: "var(--text-primary)",
                }}
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="send-action-btn"
                style={{ flex: 2 }}
                onClick={handleCreateOrg}
                disabled={isConfirming || !deploymentFee}
              >
                {isConfirming ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                      style={{ marginRight: "8px" }}
                    />
                    Deploying...
                  </>
                ) : (
                  "Confirm & Deploy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
