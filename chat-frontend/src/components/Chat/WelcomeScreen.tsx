import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Shield, Sparkles, Rocket } from 'lucide-react';

interface WelcomeScreenProps {
  onSendSuggestion: (text: string) => void;
}

const suggestions = [
  { icon: Shield, text: 'Quem é o herói mais forte?' },
  { icon: Zap, text: 'Conte sobre o Universo Marvel' },
  { icon: Sparkles, text: 'História dos Vingadores' },
  { icon: Rocket, text: 'Linha do tempo do MCU' },
];

export function WelcomeScreen({ onSendSuggestion }: WelcomeScreenProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-8"
      >
        {imgError ? (
          <h1 className="text-[#ED1D24] text-4xl font-bold tracking-[0.15em] uppercase select-none">
            MARVEL
          </h1>
        ) : (
          <img
            src="/Marvel_Logo.jpg"
            alt="Marvel logo"
            className="w-48 h-auto object-contain drop-shadow-2xl"
            onError={() => setImgError(true)}
          />
        )}
      </motion.div>

      <h1 className="text-2xl md:text-3xl mb-3 bg-gradient-to-r from-[#ED1D24] to-[#F0141E] bg-clip-text text-transparent font-bold">
        Marvel AI Chat
      </h1>

      <p className="text-gray-400 text-sm mb-6 max-w-xl">
        Seu assistente especializado no Universo Marvel. Pergunte sobre heróis, vilões, histórias e todo o MCU!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSendSuggestion(suggestion.text)}
              className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#ED1D24]/30 rounded-xl hover:border-[#ED1D24] hover:bg-[#1a1a1a]/80 transition-all cursor-pointer text-left"
            >
              <div className="p-2 bg-gradient-to-br from-[#ED1D24] to-[#F0141E] rounded-lg">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-300">
                {suggestion.text}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
