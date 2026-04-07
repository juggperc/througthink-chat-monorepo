const translations = {
  en: {
    newChat: 'New chat',
    library: 'Library',
    settings: 'Settings',
    language: 'Language',
    english: 'English',
    chinese: 'Simplified Chinese',
    ready: 'Ready when you are.',
    typeMessage: 'Type a message...',
    settingsTitle: 'Settings',
    settingsDesc: 'Configure your connection to OpenRouter.',
    apiKeyLabel: 'OpenRouter API Key',
    modelLabel: 'Model',
    customModelLabel: 'Add Custom Model ID',
    imageModelLabel: 'Image Generation Model (Pollinations)',
    systemPromptLabel: 'System Prompt',
    selectModelPlaceholder: 'Select a model',
    customModelPlaceholder: 'e.g. mistralai/mistral-large',
    imageModelPlaceholder: 'e.g. flux, flux-realism, turbo',
    systemPromptPlaceholder: 'You are a helpful assistant...',
    customModelsHeader: 'Custom Models',
  },
  zh: {
    newChat: '新对话',
    library: '库',
    settings: '设置',
    language: '语言',
    english: '英语',
    chinese: '简体中文',
    ready: '随时准备开始。',
    typeMessage: '输入消息...',
    settingsTitle: '设置',
    settingsDesc: '配置您的 OpenRouter 连接。',
    apiKeyLabel: 'OpenRouter API 密钥',
    modelLabel: '模型',
    customModelLabel: '添加自定义模型 ID',
    imageModelLabel: '图像生成模型 (Pollinations)',
    systemPromptLabel: '系统提示词',
    selectModelPlaceholder: '选择一个模型',
    customModelPlaceholder: '例如: mistralai/mistral-large',
    imageModelPlaceholder: '例如: flux, flux-realism, turbo',
    systemPromptPlaceholder: '您是一个有用的助手...',
    customModelsHeader: '自定义模型',
  }
};

export type TranslationKey = keyof typeof translations.en;

export const t = (key: TranslationKey, lang: 'en' | 'zh'): string => {
  return translations[lang][key] || key;
};
