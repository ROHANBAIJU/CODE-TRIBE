import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Sparkles,
  Shield,
  Camera,
  Zap,
  Eye,
  FileWarning,
  HelpCircle
} from 'lucide-react';
import { chatSafetyQuery, chatQuickQuery, type ChatResponse } from '../services/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    is_safe?: boolean;
    confidence?: number;
    alerts?: string[];
    recommendations?: string[];
    equipment_count?: number;
    processing_time?: number;
  };
}

interface SafetyChatProps {
  currentImage?: File | null;
  onImageRequest?: () => void;
}

const SafetyChat = ({ currentImage, onImageRequest }: SafetyChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'ai',
        content: "👋 Hello! I'm your AI Safety Assistant.\n\nI can analyze images for safety equipment and hazards. Try asking:\n\n• \"Is this area safe?\"\n• \"What safety equipment do you see?\"\n• \"Generate a safety report\"\n• \"Any fire hazards?\"",
        timestamp: new Date(),
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let response: ChatResponse | { query: string; response: string; detections_used?: number };
      
      if (currentImage) {
        response = await chatSafetyQuery(currentImage, query);
      } else {
        response = await chatQuickQuery(query);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        metadata: 'is_safe' in response ? {
          is_safe: response.is_safe,
          confidence: response.confidence,
          alerts: response.alerts,
          recommendations: response.recommendations,
          equipment_count: response.equipment_detected,
          processing_time: response.processing_time_ms,
        } : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '❌ Connection error. Please ensure the backend server is running on port 8000.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { label: "Is this area safe?", icon: Shield },
    { label: "Check fire equipment", icon: FileWarning },
    { label: "Status report", icon: Eye },
    { label: "Any hazards?", icon: AlertTriangle },
  ];

  return (
    <div 
      className="glass-panel"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '600px',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(13, 17, 28, 0.95) 0%, rgba(10, 14, 23, 0.98) 100%)',
        border: '1px solid rgba(0, 255, 65, 0.2)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0, 255, 65, 0.15)',
        background: 'linear-gradient(90deg, rgba(0, 255, 65, 0.08) 0%, rgba(33, 150, 243, 0.08) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00FF41 0%, #2196F3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0, 255, 65, 0.3)',
            }}>
              <Bot style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: '#00FF41',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}>
                SafetyGuard AI
                <Sparkles style={{ width: '14px', height: '14px', color: '#FFD700' }} />
              </h3>
              <p style={{ 
                fontSize: '11px', 
                color: '#6B7280', 
                fontFamily: 'monospace',
                margin: '2px 0 0 0',
              }}>
                Vision-Language Model • Online
              </p>
            </div>
          </div>
          
          {/* Image Status Badge */}
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: currentImage ? 'rgba(0, 255, 65, 0.15)' : 'rgba(251, 191, 36, 0.15)',
            border: `1px solid ${currentImage ? 'rgba(0, 255, 65, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
            color: currentImage ? '#00FF41' : '#FBBF24',
          }}>
            {currentImage ? (
              <>
                <CheckCircle style={{ width: '12px', height: '12px' }} />
                Image Ready
              </>
            ) : (
              <>
                <Camera style={{ width: '12px', height: '12px' }} />
                No Image
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                gap: '10px',
                flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: message.type === 'user' 
                  ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
                  : 'linear-gradient(135deg, #00FF41 0%, #00CC33 100%)',
                boxShadow: message.type === 'user'
                  ? '0 2px 8px rgba(33, 150, 243, 0.3)'
                  : '0 2px 8px rgba(0, 255, 65, 0.3)',
              }}>
                {message.type === 'user' ? (
                  <User style={{ width: '16px', height: '16px', color: '#fff' }} />
                ) : (
                  <Bot style={{ width: '16px', height: '16px', color: '#fff' }} />
                )}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: message.type === 'user'
                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.25) 0%, rgba(33, 150, 243, 0.15) 100%)'
                    : 'rgba(30, 41, 59, 0.8)',
                  border: `1px solid ${message.type === 'user' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`,
                  backdropFilter: 'blur(10px)',
                }}>
                  <p style={{ 
                    fontSize: '13px', 
                    lineHeight: '1.5',
                    color: '#E2E8F0',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {message.content}
                  </p>
                  
                  {/* Metadata for AI responses */}
                  {message.metadata && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(100, 116, 139, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {/* Safety Status */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: message.metadata.is_safe ? 'rgba(0, 255, 65, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                          color: message.metadata.is_safe ? '#00FF41' : '#FBBF24',
                        }}>
                          {message.metadata.is_safe ? (
                            <Shield style={{ width: '12px', height: '12px' }} />
                          ) : (
                            <AlertTriangle style={{ width: '12px', height: '12px' }} />
                          )}
                          {message.metadata.is_safe ? 'SAFE' : 'CAUTION'}
                        </div>
                        <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>
                          {((message.metadata.confidence ?? 0) * 100).toFixed(0)}% conf.
                        </span>
                      </div>
                      
                      {/* Equipment Count */}
                      {message.metadata.equipment_count !== undefined && message.metadata.equipment_count > 0 && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#9CA3AF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Eye style={{ width: '12px', height: '12px' }} />
                          {message.metadata.equipment_count} equipment detected
                        </div>
                      )}
                      
                      {/* Processing Time */}
                      {message.metadata.processing_time && (
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#6B7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Zap style={{ width: '10px', height: '10px' }} />
                          {message.metadata.processing_time.toFixed(0)}ms
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Timestamp */}
                <span style={{ 
                  fontSize: '10px', 
                  color: '#4B5563',
                  fontFamily: 'monospace',
                  textAlign: message.type === 'user' ? 'right' : 'left',
                  paddingLeft: message.type === 'user' ? 0 : '8px',
                  paddingRight: message.type === 'user' ? '8px' : 0,
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00FF41 0%, #00CC33 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Loader2 style={{ width: '16px', height: '16px', color: '#fff', animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#00FF41',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Analyzing...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(100, 116, 139, 0.15)',
        background: 'rgba(15, 23, 42, 0.5)',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}>
          {quickPrompts.map((prompt) => (
            <motion.button
              key={prompt.label}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setInputValue(prompt.label);
                inputRef.current?.focus();
              }}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                fontSize: '11px',
                fontFamily: 'monospace',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.25)',
                borderRadius: '20px',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.5)';
                e.currentTarget.style.color = '#00FF41';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.25)';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <prompt.icon style={{ width: '12px', height: '12px' }} />
              {prompt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(100, 116, 139, 0.15)',
        background: 'rgba(15, 23, 42, 0.8)',
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about safety..."
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 18px',
                paddingRight: '45px',
                fontSize: '13px',
                fontFamily: 'monospace',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.25)',
                borderRadius: '14px',
                color: '#E2E8F0',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 255, 65, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 65, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(100, 116, 139, 0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <HelpCircle 
              style={{ 
                position: 'absolute', 
                right: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '16px', 
                height: '16px', 
                color: '#4B5563',
                cursor: 'help',
              }} 
              title="Ask questions about safety equipment, hazards, or request a status report"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: inputValue.trim() 
                ? 'linear-gradient(135deg, #00FF41 0%, #00CC33 100%)'
                : 'rgba(30, 41, 59, 0.6)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: inputValue.trim() ? '0 4px 15px rgba(0, 255, 65, 0.3)' : 'none',
            }}
          >
            <Send style={{ 
              width: '20px', 
              height: '20px', 
              color: inputValue.trim() ? '#0D1117' : '#4B5563',
            }} />
          </motion.button>
        </div>
        
        {/* Tip */}
        {!currentImage && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              fontSize: '10px', 
              color: '#6B7280', 
              textAlign: 'center',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Camera style={{ width: '10px', height: '10px' }} />
            Upload an image for detailed safety analysis
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default SafetyChat;
