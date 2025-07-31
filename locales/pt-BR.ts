export const ptBR = {
    // App Info
    appName: 'Carrossel AutoEdit',

    // Login Page
    loginTitle: 'Bem-vindo(a) de volta!',
    loginSubtitle: 'Faça login para continuar editando suas imagens.',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    loginButton: 'Entrar',
    loginLoading: 'Entrando...',
    forgotPassword: 'Esqueci minha senha',
    errorInvalidCredentials: 'E-mail ou senha inválidos. Tente novamente.',
    
    // Dashboard & Layout
    dashboardTitle: 'Dashboard',
    dashboardWelcome: 'Olá, Gabriel Vieira!',
    dashboardSubtitle: 'O que você gostaria de fazer hoje?',
    editPhotosCardTitle: 'Editar Fotos ADS',
    editPhotosCardSubtitle: 'Converta e edite imagens para o formato de anúncio.',
    editPhotosCardButton: 'Começar a Editar',
    editInstagramCardTitle: 'Editar Fotos Instagram',
    editInstagramCardSubtitle: 'Crie layouts para posts do Instagram (1350x1080).',
    editInstagramCardButton: 'Editar Instagram',
    comingSoon: 'Em Breve',
    
    // Sidebar
    navDashboard: 'Dashboard',
    navEditor: 'Editar Fotos ADS',
    navAnalytics: 'Analytics',
    navSettings: 'Configurações',
    navTemplates: 'Templates',
    navSocial: 'Redes Sociais',
    navHelp: 'Ajuda',
    navLogout: 'Sair',

    // Editor Page (previously App.tsx content)
    startTitle: 'Comece enviando suas imagens',
    startSubtitle: (max: number) => `Envie até ${max} imagens. Crie uma capa especial e edite o restante como recortes quadrados padrão.`,
    
    // Upload Area
    clickToUpload: 'Clique para enviar',
    orDragAndDrop: 'ou arraste e solte',
    uploadHint: (max: number) => `JPG, PNG ou WebP (máx. ${max} arquivos)`,
    processingImages: 'Processando imagens...',
    errorMaxFiles: (max: number) => `Você só pode enviar no máximo ${max} imagens.`,
    errorFileType: (fileName: string) => `Formato de arquivo não suportado: ${fileName}. Use JPG, PNG ou WebP.`,
    
    // Header & Global Actions
    resetAll: 'Recomeçar',
    confirmResetApp: 'Tem certeza que deseja apagar todas as imagens e edições nesta sessão?',
    imageCounter: (count: number, max: number) => `${count} / ${max} Imagens`,
    
    // Editor View
    editorTitle: 'Editor de Imagens para Anúncios',
    editorSubtitle: 'Ajuste a capa e as imagens padrão abaixo.',
    coverTab: 'Capa',
    standardImagesTab: 'Imagens Padrão',
    
    // Cover Editor
    coverEditorTitle: 'Layout de Capa (Carrossel)',
    finalPreviewTitle: 'Prévia Final da Capa',
    addTopImage: 'Adicionar imagem principal',
    addBottomLeftImage: 'Adicionar imagem inferior esquerda',
    addBottomRightImage: 'Adicionar imagem inferior direita',
    topSection: 'Seção Principal',
    bottomLeftSection: 'Seção Inferior Esquerda',
    bottomRightSection: 'Seção Inferior Direita',
    clearSlot: 'Limpar Slot',

    // Instagram Editor
    instagramEditorTitle: 'Layout Instagram (1350x1080)',
    instagramFinalPreviewTitle: 'Prévia Final do Instagram',
    addMainImage: 'Adicionar imagem principal',
    addTopRightImage: 'Adicionar imagem superior direita',
    addBottomRightImage: 'Adicionar imagem inferior direita',
    mainSection: 'Seção Principal',
    topRightSection: 'Seção Superior Direita',
    bottomRightSection: 'Seção Inferior Direita',
    
    // Image Card & Controls
    swapImage: 'Trocar Imagem',
    removeImage: 'Remover Imagem',
    removeImageTooltip: 'Remover esta imagem',
    resetPosition: 'Resetar Posição',
    loading: 'Carregando...',
    zoom: 'Zoom',
    brightness: 'Brilho',
    contrast: 'Contraste',
    saturation: 'Vibração',
    highlights: 'Realce',
    sharpness: 'Nitidez',
    positionX: 'Posição X',
    positionY: 'Posição Y',
    previousImage: 'Imagem Anterior',
    nextImage: 'Próxima Imagem',
    imageNavigation: 'Navegação de Imagens',
    timelineEditor: 'Editor em Linha do Tempo',
    noStandardImagesTitle: 'Nenhuma Imagem Padrão',
    noStandardImagesSubtitle: 'Adicione imagens padrão para começar a editar',
    
    // Buttons
    downloadThisImage: 'Baixar Imagem',
    downloadAll: (count: number) => `Baixar ${count} Imagens (.zip)`,
    downloadAllNoImages: 'Baixar Tudo (.zip)',
    downloading: 'Baixando...',
    processing: 'Processando...',
    confirmButton: 'Confirmar Exclusão',
    cancelButton: 'Cancelar',

    // Modal
    imageSelectionModalTitle: 'Selecione uma Imagem',
    imageSelectionModalSubtitle: 'Escolha uma imagem da sua lista ou envie uma nova.',
    modalUseThisImage: 'Usar Esta Imagem',
    modalUploadNew: 'Carregar Nova Imagem',
    modalNoImages: 'Nenhuma imagem disponível.',
    modalNoImagesSub: 'Todas as suas imagens já estão em uso. Envie novas imagens para selecionar.',

    // Confirmation Modal
    confirmDeleteTitle: 'Confirmar Exclusão',
    confirmDeleteMessage: 'Tem certeza que deseja remover esta imagem? Esta ação não pode ser desfeita.',
    errorLastImage: 'Não é possível remover a última imagem. Carregue novas imagens para poder remover esta.',

    // Empty states
    noStandardImagesTitle: 'Nenhuma Imagem Padrão',
    noStandardImagesSubtitle: 'Adicione imagens padrão para começar a editar',

    // Resolution
    resolution: 'Resolução de Download',
    resolutionStandard: 'Padrão (1080px)',
    resolutionStandardSub: 'Rápido, para testes e prévias.',
    resolutionHigh: 'Alta Qualidade (3000px)',
    resolutionHighSub: 'Ideal para publicação final.',
    processingHighRes: 'Processando em alta resolução...',

    // Coming Soon Page
    comingSoonTitle: 'Funcionalidade em Construção!',
    comingSoonSubtitle: 'Estamos trabalhando duro para trazer esta novidade para você. Volte em breve!',
    backToDashboard: 'Voltar para o Dashboard',
};