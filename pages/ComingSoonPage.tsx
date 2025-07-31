import React from 'react';
import { ptBR } from '../locales/pt-BR';
import { Button } from '../components/Button';
import { IconAnalytics } from '../components/icons';

const ComingSoonPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-white p-8">
            <IconAnalytics className="w-24 h-24 text-purple-400 mb-6" />
            <h1 className="text-4xl font-bold mb-3">{ptBR.comingSoonTitle}</h1>
            <p className="text-lg text-gray-300 max-w-md mb-8">{ptBR.comingSoonSubtitle}</p>
            <Button onClick={() => window.location.hash = '#dashboard'}>
                {ptBR.backToDashboard}
            </Button>
        </div>
    );
};

export default ComingSoonPage;
