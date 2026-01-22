'use client';

import { useState } from 'react';

interface InputSectionProps {
  article: string;
  additionalContext: string;
  onArticleChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onNewArticle: () => void;
}

export default function InputSection({
  article,
  additionalContext,
  onArticleChange,
  onContextChange,
  onGenerate,
  isGenerating,
  onNewArticle,
}: InputSectionProps) {
  const [showContext, setShowContext] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#264653]">
          Tu Artículo
        </h2>
        {article && (
          <button
            onClick={onNewArticle}
            className="text-sm text-[#E76F51] hover:text-[#d45a3a] transition-colors"
          >
            Nuevo artículo
          </button>
        )}
      </div>

      {/* Main Textarea */}
      <textarea
        value={article}
        onChange={(e) => onArticleChange(e.target.value)}
        placeholder="Pega tu artículo aquí (funciona con ideas sueltas también)"
        className="w-full min-h-[200px] p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F] focus:ring-opacity-20 focus:outline-none transition-all duration-200 text-[#264653] placeholder-gray-400"
        style={{ height: 'auto' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = target.scrollHeight + 'px';
        }}
      />

      <div className="mt-2 text-sm text-gray-500">
        {article.length} caracteres • ~{Math.ceil(article.split(' ').length / 150)} min de lectura
      </div>

      {/* Additional Context (Collapsible) */}
      <div className="mt-4">
        <button
          onClick={() => setShowContext(!showContext)}
          className="text-sm text-[#2A9D8F] hover:text-[#238276] transition-colors flex items-center space-x-1"
        >
          <span>{showContext ? '▼' : '▶'}</span>
          <span>Contexto adicional (opcional)</span>
        </button>

        {showContext && (
          <textarea
            value={additionalContext}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="Ej: enfócate en el ángulo de productividad, usa un tono personal"
            className="w-full mt-2 p-3 border-2 border-gray-200 rounded-lg resize-none focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F] focus:ring-opacity-20 focus:outline-none transition-all duration-200 text-[#264653] placeholder-gray-400"
            rows={3}
          />
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!article.trim() || isGenerating}
        className={`mt-6 w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          !article.trim() || isGenerating
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#2A9D8F] hover:bg-[#238276] hover:scale-[1.02] shadow-md hover:shadow-xl'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generando...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <span>Generar contenido para 5 plataformas</span>
            <span>→</span>
          </span>
        )}
      </button>
    </div>
  );
}
