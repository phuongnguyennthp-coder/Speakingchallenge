import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ExternalLink, Volume2, Eye } from 'lucide-react';
import { MindmapBranch, MindmapSourceType } from '../types';
import { speechService } from '../utils/speech';
import { sounds } from '../utils/soundEffects';

interface MindmapViewerProps {
  sourceType: MindmapSourceType;
  url: string;
  title: string;
  unitNumber: string;
  unitTitle: string;
  branches: MindmapBranch[];
  activeBranchId: string;
  onSelectBranch: (branchId: string) => void;
}

export const MindmapViewer: React.FC<MindmapViewerProps> = ({
  sourceType,
  url,
  title,
  unitNumber,
  unitTitle,
  branches,
  activeBranchId,
  onSelectBranch,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getBranchBadgeColor = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'from-emerald-500 to-teal-500 text-white border-emerald-300';
      case 'blue':
        return 'from-sky-500 to-blue-500 text-white border-blue-300';
      case 'amber':
        return 'from-amber-500 to-orange-500 text-white border-amber-300';
      case 'purple':
        return 'from-purple-500 to-indigo-500 text-white border-purple-300';
      default:
        return 'from-rose-500 to-pink-500 text-white border-rose-300';
    }
  };

  // 1. YouTube or Google Drive Video Mindmap
  if (sourceType === 'youtube' || (url && (url.includes('youtube.com') || url.includes('youtu.be')))) {
    let embedUrl = url;
    if (url.includes('watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/').split('&')[0];
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
    }
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200">
        <iframe src={embedUrl} title="Mindmap Video" className="w-full h-full" allowFullScreen />
      </div>
    );
  }

  if (sourceType === 'drive' || (url && url.includes('drive.google.com'))) {
    const previewUrl = url.includes('/view') ? url.replace('/view', '/preview') : url;
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200">
        <iframe src={previewUrl} title="Drive Mindmap" className="w-full h-full" allow="autoplay" />
      </div>
    );
  }

  // 2. Direct Video File
  if (sourceType === 'video' || (url && (url.endsWith('.mp4') || url.endsWith('.webm')))) {
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200">
        <video src={url} controls className="w-full h-full object-contain" />
      </div>
    );
  }

  // 3. Web or Interactive Link (Canva, Coggle, Genially, etc.)
  if (sourceType === 'link' && url) {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5 text-center space-y-3">
        <p className="text-xs sm:text-sm font-bold text-slate-700">
          This Mindmap is hosted externally on an interactive platform.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer"
        >
          <span>Open Interactive Mindmap in New Tab</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // 4. Uploaded or Image Mindmap
  if ((sourceType === 'upload' || sourceType === 'image') && url) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-500">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            title="Fullscreen Mindmap"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div className="rounded-2xl overflow-auto border-2 border-slate-200 bg-slate-50 flex items-center justify-center p-3 max-h-[500px]">
          <img
            src={url}
            alt="Mindmap Material"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            className="rounded-xl object-contain transition-transform duration-200"
          />
        </div>

        {/* Fullscreen Modal */}
        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="max-w-5xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-auto border-4 border-emerald-300 shadow-2xl">
              <img src={url} alt="Fullscreen Mindmap" className="max-h-[80vh] w-auto mx-auto rounded-xl object-contain" />
              <p className="text-center text-xs font-bold text-slate-500 mt-2">Click anywhere to close</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. Default Interactive Diagram / SVG Tree View
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-sky-50/40 border-2 border-emerald-200/80 p-4 sm:p-6">
      {/* Center Core Node */}
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-3xl shadow-lg shadow-teal-200 text-center border-4 border-white">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-200 block">
            {unitNumber} • MAIN TOPIC
          </span>
          <h4 className="text-sm sm:text-lg font-black font-heading mt-0.5">{unitTitle}</h4>
        </div>
      </div>

      {/* Mindmap Branches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {branches.map((branch, idx) => {
          const isActive = activeBranchId === branch.id;
          return (
            <div
              key={branch.id || idx}
              onClick={() => {
                sounds.playEncouragementChime();
                onSelectBranch(branch.id);
              }}
              className={`rounded-2xl p-4 transition-all cursor-pointer border-2 ${
                isActive
                  ? 'bg-white shadow-md border-emerald-400 ring-2 ring-emerald-200 scale-[1.01]'
                  : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${getBranchBadgeColor(
                      branch.color
                    )} flex items-center justify-center font-black text-xs shadow-xs`}
                  >
                    {idx + 1}
                  </span>
                  <h5 className="font-extrabold text-slate-800 text-sm sm:text-base font-heading">{branch.title}</h5>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speechService.speak(
                      `${branch.title}. ${branch.simpleExplanation} Key words: ${branch.items.join(', ')}`
                    );
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 cursor-pointer"
                  title="Listen to branch explanation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Branch items pill tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {branch.items.map((item, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80"
                  >
                    • {item}
                  </span>
                ))}
              </div>

              {/* Simple explanation grounded ONLY in teacher's mindmap */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium leading-relaxed bg-amber-50/50 p-2 rounded-xl">
                <span className="font-bold text-amber-900 block mb-0.5">Simple Branch Explanation:</span>
                {branch.simpleExplanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
