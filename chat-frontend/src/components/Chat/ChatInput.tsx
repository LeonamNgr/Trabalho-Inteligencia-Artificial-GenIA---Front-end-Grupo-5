import { useState, useRef, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string, attachmentId?: number | null) => void;
  onSendFile?: (content: string, file: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onSendFile, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (disabled) return;

    if (selectedFile && onSendFile) {
      onSendFile(message.trim(), selectedFile);
      setMessage('');
      setSelectedFile(null);
    } else if (message.trim()) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSend = (message.trim() || selectedFile) && !disabled;

  return (
    <div className="border-t border-[#ED1D24]/20 bg-[#0a0a0a]/95 backdrop-blur-lg px-4 py-3">
      <div className="max-w-4xl mx-auto">
        {selectedFile && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <span className="text-xs text-gray-400 bg-[#1a1a1a] px-2 py-1 rounded flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              {selectedFile.name}
            </span>
            <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-[#ED1D24] cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-[#ED1D24] hover:bg-[#ED1D24]/10 p-2 rounded-lg transition-all cursor-pointer"
              type="button"
              disabled={disabled}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.md,.html,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif"
            onChange={handleFileSelect}
            hidden
          />

          <div className="flex-1 relative flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre o universo Marvel..."
              disabled={disabled}
              rows={1}
              className="w-full bg-[#1a1a1a] border border-[#ED1D24]/30 text-white placeholder:text-gray-500 focus:border-[#ED1D24] focus:outline-none resize-none rounded-xl px-4 py-3 text-sm leading-5"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 160) + 'px';
              }}
            />

          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleSend}
              disabled={!canSend}
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
