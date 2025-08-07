import React, { useState } from 'react';
import { useConfig } from '../../../hooks/useConfig';
import { DistractingDomain } from '../../../types';
import SettingsHeader from '../../ui/SettingsHeader';
import SettingsSection from '../../ui/SettingsSection';
import ToggleSwitch from '../../ui/ToggleSwitch';
import AppleWatchButton from '../../ui/AppleWatchButton';
import AppleWatchIcon from '../../ui/AppleWatchIcon';

interface BlockerSettingsProps {
  onNavigateBack: () => void;
}

type BlockerSection = 'main' | 'domains' | 'add';

const BlockerSettings: React.FC<BlockerSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();
  const [currentSection, setCurrentSection] = useState<BlockerSection>('main');
  const [newDomain, setNewDomain] = useState('');
  const [newDomainLimit, setNewDomainLimit] = useState(20);

  const handleToggleBlocker = (enabled: boolean) => {
    updateConfig('distractionBlocker.enabled', enabled);
  };

  const addDomain = async () => {
    if (!config) return;
    
    const domainName = newDomain.trim().toLowerCase();
    if (domainName && newDomainLimit > 0) {
      // Check for duplicates
      const existingDomain = config.distractionBlocker.domains.find(
        d => d.domain.toLowerCase() === domainName
      );
      
      if (existingDomain) {
        return;
      }

      const newDomainObj: DistractingDomain = {
        domain: domainName,
        dailyTimeLimit: newDomainLimit,
        timeUsedToday: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      
      const updatedConfig = {
        ...config,
        distractionBlocker: {
          ...config.distractionBlocker,
          domains: [newDomainObj, ...config.distractionBlocker.domains]
        }
      };
      
      await updateConfig('distractionBlocker.domains', updatedConfig.distractionBlocker.domains);
      setNewDomain('');
      setNewDomainLimit(20);
      setCurrentSection('main');
    }
  };

  const removeDomain = async (index: number) => {
    if (!config) return;
    
    const domains = config.distractionBlocker.domains.filter((_, i) => i !== index);
    await updateConfig('distractionBlocker.domains', domains);
  };

  const renderMainMenu = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Blocker"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Distraction Blocker</div>
              <div className="text-xs text-text-secondary">Block distracting websites</div>
            </div>
            <ToggleSwitch
              checked={config?.distractionBlocker?.enabled || false}
              onChange={handleToggleBlocker}
            />
          </div>
        </div>

        {config?.distractionBlocker?.enabled && (
          <div className="flex flex-col gap-sm">
            <SettingsSection
              id="blocked-domains"
              title="Blocked Domains"
              subtitle={`${(config?.distractionBlocker?.domains?.length || 0)} domains`}
              icon="ban"
              onClick={() => setCurrentSection('domains')}
            />
            
            <SettingsSection
              id="add-domain"
              title="Add Domain"
              subtitle="Block a distracting website"
              icon="plus"
              onClick={() => setCurrentSection('add')}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderDomainsList = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Blocked Domains"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-sm">
        {(config?.distractionBlocker?.domains?.length || 0) > 0 ? (
          (config?.distractionBlocker?.domains || []).map((domain, index) => (
            <div key={index} className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-md font-semibold text-text-primary">{domain.domain}</div>
                  <div className="text-xs text-text-secondary">{domain.dailyTimeLimit} min/day</div>
                </div>
                <button
                  className="w-6 h-6 bg-danger-color text-white rounded-full flex items-center justify-center text-sm hover:bg-[#dc2626] transition-colors"
                  onClick={() => removeDomain(index)}
                  title="Remove domain"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="text-4xl mb-sm opacity-50">
              <AppleWatchIcon name="ban" size="xl" />
            </div>
            <div className="text-md font-semibold text-text-primary mb-xs">No Domains</div>
            <div className="text-sm text-text-secondary">Add domains to block distractions</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddDomain = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Add Domain"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-md">
                <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-sm">
              <input
                type="text"
                placeholder="facebook.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                maxLength={20}
                className="flex-1 bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm"
              />
              <AppleWatchButton
                variant="primary"
                size="small"
                onClick={addDomain}
              >
                +
              </AppleWatchButton>
            </div>
            <div className="flex items-center gap-sm">
              <input
                type="number"
                placeholder="30"
                value={newDomainLimit}
                onChange={(e) => setNewDomainLimit(parseInt(e.target.value) || 0)}
                min="1"
                max="480"
                className="w-20 bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm"
              />
              <span className="text-xs text-text-secondary">minutes per day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentSection) {
    case 'main':
      return renderMainMenu();
    case 'domains':
      return renderDomainsList();
    case 'add':
      return renderAddDomain();
    default:
      return renderMainMenu();
  }
};

export default BlockerSettings; 