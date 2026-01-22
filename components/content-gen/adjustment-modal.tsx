'use client';

import { useState } from 'react';

interface AdjustmentModalProps {
  platform: string;
  platformLabel: string;
  currentContent: any;
  onClose: () => void;
  onRegenerate: (instructions: string) => Promise<void>;
}

export default function AdjustmentModal({
  platform,
  platformLabel,
  currentContent,
  onClose,
  onRegenerate,
}: AdjustmentModalProps) {
  const [instructions, setInstructions] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!instructions.trim()) return;

    setIsRegenerating(true);
    try {
      await onRegenerate(instructions);
    } finally {
      setIsRegenerating(false);
    }
  };

  const currentText = currentContent?.text || '';
  const currentVersion = currentContent?.currentVersion || 1;
  const versions = currentContent?.versions || [currentText];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#264653]">
              Ajustar {platformLabel}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Versión actual: v{currentVersion}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido actual (v{currentVersion})
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-[#264653] whitespace-pre-wrap">{currentText}</p>
            </div>
          </div>

          {/* Version History */}
          {versions.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historial de versiones
              </label>
              <div className="flex items-center space-x-2">
                {versions.map((_: any, index: number) => (
                  <button
                    key={index}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      index + 1 === currentVersion
                        ? 'bg-[#2A9D8F] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    v{index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adjustment Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué quieres cambiar?
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ej: hazlo más corto, cambia el tono a más personal, enfócate en los beneficios"
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F] focus:ring-opacity-20 focus:outline-none text-[#264653] resize-none transition-all duration-200"
            />
            <p className="mt-2 text-xs text-gray-500">
              Sé específico sobre lo que quieres cambiar. El sistema mantendrá el resto del contenido similar.
            </p>
          </div>

          {/* Quick Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sugerencias rápidas
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Hazlo más corto',
                'Hazlo más largo y detallado',
                'Tono más profesional',
                'Tono más personal',
                'Agregar más emojis',
                'Sin emojis',
                'Enfócate en beneficios',
                'Agregar CTA más fuerte',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInstructions(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-[#2A9D8F] hover:text-white text-gray-700 rounded-full transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleRegenerate}
            disabled={!instructions.trim() || isRegenerating}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              !instructions.trim() || isRegenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#E76F51] text-white hover:bg-[#d45a3a] hover:scale-105 shadow-md hover:shadow-xl'
            }`}
          >
            {isRegenerating ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Regenerando...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>🔄</span>
                <span>Regenerar solo {platformLabel}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
