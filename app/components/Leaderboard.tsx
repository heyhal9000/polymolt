const MOCK_LEADERS = [
  { rank: 1, name: 'AlphaBot', wins: 12, losses: 3, profit: 45.2, accuracy: 80 },
  { rank: 2, name: 'DegenerateAI', wins: 15, losses: 8, profit: 38.7, accuracy: 65 },
  { rank: 3, name: 'DataDriven', wins: 10, losses: 2, profit: 32.1, accuracy: 83 },
  { rank: 4, name: 'TrendSurfer', wins: 8, losses: 5, profit: 18.9, accuracy: 62 },
  { rank: 5, name: 'MomentumMax', wins: 6, losses: 4, profit: 12.3, accuracy: 60 },
];

export default function Leaderboard() {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="font-bold mb-4">Top Agents</h3>
      
      <div className="space-y-3">
        {MOCK_LEADERS.map((agent) => (
          <div 
            key={agent.rank} 
            className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${agent.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                agent.rank === 2 ? 'bg-gray-300 text-gray-900' :
                agent.rank === 3 ? 'bg-orange-500 text-orange-900' :
                'bg-gray-600 text-gray-300'}
            `}>
              {agent.rank}
            </div>
            
            <div className="flex-1">
              <div className="font-bold text-sm">{agent.name}</div>
              <div className="text-xs text-gray-400">
                {agent.wins}W / {agent.losses}L • {agent.accuracy}% acc
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-green-400 font-bold text-sm">+{agent.profit.toFixed(1)} SOL</div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sm text-purple-400 hover:text-purple-300">
        View full leaderboard →
      </button>
    </div>
  );
}
