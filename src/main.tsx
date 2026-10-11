import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StorageService } from './services/storage.ts';

// Initialize unified seed database
StorageService.init();

createRoot(document.getElementById('root')!).render(<App />);
