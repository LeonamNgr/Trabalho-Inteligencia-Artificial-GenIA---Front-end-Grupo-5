import { motion } from 'motion/react';
import { Plus, MessageSquare, Settings, Menu, X } from 'lucide-react';
import { useConversation } from '../../hooks/useConversation';
import { useConversationContext } from '../../contexts/ConversationContext';
import { HealthStatus } from '../Common/HealthStatus';
import { DocumentPanel } from '../Documents/DocumentPanel';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { conversations, selectConversation, createNewConversation } = useConversation();
  const { activeConversation } = useConversationContext();

  return (
    <div className="flex flex-col h-full bg-[#071428] border-r border-[#1a3d6b]/40">
      <div className="p-4 border-b border-[#1a3d6b]/40">
        <button
          onClick={createNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ED1D24] to-[#F0141E] hover:from-[#F0141E] hover:to-[#ED1D24] text-white font-medium py-2.5 px-4 rounded-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Conversa
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {conversations.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative"
          >
            <button
              onClick={() => {
                selectConversation(chat.id);
                onClose();
              }}
              className={[
                'w-full text-left px-3 py-3 rounded-lg transition-all',
                chat.id === activeConversation?.id
                  ? 'bg-gradient-to-r from-[#ED1D24]/20 to-[#F0141E]/20 border border-[#ED1D24]/50'
                  : 'hover:bg-[#0d2040] border border-transparent',
              ].join(' ')}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-1 text-[#ED1D24] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{chat.title || 'Nova Conversa'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{chat.lastActivity ? new Date(chat.lastActivity).toLocaleDateString('pt-BR') : ''}</p>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <div className="px-2">
        <DocumentPanel />
      </div>

      <div className="p-4 border-t border-[#1a3d6b]/40 space-y-2">
        <HealthStatus />
        <button className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-[#0d2040] py-2 px-3 rounded-lg transition-all cursor-pointer text-left">
          <Settings className="w-4 h-4" />
          Configurações
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <button
        onClick={() => onClose()}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#071428] border border-[#1a3d6b]/50 text-white hover:bg-[#0d2040] p-2 rounded-lg cursor-pointer"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-80 z-50 md:hidden"
      >
        <SidebarContent onClose={onClose} />
      </motion.div>

      <div className="hidden md:block w-80 h-full">
        <SidebarContent onClose={onClose} />
      </div>
    </>
  );
}
