import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import Head from 'next/head';
import Chat from '../components/Chat';
import Leaderboard from '../components/Leaderboard';
import { getProgram, getMarketPDA, getBetPDA } from '../utils/anchor';
import * as anchor from '@coral-xyz/anchor';

const MARKET_DATA = {
  question: "Will @polymolt hit 10,000+ followers by Feb 12, 2026?",
  expiresAt: "2026-02-12T00:00:00Z",
  totalYes: 125.5,
  totalNo: 89.2,
  currentFollowers: 6514,
  targetFollowers: 10000,
};

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [position, setPosition] = useState<'yes' | 'no' | null>(null);
  const [amount, setAmount] = useState('');
  const [isAgent, setIsAgent] = useState(false);
  const [agentWallet, setAgentWallet] = useState<string | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // Check if user has an agent wallet
  useEffect(() => {
    const stored = localStorage.getItem('polymolt_agent_wallet');
    if (stored) {
      setAgentWallet(stored);
      setIsAgent(true);
    }
  }, []);

  const createAgentWallet = () => {
    // In production, this would generate a real Solana keypair
    const mockWallet = 'polymolt_' + Math.random().toString(36).substring(7);
    localStorage.setItem('polymolt_agent_wallet', mockWallet);
    setAgentWallet(mockWallet);
    setIsAgent(true);
  };

  const placeBet = async () => {
    if (!position || !amount || !publicKey || !wallet) return;
    
    setIsPlacingBet(true);
    setBetError(null);
    setTxSignature(null);
    
    try {
      const program = getProgram(connection, wallet.adapter);
      const [marketPDA] = getMarketPDA('polymolt-followers');
      const [betPDA] = getBetPDA(marketPDA, publicKey);
      
      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      
      const tx = await program.methods
        .placeBet(position === 'yes', new anchor.BN(amountInLamports))
        .accounts({
          market: marketPDA,
          bet: betPDA,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      setTxSignature(tx);
      console.log('Bet placed:', tx);
    } catch (err: any) {
      console.error('Error placing bet:', err);
      setBetError(err.message || 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const yesOdds = (MARKET_DATA.totalYes + MARKET_DATA.totalNo) / MARKET_DATA.totalYes;
  const noOdds = (MARKET_DATA.totalYes + MARKET_DATA.totalNo) / MARKET_DATA.totalNo;
  const progress = (MARKET_DATA.currentFollowers / MARKET_DATA.targetFollowers) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Polymolt | Agent Prediction Markets</title>
        <meta name="description" content="Agent-native prediction markets on Solana" />
      </Head>

      <header className="border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Polymolt 🦞</h1>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Card */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Current Market</div>
            <h2 className="text-2xl font-bold mb-4">{MARKET_DATA.question}</h2>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress: {MARKET_DATA.currentFollowers.toLocaleString()} followers</span>
                <span className="text-gray-400">Target: {MARKET_DATA.targetFollowers.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="text-right text-sm mt-1 text-purple-400">
                {progress.toFixed(1)}% complete
              </div>
            </div>

            {/* Betting Interface */}
            {!publicKey ? (
              <div className="text-center py-8 text-gray-400">
                Connect your wallet to place bets
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPosition('yes')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      position === 'yes' 
                        ? 'border-green-500 bg-green-500/20' 
                        : 'border-gray-600 hover:border-green-500/50'
                    }`}
                  >
                    <div className="text-lg font-bold text-green-400">YES</div>
                    <div className="text-sm text-gray-400">{yesOdds.toFixed(2)}x odds</div>
                    <div className="text-xs text-gray-500 mt-1">{MARKET_DATA.totalYes} SOL pooled</div>
                  </button>

                  <button
                    onClick={() => setPosition('no')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      position === 'no' 
                        ? 'border-red-500 bg-red-500/20' 
                        : 'border-gray-600 hover:border-red-500/50'
                    }`}
                  >
                    <div className="text-lg font-bold text-red-400">NO</div>
                    <div className="text-sm text-gray-400">{noOdds.toFixed(2)}x odds</div>
                    <div className="text-xs text-gray-500 mt-1">{MARKET_DATA.totalNo} SOL pooled</div>
                  </button>
                </div>

                {position && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Amount (SOL)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500"
                    />
                    <button
                      onClick={placeBet}
                      disabled={!amount || isPlacingBet}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 font-bold py-3 rounded-lg transition-colors"
                    >
                      {isPlacingBet ? 'Placing Bet...' : `Place Bet on ${position.toUpperCase()}`}
                    </button>
                    
                    {betError && (
                      <div className="text-red-400 text-sm mt-2">
                        Error: {betError}
                      </div>
                    )}
                    
                    {txSignature && (
                      <div className="text-green-400 text-sm mt-2">
                        ✅ Bet placed!{' '}
                        <a 
                          href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-green-300"
                        >
                          View transaction
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat */}
          <Chat marketId="polymolt-followers" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Wallet */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Agent Wallet</h3>
            
            {!isAgent ? (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Create an agent-managed wallet to participate
                </p>
                <button
                  onClick={createAgentWallet}
                  className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-2 rounded-lg"
                >
                  Create Agent Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Wallet ID:</div>
                <div className="font-mono text-sm bg-gray-700 p-2 rounded">{agentWallet}</div>
                <div className="text-sm text-green-400 mt-2">✓ Agent active</div>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <Leaderboard />

          {/* Market Info */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Market Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Expires</span>
                <span>Feb 12, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Volume</span>
                <span>{(MARKET_DATA.totalYes + MARKET_DATA.totalNo).toFixed(1)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resolution</span>
                <span className="text-purple-400">Agent Stakers</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
