import { useState, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { isUploading } = useUpload();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[#ED1D24]/20 bg-[#0a0a0a]/95 backdrop-blur-lg px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="text-gray-400 hover:text-[#ED1D24] hover:bg-[#ED1D24]/10 p-2 rounded-lg transition-all cursor-pointer" type="button">
              <Paperclip className="w-5 h-5" />
            </button>
          </motion.div>

          <div className="flex-1 relative flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre o universo Marvel..."
              disabled={disabled || isUploading}
              rows={1}
              className="w-full bg-[#1a1a1a] border border-[#ED1D24]/30 text-white placeholder:text-gray-500 focus:border-[#ED1D24] focus:outline-none resize-none rounded-xl px-4 py-3 text-sm leading-5"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 160) + 'px';
              }}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2"
            >
              <button className="text-gray-400 hover:text-[#ED1D24] hover:bg-[#ED1D24]/10 p-1.5 rounded-lg transition-all cursor-pointer" type="button">
                <Mic className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled || isUploading}
              className="bg-gradient-to-r from-[#ED1D24] to-[#F0141E] hover:from-[#F0141E] hover:to-[#ED1D24] text-white rounded-xl shadow-lg shadow-[#ED1D24]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer p-3"
            >
              <Send className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
