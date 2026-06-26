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
  );
}
