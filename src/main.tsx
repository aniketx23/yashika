import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App';
import { INVITE } from './config';
import { SmoothScroll } from './lib/smoothScroll';
import { SkyProvider } from './sky/SkyProvider';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

/* A reload must land on the gate, not wherever the guest left off. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(root).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <SkyProvider meteorRate={INVITE.meteorRate}>
          <App />
        </SkyProvider>
      </SmoothScroll>
    </MotionConfig>
  </StrictMode>,
);
