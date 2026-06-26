import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { ChatPage } from './pages/ChatPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ChatPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
