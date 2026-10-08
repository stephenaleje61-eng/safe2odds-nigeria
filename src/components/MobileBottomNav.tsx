import React from 'react';
import { Home, Flame, CheckSquare, Radio, Users, MessageSquare } from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tips', label: "Tips", icon: Flame },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'livescores', label: 'Live', icon: Radio },
    { id: 'results', label: 'Results', icon: CheckSquare },
    { id: 'community', label: 'Fans', icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E121A]/95 backdrop-blur-md border-t border-red-950/50 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-6 items-center max-w-md mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors min-h-[44px] ${
                isActive ? 'text-red-500 font-black' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-red-500' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
