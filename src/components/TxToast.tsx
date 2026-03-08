import { useEffect } from 'react';
import styles from './TxToast.module.css';

interface TxToastProps {
  status?: { type: 'pending' | 'success' | 'error'; msg: string } | null;
  onDismiss: () => void;
}

export default function TxToast({ status, onDismiss }: TxToastProps) {
  useEffect(() => {
    if (status?.type === 'success' || status?.type === 'error') {
      const t = setTimeout(onDismiss, 5000);
      return () => clearTimeout(t);
    }
  }, [status, onDismiss]);

  if (!status) return null;

  const icons = { pending: '⏳', success: '✅', error: '❌' };
  const labels = { pending: 'PROCESSING', success: 'SUCCESS', error: 'FAILED' };

  return (
    <div className={`${styles.toast} ${styles[status.type]} animate-slide-in`}>
      <div className={styles.icon}>{icons[status.type]}</div>
      <div className={styles.content}>
        <div className={styles.label}>{labels[status.type]}</div>
        <div className={styles.msg}>{status.msg}</div>
      </div>
      {status.type !== 'pending' && (
        <button className={styles.close} onClick={onDismiss}>×</button>
      )}
      {status.type === 'pending' && <div className={styles.spinner} />}
    </div>
  );
}