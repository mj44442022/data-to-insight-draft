'use client';

import { useState, useEffect } from 'react';

interface HistorySidebarProps {
  onLoadArticle: (item: any) => void;
  onClose: () => void;
}

export default function HistorySidebar({ onLoadArticle, onClose }: HistorySidebarProps) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('contentHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleDelete = (id: number) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('contentHistory', JSON.stringify(newHistory));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-96 bg-white border-l border-gray-200 h-screen overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#264653]">
            Historial
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {history.length} artículos guardados
        </p>
      </div>

      {/* History List */}
      <div className="p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500 text-sm">
              No hay artículos guardados aún
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="group border border-gray-200 rounded-lg p-4 hover:border-[#2A9D8F] hover:shadow-md transition-all cursor-pointer"
              onClick={() => onLoadArticle(item)}
            >
              {/* Date */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {formatDate(item.date)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Eliminar este artículo del historial?')) {
                      handleDelete(item.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  🗑️
                </button>
              </div>

              {/* Article Preview */}
              <p className="text-sm text-[#264653] line-clamp-2">
                {item.articlePreview}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                <span>📄 {item.article.split(' ').length} palabras</span>
                <span>
                  {Object.keys(item.content || {}).length} plataformas
                </span>
              </div>

              {/* Platforms Generated */}
              <div className="flex items-center space-x-1 mt-2">
                {item.content?.linkedin && <span className="text-xs">💼</span>}
                {item.content?.instagram && <span className="text-xs">📸</span>}
                {item.content?.reel && <span className="text-xs">🎬</span>}
                {item.content?.stories && <span className="text-xs">○</span>}
                {item.content?.whatsapp && <span className="text-xs">💬</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
