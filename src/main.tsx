// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { RPC_ENDPOINT, initMints } from './utils/constants';
import App from './App';
import '@solana/wallet-adapter-react-ui/styles.css';
import './styles/global.css';

initMints();

// Non-Solana wallets that register via Wallet Standard and cause
// WalletConnectionError on Solana dApps. Evict them from localStorage
// so autoConnect never tries to reconnect any user to them.
const NON_SOLANA_WALLETS = ['Pelagus', 'MetaMask', 'Coinbase Wallet'];

try {
  const stored = localStorage.getItem('walletName');
  if (stored && NON_SOLANA_WALLETS.includes(stored)) {
    localStorage.removeItem('walletName');
  }
} catch { /* ignore */ }

// Custom registry shim: override window.addEventListener to intercept
// the 'wallet-standard:register-wallet' event and block non-Solana wallets
// before they reach the wallet adapter.
const _addEventListener = window.addEventListener.bind(window);
window.addEventListener = function (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  if (type === 'wallet-standard:register-wallet') {
    const wrappedListener = (event: Event) => {
      const register = (event as CustomEvent).detail?.register;
      if (typeof register === 'function') {
        const originalRegister = register;
        (event as CustomEvent).detail.register = (wallet: { name: string; features: Record<string, unknown> }) => {
          // Block wallets that don't support Solana signing
          const isSolana =
            'solana:signTransaction' in wallet.features ||
            'solana:signAndSendTransaction' in wallet.features;
          if (!isSolana) {
            console.info(`[wallet-filter] Blocked non-Solana wallet: ${wallet.name}`);
            return;
          }
          return originalRegister(wallet);
        };
      }
      (listener as EventListener)(event);
    };
    return _addEventListener(type, wrappedListener, options);
  }
  return _addEventListener(type, listener, options);
} as typeof window.addEventListener;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);