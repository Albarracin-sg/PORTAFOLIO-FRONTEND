import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/features/theme';
import { LanguageProvider } from '@/features/language';
import { AdminAuthProvider } from '@/features/admin/AdminAuthProvider';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);
