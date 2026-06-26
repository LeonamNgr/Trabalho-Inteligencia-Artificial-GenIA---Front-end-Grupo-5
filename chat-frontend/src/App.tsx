<<<<<<< HEAD
import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { router } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ConversationProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ConversationProvider>
      </SessionProvider>
    </ErrorBoundary>
=======
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
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
  );
}
