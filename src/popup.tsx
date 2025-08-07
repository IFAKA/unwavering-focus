import React, { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import PopupMain from './components/popup/PopupMain';
import PopupSettings from './components/popup/PopupSettings';
import './styles.css';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main');

  const handleNavigateToSettings = () => {
    setActiveTab('settings');
  };

  const handleNavigateToMain = () => {
    setActiveTab('main');
  };

  return (
    <div className="flex flex-col h-[485px] bg-bg-primary w-[300px] overflow-y-auto overflow-x-hidden text-text-primary font-apple">
      {activeTab === 'main' && (
        <PopupMain onNavigateToSettings={handleNavigateToSettings} />
      )}
      {activeTab === 'settings' && (
        <PopupSettings onNavigateToMain={handleNavigateToMain} />
      )}
    </div>
  );
};

// Render the popup
const root = document.getElementById('root');
if (root) {
  import('react-dom/client').then(({ createRoot }) => {
    createRoot(root).render(
      <ErrorBoundary>
        <Popup />
      </ErrorBoundary>
    );
  });
}