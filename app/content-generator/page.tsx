'use client';

import { useState } from 'react';
import InputSection from '@/components/content-gen/input-section';
import PlatformTabs from '@/components/content-gen/platform-tabs';
import HistorySidebar from '@/components/content-gen/history-sidebar';

export default function ContentGeneratorPage() {
  const [article, setArticle] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGenerate = async () => {
    if (!article.trim()) return;

    setIsGenerating(true);
    setGenerationProgress([]);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article,
          additionalContext,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'progress') {
              setGenerationProgress(prev => [...prev, data.platform]);
            } else if (data.type === 'complete') {
              setGeneratedContent(data.content);

              // Save to history
              const history = JSON.parse(localStorage.getItem('contentHistory') || '[]');
              history.unshift({
                id: Date.now(),
                date: new Date().toISOString(),
                articlePreview: article.slice(0, 50) + '...',
                content: data.content,
                article,
                additionalContext,
              });
              localStorage.setItem('contentHistory', JSON.stringify(history.slice(0, 20))); // Keep last 20
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadFromHistory = (item: any) => {
    setArticle(item.article);
    setAdditionalContext(item.additionalContext || '');
    setGeneratedContent(item.content);
    setHistoryOpen(false);
  };

  const handleNewArticle = () => {
    setArticle('');
    setAdditionalContext('');
    setGeneratedContent(null);
    setGenerationProgress([]);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F3]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#264653]">
              Content Generator
            </h1>
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="px-4 py-2 text-sm font-medium text-[#264653] hover:text-[#2A9D8F] transition-colors"
            >
              {historyOpen ? 'Cerrar Historial' : 'Ver Historial'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Input Section */}
          <InputSection
            article={article}
            additionalContext={additionalContext}
            onArticleChange={setArticle}
            onContextChange={setAdditionalContext}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onNewArticle={handleNewArticle}
          />

          {/* Loading State */}
          {isGenerating && (
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A9D8F]"></div>
                <div className="text-[#264653]">
                  <p className="font-medium">Generando contenido...</p>
                  <p className="text-sm text-gray-600">~30 segundos para generar 5 plataformas</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {['LinkedIn', 'Instagram Caption', 'IG Reel Script', 'IG Stories', 'WhatsApp'].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2 text-sm">
                    {generationProgress.includes(platform) ? (
                      <>
                        <span className="text-[#2A9D8F]">✓</span>
                        <span className="text-[#264653]">{platform} listo</span>
                      </>
                    ) : (
                      <>
                        <div className="animate-pulse w-4 h-4 bg-[#F4A261] rounded-full"></div>
                        <span className="text-gray-500">{platform} generando...</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Tabs */}
          {generatedContent && !isGenerating && (
            <div className="mt-8">
              <PlatformTabs
                content={generatedContent}
                onContentUpdate={(platform, newContent, version) => {
                  setGeneratedContent({
                    ...generatedContent,
                    [platform]: newContent,
                  });
                }}
              />
            </div>
          )}
        </main>

        {/* History Sidebar */}
        {historyOpen && (
          <HistorySidebar
            onLoadArticle={handleLoadFromHistory}
            onClose={() => setHistoryOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
