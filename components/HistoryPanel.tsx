import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2 } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
        <h3 className="text-slate-200 font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          点名记录
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> 清空
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2">
        <ul className="divide-y divide-slate-700/50">
          {history.map((item, index) => (
            <li key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors rounded-lg">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-slate-500 text-xs font-mono border border-slate-700">
                  {history.length - index}
                </span>
                <span className="text-slate-200 font-medium">{item.name}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};