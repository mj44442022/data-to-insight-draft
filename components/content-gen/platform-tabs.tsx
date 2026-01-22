'use client';

import { useState } from 'react';
import PlatformOutput from './platform-output';
import AdjustmentModal from './adjustment-modal';

interface PlatformTabsProps {
  content: any;
  onContentUpdate: (platform: string, newContent: any, version: number) => void;
}

type PlatformKey = 'linkedin' | 'instagram' | 'reel' | 'stories' | 'whatsapp';

const PLATFORMS = [
  {
    key: 'linkedin' as PlatformKey,
    label: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
  },
  {
    key: 'instagram' as PlatformKey,
    label: 'Instagram Caption',
    icon: '📸',
    color: '#E4405F',
  },
  {
    key: 'reel' as PlatformKey,
    label: 'IG Reel Script',
    icon: '🎬',
    color: '#C13584',
  },
  {
    key: 'stories' as PlatformKey,
    label: 'IG Stories',
    icon: '○',
    color: '#F77737',
  },
  {
    key: 'whatsapp' as PlatformKey,
    label: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
  },
];

export default function PlatformTabs({ content, onContentUpdate }: PlatformTabsProps) {
  const [activeTab, setActiveTab] = useState<PlatformKey>('linkedin');
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<PlatformKey | null>(null);

  const handleAdjustClick = (platform: PlatformKey) => {
    setModalPlatform(platform);
    setAdjustmentModalOpen(true);
  };

  const handleRegenerate = async (platform: PlatformKey, adjustmentInstructions: string) => {
    // Call API to regenerate only this platform
    try {
      const response = await fetch('/api/regenerate-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          currentContent: content[platform],
          adjustmentInstructions,
          originalArticle: content.originalArticle,
        }),
      });

      if (!response.ok) throw new Error('Regeneration failed');

      const newContent = await response.json();

      // Update content with new version
      const currentVersions = content[platform].versions || [content[platform].text];
      const newVersion = {
        text: newContent.text,
        version: currentVersions.length + 1,
      };

      onContentUpdate(platform, {
        ...content[platform],
        text: newContent.text,
        currentVersion: newVersion.version,
        versions: [...currentVersions, newContent.text],
      }, newVersion.version);

      setAdjustmentModalOpen(false);
    } catch (error) {
      console.error('Regeneration error:', error);
      alert('Error al regenerar. Por favor intenta de nuevo.');
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow-sm overflow-x-auto">
        <div className="flex border-b border-gray-200 min-w-max">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.key}
              onClick={() => setActiveTab(platform.key)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === platform.key
                  ? 'text-[#2A9D8F] border-b-4 border-[#2A9D8F]'
                  : 'text-gray-600 hover:text-[#2A9D8F] border-b-4 border-transparent'
              }`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span>{platform.label}</span>
              {content[platform.key]?.currentVersion && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-[#2A9D8F] bg-opacity-20 text-[#2A9D8F] rounded-full">
                  v{content[platform.key].currentVersion}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Content */}
      <div className="bg-white rounded-b-lg shadow-sm p-6">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.key}
            className={activeTab === platform.key ? 'block' : 'hidden'}
          >
            <PlatformOutput
              platform={platform.key}
              platformLabel={platform.label}
              content={content[platform.key]}
              onAdjustClick={() => handleAdjustClick(platform.key)}
              onContentEdit={(newText) => {
                onContentUpdate(platform.key, {
                  ...content[platform.key],
                  text: newText,
                }, content[platform.key].currentVersion || 1);
              }}
            />
          </div>
        ))}
      </div>

      {/* Adjustment Modal */}
      {adjustmentModalOpen && modalPlatform && (
        <AdjustmentModal
          platform={modalPlatform}
          platformLabel={PLATFORMS.find(p => p.key === modalPlatform)?.label || ''}
          currentContent={content[modalPlatform]}
          onClose={() => setAdjustmentModalOpen(false)}
          onRegenerate={(instructions) => handleRegenerate(modalPlatform, instructions)}
        />
      )}
    </div>
  );
}
