import React, { useState } from 'react';
import { BotIcon, LogoutIcon, DashboardIcon, LeadsIcon, PropertyIcon, LocationIcon, MenuIcon, CloseIcon, HelpIcon } from './Icons';
import { DashboardPage } from './admin/DashboardPage';
import { LeadsListPage } from './admin/LeadsListPage';
import { PropertiesListPage } from './admin/PropertiesListPage';
import { LocationsListPage } from './admin/LocationsListPage';
import { LocationDetailPage } from './admin/LocationDetailPage';
import { AdminHelpModal } from './admin/AdminHelpModal';


interface AdminPageProps {
  onLogout: () => void;
  onDataChange: () => void;
}

type AdminView = 'dashboard' | 'leads' | 'properties' | 'locations';

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout, onDataChange }) => {
  const [view, setView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const handleSetView = (targetView: AdminView) => {
    setView(targetView);
    setSelectedLocation(null); // Reset location detail when switching main views
    setIsSidebarOpen(false); // Close sidebar on navigation
  }

  const handleSelectLocation = (locationName: string) => {
      setView('locations'); // Keep the sidebar active on 'locations'
      setSelectedLocation(locationName);
  }

  const NavLink: React.FC<{
    targetView: AdminView;
    children: React.ReactNode;
    icon: React.ReactNode;
  }> = ({ targetView, children, icon }) => {
    const isActive = view === targetView;
    const classes = `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
      isActive
        ? 'bg-brand-secondary text-white font-bold'
        : 'text-gray-200 hover:bg-white/10'
    }`;
    return (
      <button onClick={() => handleSetView(targetView)} className={classes}>
        {icon}
        <span>{children}</span>
      </button>
    );
  };

  const pageTitle: Record<AdminView, string> = {
    dashboard: 'Dashboard',
    leads: 'Gerenciamento de Leads',
    properties: 'Gerenciamento de Imóveis',
    locations: 'Gerenciamento de Localidades',
  }

  const renderContent = () => {
    if (selectedLocation) {
        return <LocationDetailPage locationName={selectedLocation} onBack={() => setSelectedLocation(null)} />;
    }
    switch(view) {
        case 'dashboard': return <DashboardPage />;
        case 'leads': return <LeadsListPage />;
        case 'properties': return <PropertiesListPage onDataChange={onDataChange} />;
        case 'locations': return <LocationsListPage onDataChange={onDataChange} onSelectLocation={handleSelectLocation} />;
        default: return <DashboardPage />;
    }
  }

  return (
    <div className="h-full w-full flex bg-gray-100">
      {/* Sidebar Overlay for mobile */}
       {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-brand-primary text-white flex flex-col p-4 z-40 transform transition-transform md:relative md:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between gap-3 p-4 border-b border-white/20 mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <BotIcon />
            </div>
            <div>
                <h1 className="text-lg font-bold">Admin</h1>
                <p className="text-xs opacity-80">Ultra Imobiliária</p>
            </div>
          </div>
           <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
                <CloseIcon />
            </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
           <NavLink targetView="dashboard" icon={<DashboardIcon />}>Dashboard</NavLink>
           <NavLink targetView="leads" icon={<LeadsIcon />}>Leads</NavLink>
           <NavLink targetView="properties" icon={<PropertyIcon />}>Imóveis</NavLink>
           <NavLink targetView="locations" icon={<LocationIcon />}>Localidades</NavLink>
        </nav>
        <div className="mt-4 border-t border-white/20 pt-4 space-y-2">
            <button
                onClick={() => setShowHelpModal(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left text-gray-200 hover:bg-white/10"
            >
                <HelpIcon />
                <span>Ajuda</span>
            </button>
            <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2 w-full"
            aria-label="Sair"
            >
            <LogoutIcon />
            <span>Sair</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 md:hidden flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)}>
                <MenuIcon />
            </button>
            <h1 className="text-xl font-bold text-brand-dark">{pageTitle[view]}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {renderContent()}
        </main>
      </div>

      {showHelpModal && <AdminHelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
};