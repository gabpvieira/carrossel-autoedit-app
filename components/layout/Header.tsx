import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { IconMenu, IconUser, IconLogout, IconSettings, IconChevronDown } from '../icons';
import { ptBR } from '../../locales/pt-BR';

const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
    const { session, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex-shrink-0 bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    <button onClick={onToggleSidebar} className="text-gray-300 hover:text-white lg:hidden mr-4">
                        <IconMenu className="h-6 w-6" />
                    </button>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 text-gray-300 hover:text-white">
                        <IconUser className="h-8 w-8 rounded-full bg-purple-500/50 p-1" />
                        <span className="hidden sm:inline font-semibold">{session?.name}</span>
                        <IconChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 glassmorphism rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="p-2">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-semibold text-white">{session?.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{session?.email}</p>
                                </div>
                                <div className="h-px bg-gray-700/50 my-1"></div>
                                <a href="#settings" onClick={() => setDropdownOpen(false)} className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-md">
                                    <IconSettings className="w-5 h-5 mr-3" />
                                    {ptBR.navSettings}
                                </a>
                                <button onClick={logout} className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md">
                                    <IconLogout className="w-5 h-5 mr-3" />
                                    {ptBR.navLogout}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
