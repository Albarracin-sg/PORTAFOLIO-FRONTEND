import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@/i18n';
import { ThemeProvider } from '@/features/theme';
import { LanguageProvider } from '@/features/language';
import { AdminAuthProvider } from '@/features/admin/AdminAuthProvider';
import { EditModeProvider } from '@/features/admin/EditModeProvider';
import App from './App';
import './styles/index.css';

document.getElementById('initial-loader')?.remove();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <AdminAuthProvider>
          <EditModeProvider>
            <App />
          </EditModeProvider>
        </AdminAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);
