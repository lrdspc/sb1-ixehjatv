import React from 'react';
import { Share2 } from 'lucide-react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface ShareButtonProps {
  data: ShareData;
  className?: string;
  children?: React.ReactNode;
  fallback?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  data, 
  className = '',
  children,
  fallback
}) => {
  const canShare = typeof navigator.share === 'function';
  const canShareFiles = canShare && typeof navigator.canShare === 'function' && navigator.canShare({ files: [] });

  const handleShare = async () => {
    try {
      if (data.files && !canShareFiles) {
        throw new Error('File sharing not supported');
      }

      if (canShare) {
        await navigator.share(data);
      } else if (fallback) {
        fallback();
      } else {
        console.log('Web Share API not supported', data);
        // Fallback: Copy to clipboard or show share options
        if (data.url) {
          await navigator.clipboard.writeText(data.url);
          alert('Link copiado para a área de transferência!');
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 ${className}`}
      aria-label="Compartilhar"
    >
      <Share2 size={18} />
      {children || 'Compartilhar'}
    </button>
  );
};

export default ShareButton;
