import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { ptBR } from '../../locales/pt-BR';
import {
    IconDashboard, IconPhoto, IconAnalytics, IconSettings,
    IconTemplates, IconSocial, IconHelp, IconLogout, IconX
} from '../icons';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
    { href: '#dashboard', label: ptBR.navDashboard, icon: IconDashboard },
    { href: '#editor', label: ptBR.navEditor, icon: IconPhoto },
    { href: '#analytics', label: ptBR.navAnalytics, icon: IconAnalytics, soon: true },
    { href: '#templates', label: ptBR.navTemplates, icon: IconTemplates, soon: true },
    { href: '#social', label: ptBR.navSocial, icon: IconSocial, soon: true },
    { href: '#settings', label: ptBR.navSettings, icon: IconSettings, soon: true },
    { href: '#help', label: ptBR.navHelp, icon: IconHelp, soon: true },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { logout } = useContext(AuthContext);

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <aside className={`fixed lg:relative z-40 flex flex-col h-full w-72 lg:w-80 transition-all duration-500 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                style={{
                    background: 'linear-gradient(180deg, #0f0f17 0%, #0a0a0f 100%)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)'
                }}>
                
                {/* Header */}
                <div className="flex items-center justify-between h-24 px-8 border-b border-white/5">
                    <a href="#dashboard" className="flex items-center gap-3 group">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                            <IconPhoto className="h-6 w-6 text-white"/>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white tracking-tight">{ptBR.appName}</span>
                            <span className="text-xs text-gray-400 font-medium">Editor Profissional</span>
                        </div>
                    </a>
                    {/* Botão X apenas para mobile quando sidebar estiver aberta */}
                    {isOpen && (
                        <div className="lg:hidden">
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                <IconX className="w-5 h-5"/>
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Nav Items */}
                <nav className="flex-grow px-6 py-8 space-y-1">
                    {navItems.map(item => <NavItem key={item.href} item={item} onClick={() => setIsOpen(false)} />)}
                </nav>

                {/* Footer */}
                <div className="flex-shrink-0 p-6 border-t border-white/5">
                    <button 
                        onClick={logout} 
                        className="flex items-center w-full p-4 text-gray-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                    >
                        <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-200">
                            <IconLogout className="w-4 h-4 text-red-400"/>
                        </div>
                        <span className="ml-4 font-medium">Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

const NavItem: React.FC<{item: (typeof navItems)[0], onClick: ()=>void}> = ({ item, onClick }) => {
    const isActive = window.location.hash === item.href || (window.location.hash === '' && item.href === '#dashboard');
    
    return (
        <a 
            href={item.href} 
            onClick={onClick}
            className={`flex items-center p-4 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${isActive 
                    ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-white border border-purple-500/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
        >
            {/* Active indicator */}
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600 rounded-r-full"></div>
            )}
            
            <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActive 
                    ? 'bg-purple-500/20 text-purple-300' 
                    : 'bg-white/5 group-hover:bg-white/10'
            }`}>
                <item.icon className="w-4 h-4"/>
            </div>
            
            <div className="flex-1 ml-4">
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </div>
            
            {item.soon && (
                <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                    {ptBR.comingSoon}
                </span>
            )}
        </a>
    )
}

export default Sidebar;
