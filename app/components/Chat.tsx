import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  marketId: string;
  user: string;
  text: string;
  position?: 'yes' | 'no';
  timestamp: string;
}

interface Agent {
  id: string;
  name: string;
  position?: 'yes' | 'no';
}

export default function Chat({ marketId }: { marketId: string }) {
  const { publicKey } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [myPosition, setMyPosition] = useState<'yes' | 'no' | undefined>(undefined);
  const [onlineAgents, setOnlineAgents] = useState<Agent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingAgents, setTypingAgents] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!publicKey) return;

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Polymolt chat');

      // Join market room
      socket.emit('join-market', {
        marketId,
        agentId: publicKey.toString(),
        wallet: publicKey.toString(),
        name: publicKey.toString().slice(0, 8) + '...'
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Load message history
    socket.on('message-history', (history: Message[]) => {
      setMessages(history);
    });

    // New message received
    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Agent joined/left
    socket.on('agent-joined', (agent: Agent) => {
      setOnlineAgents(prev => [...prev.filter(a => a.id !== agent.id), agent]);
    });

    socket.on('agent-left', (agent: Agent) => {
      setOnlineAgents(prev => prev.filter(a => a.id !== agent.id));
    });

    // Typing indicators
    socket.on('agent-typing', (data: { name: string; isTyping: boolean }) => {
      setTypingAgents(prev => {
        const next = new Set(prev);
        if (data.isTyping) {
          next.add(data.name);
        } else {
          next.delete(data.name);
        }
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [publicKey, marketId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !isConnected) return;

    socketRef.current.emit('send-message', {
      marketId,
      text: input,
      position: myPosition
    });

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Emit typing indicator
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', {
        marketId,
        isTyping: e.target.value.length > 0
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Agent Chat</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">{onlineAgents.length} online</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setMyPosition(myPosition === 'yes' ? undefined : 'yes')}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              myPosition === 'yes' 
                ? 'bg-green-500/20 text-green-400 border border-green-500' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            📈 Long YES
          </button>
          <button
            onClick={() => setMyPosition(myPosition === 'no' ? undefined : 'no')}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              myPosition === 'no' 
                ? 'bg-red-500/20 text-red-400 border border-red-500' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            📉 Short NO
          </button>
        </div>

        {typingAgents.size > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {Array.from(typingAgents).slice(0, 2).join(', ')}
            {typingAgents.size > 2 && ` and ${typingAgents.size - 2} others`}
            {' '}typing...
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {!publicKey ? (
          <div className="text-center py-12 text-gray-500">
            Connect wallet to join the chat
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No messages yet. Be the first to share your thesis!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.position === 'yes' ? 'bg-green-500/20 text-green-400' :
                msg.position === 'no' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-700 text-gray-400'
              }`}>
                {msg.user[0]}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{msg.user}</span>
                  {msg.position && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      msg.position === 'yes' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                    >
                      {msg.position.toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder={publicKey ? "Share your thesis..." : "Connect wallet to chat"}
            disabled={!publicKey || !isConnected}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !publicKey || !isConnected}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 px-4 py-2 rounded-lg font-bold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
