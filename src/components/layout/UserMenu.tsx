import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../lib/firebase-auth-context';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, sign_out } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handle_sign_out = async () => {
    await sign_out();
    navigate('/login');
  };

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Abrir menu do usuário</span>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          {user?.displayName?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || <User className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50"
          style={{
            animation: 'fadeIn 0.1s ease-out forwards'
          }}
        >
          <div className="px-4 py-3">
            <p className="text-sm">Logado como</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || 'Usuário'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={handle_sign_out}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
