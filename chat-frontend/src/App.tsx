import { SessionProvider } from './contexts/SessionContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { ChatProvider } from './contexts/ChatContext';
import { Layout } from './components/Layout/Layout';

export function App() {
  return (
    <SessionProvider>
      <ConversationProvider>
        <ChatProvider>
          <Layout />
        </ChatProvider>
      </ConversationProvider>
    </SessionProvider>
  );
}
