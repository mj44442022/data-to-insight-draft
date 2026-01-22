'use client';

import { useState } from 'react';

interface PlatformOutputProps {
  platform: string;
  platformLabel: string;
  content: any;
  onAdjustClick: () => void;
  onContentEdit: (newText: string) => void;
}

export default function PlatformOutput({
  platform,
  platformLabel,
  content,
  onAdjustClick,
  onContentEdit,
}: PlatformOutputProps) {
  const [copied, setCopied] = useState(false);
  const [editedText, setEditedText] = useState(content?.text || '');

  const handleCopy = () => {
    let textToCopy = '';

    if (platform === 'stories' && content?.slides) {
      textToCopy = content.slides.map((slide: any, i: number) =>
        `Slide ${i + 1}:\n${slide.text}\n${slide.visual ? `Visual: ${slide.visual}` : ''}`
      ).join('\n\n');
    } else if (platform === 'reel' && content?.script) {
      textToCopy = content.script.map((segment: any) =>
        `${segment.timestamp}: ${segment.text}`
      ).join('\n');
    } else {
      textToCopy = editedText;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = editedText.length;
  const wordCount = editedText.split(' ').filter((w: string) => w).length;

  // Stories specific rendering
  if (platform === 'stories' && content?.slides) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#264653]">
            {platformLabel}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAdjustClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-white border-2 border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51] hover:text-white rounded-lg transition-all duration-200"
            >
              <span>🔄</span>
              <span>Regenerar slides</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                copied
                  ? 'bg-[#2A9D8F] bg-opacity-20 text-[#2A9D8F] border-2 border-[#2A9D8F]'
                  : 'bg-[#E76F51] text-white hover:bg-[#d45a3a] hover:scale-105 shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copiar todas</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {content.slides.map((slide: any, index: number) => (
            <div
              key={index}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#2A9D8F] hover:shadow-md transition-all duration-200 bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#2A9D8F]">
                  Slide {index + 1}/{content.slides.length}
                </span>
                <span className="text-xs text-gray-500">
                  {slide.text.length} caracteres
                </span>
              </div>
              <textarea
                value={slide.text}
                onChange={(e) => {
                  const newSlides = [...content.slides];
                  newSlides[index] = { ...newSlides[index], text: e.target.value };
                  onContentEdit(JSON.stringify(newSlides));
                }}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F] focus:ring-opacity-20 focus:outline-none text-[#264653] resize-none transition-all duration-200"
                rows={2}
              />
              {slide.visual && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Visual sugerido:</span> {slide.visual}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Reel script specific rendering
  if (platform === 'reel' && content?.script) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#264653]">
            {platformLabel}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAdjustClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-white border-2 border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51] hover:text-white rounded-lg transition-all duration-200"
            >
              <span>🔄</span>
              <span>Regenerar con ajustes</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                copied
                  ? 'bg-[#2A9D8F] bg-opacity-20 text-[#2A9D8F] border-2 border-[#2A9D8F]'
                  : 'bg-[#E76F51] text-white hover:bg-[#d45a3a] hover:scale-105 shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {content.script.map((segment: any, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 px-3 py-1 bg-[#F4A261] bg-opacity-20 text-[#F4A261] font-mono text-sm rounded">
                {segment.timestamp}
              </span>
              <textarea
                value={segment.text}
                onChange={(e) => {
                  const newScript = [...content.script];
                  newScript[index] = { ...newScript[index], text: e.target.value };
                  onContentEdit(JSON.stringify(newScript));
                }}
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:outline-none text-[#264653] resize-none"
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // WhatsApp specific rendering with preview
  if (platform === 'whatsapp') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#264653]">
            {platformLabel}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAdjustClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-white border-2 border-[#E76F51] text-[#E76F51] hover:bg-[#E76F51] hover:text-white rounded-lg transition-all duration-200"
            >
              <span>🔄</span>
              <span>Regenerar con ajustes</span>
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                copied
                  ? 'bg-[#2A9D8F] bg-opacity-20 text-[#2A9D8F] border-2 border-[#2A9D8F]'
                  : 'bg-[#E76F51] text-white hover:bg-[#d45a3a] hover:scale-105 shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Editar mensaje
            </label>
            <textarea
              value={editedText}
              onChange={(e) => {
                setEditedText(e.target.value);
                onContentEdit(e.target.value);
              }}
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F] focus:ring-opacity-20 focus:outline-none text-[#264653] resize-none transition-all duration-200"
            />
            <div className="mt-2 text-sm text-gray-500">
              {charCount} caracteres • {wordCount} palabras
            </div>
          </div>

          {/* WhatsApp Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista previa
            </label>
            <div className="bg-[#E5DDD5] h-64 rounded-lg p-4 overflow-y-auto">
              <div className="flex justify-end">
                <div className="bg-[#DCF8C6] rounded-lg px-4 py-2 max-w-xs shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{editedText}</p>
                  <span className="text-xs text-gray-500 mt-1 block text-right">
                    {new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard rendering for LinkedIn and Instagram Caption
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#264653]">
          {platformLabel}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onAdjustClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#2A9D8F] hover:bg-[#2A9D8F] hover:bg-opacity-10 rounded-lg transition-all"
          >
            <span>🔄</span>
            <span>Regenerar con ajustes</span>
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              copied
                ? 'bg-[#2A9D8F] text-white'
                : 'bg-[#E76F51] text-white hover:bg-[#d45a3a]'
            }`}
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <textarea
        value={editedText}
        onChange={(e) => {
          setEditedText(e.target.value);
          onContentEdit(e.target.value);
        }}
        className="w-full min-h-[300px] p-4 border-2 border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F] focus:ring-opacity-20 focus:outline-none text-[#264653] resize-none transition-all duration-200"
      />

      <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
        <span>{charCount} caracteres • {wordCount} palabras</span>
        {platform === 'linkedin' && charCount > 3000 && (
          <span className="text-[#E76F51]">⚠️ LinkedIn recomienda máx 3000 caracteres</span>
        )}
        {platform === 'instagram' && charCount > 2200 && (
          <span className="text-[#E76F51]">⚠️ Instagram caption truncará después de 2200</span>
        )}
      </div>
    </div>
  );
}
