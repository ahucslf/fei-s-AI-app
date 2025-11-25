import React, { useState, useEffect } from 'react';
import { X, Save, Lock, Users, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCandidates: string[];
  initialRigged: string[];
  onSave: (candidates: string[], rigged: string[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialCandidates,
  initialRigged,
  onSave
}) => {
  const [candidatesText, setCandidatesText] = useState('');
  const [riggedText, setRiggedText] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCandidatesText(initialCandidates.join('\n'));
      setRiggedText(initialRigged.join('\n'));
    }
  }, [isOpen, initialCandidates, initialRigged]);

  const handleSave = () => {
    const cleanCandidates = candidatesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const cleanRigged = riggedText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onSave(cleanCandidates, cleanRigged);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            后台设置
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Public Pool Column */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              班级大名单 (滚动池)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              这些名字会出现在随机滚动的动画中。
            </p>
            <textarea
              value={candidatesText}
              onChange={(e) => setCandidatesText(e.target.value)}
              placeholder="张三&#10;李四&#10;王五&#10;赵六..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none min-h-[300px]"
            />
            <div className="text-xs text-slate-500 text-right">
              {candidatesText.split('\n').filter(x => x.trim()).length} 人
            </div>
          </div>

          {/* Rigged List Column */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              内定名单 (按序抽取)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              系统将严格按照此列表顺序点名。
            </p>
            <textarea
              value={riggedText}
              onChange={(e) => setRiggedText(e.target.value)}
              placeholder="内定同学A&#10;内定同学B&#10;..."
              className="flex-1 bg-slate-950 border border-amber-900/30 rounded-lg p-4 text-amber-100 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none min-h-[300px]"
            />
             <div className="flex justify-between items-center text-xs">
                <span className="text-amber-600/80 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3"/> 隐藏配置
                </span>
                <span className="text-slate-500">
                  {riggedText.split('\n').filter(x => x.trim()).length} 人排队中
                </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存并重置
          </Button>
        </div>
      </div>
    </div>
  );
};