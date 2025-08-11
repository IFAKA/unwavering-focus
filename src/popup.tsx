import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
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
    <div className="ds-container flex flex-col h-[485px] w-[300px] overflow-y-auto overflow-x-hidden">
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
  createRoot(root).render(
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>
  );
}