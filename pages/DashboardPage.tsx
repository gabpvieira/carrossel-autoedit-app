import React, { useContext } from 'react';
import { ptBR } from '../locales/pt-BR';
import { AuthContext } from '../components/auth/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/Button';
import { IconPhoto, IconAnalytics, IconTemplates, IconSettings, IconChevronRight } from '../components/icons';

const DashboardPage: React.FC = () => {
    const { session } = useContext(AuthContext);

    const featureCards = [
        { 
            icon: IconPhoto, 
            title: ptBR.editPhotosCardTitle, 
            subtitle: ptBR.editPhotosCardSubtitle, 
            buttonText: ptBR.editPhotosCardButton,
            href: '#editor',
            comingSoon: false,
        },
        { 
            icon: IconAnalytics, 
            title: ptBR.navAnalytics, 
            subtitle: "Visualize métricas de performance.", 
            buttonText: "Ver Analytics",
            href: '#analytics',
            comingSoon: false,
        },
        { 
            icon: IconTemplates, 
            title: ptBR.navTemplates, 
            subtitle: "Use templates prontos para acelerar.", 
            buttonText: "Explorar Templates",
            href: '#templates',
            comingSoon: true,
        },
        { 
            icon: IconSettings, 
            title: "Automação", 
            subtitle: "Configure automações de posts.", 
            buttonText: "Configurar",
            href: '#social',
            comingSoon: true,
        },
    ]

    return (
        <div className="text-white">
            <header className="mb-12">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Bem-vindo(a), {session?.name.split(' ')[0]}!</h1>
                <p className="text-gray-300 mt-3 text-lg">{ptBR.dashboardSubtitle}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featureCards.map((card, index) => (
                    <Card key={index} className={`flex flex-col ${card.comingSoon ? 'opacity-60' : ''}`}>
                       <div className="flex-grow">
                            <card.icon className="w-10 h-10 mb-4 text-purple-300"/>
                            <h3 className="text-xl font-bold text-white">{card.title}</h3>
                            <p className="text-gray-300 mt-2 text-sm">{card.subtitle}</p>
                            {card.comingSoon && (
                                <span className="absolute top-4 right-4 text-xs font-bold bg-yellow-500 text-gray-900 px-2 py-1 rounded-full">
                                    {ptBR.comingSoon}
                                </span>
                            )}
                       </div>
                       <div className="mt-6">
                            <Button 
                                onClick={() => !card.comingSoon && (window.location.hash = card.href)}
                                disabled={card.comingSoon} 
                                variant={index === 0 ? 'primary' : 'secondary'} 
                                className="w-full flex justify-center items-center gap-2"
                            >
                                {card.buttonText}
                                {!card.comingSoon && <IconChevronRight className="w-4 h-4"/>}
                            </Button>
                       </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;
