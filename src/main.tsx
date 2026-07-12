import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@/i18n';
import { ThemeProvider } from '@/features/theme';
import { LanguageProvider } from '@/features/language';
import { AdminAuthProvider } from '@/features/admin/AdminAuthProvider';
import { EditModeProvider } from '@/features/admin/EditModeProvider';
import App from './App';
import './styles/index.css';

const rootElement = document.getElementById('root');

createRoot(rootElement!).render(
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

requestAnimationFrame(() => {
  rootElement?.classList.add('is-app-ready');
  document.getElementById('initial-loader')?.remove();
});
