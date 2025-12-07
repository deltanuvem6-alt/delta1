

import React, { useState, useEffect } from 'react';
import type { Page, Company, ServicePost, MonitoringEvent } from '../types';
import { Page as PageEnum } from '../types';
import { DashboardContent, ServicePostsContent, MonitoringContent, ReportsContent, AlertaVigiaContent } from './ContentPanels';
import { ShieldCheckIcon, LogOutIcon, MenuIcon, XIcon, BellIcon, LayoutDashboardIcon, BuildingOfficeIcon, FileTextIcon, EyeIcon } from './Icons';

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isCollapsed, isActive, onClick }) => (
    <li>
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            title={isCollapsed ? label : undefined}
            className={`flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 group transition-colors ${isActive ? 'bg-blue-600 text-white' : ''} ${isCollapsed ? 'justify-center' : ''}`}
        >
            {icon}
            <span className={`flex-1 ml-3 whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{label}</span>
        </a>
    </li>
);

const Sidebar: React.FC<{ 
    isCollapsed: boolean; 
    currentPage: Page; 
    setCurrentPage: (page: Page) => void; 
    currentUser: Company | null;
}> = ({ isCollapsed, currentPage, setCurrentPage, currentUser }) => {
    const allNavItems = [
        { id: PageEnum.Dashboard, icon: <LayoutDashboardIcon className="w-6 h-6" />, label: "Dashboard" },
        { id: PageEnum.ServicePosts, icon: <BuildingOfficeIcon className="w-6 h-6" />, label: "Postos de Serviço" },
        { id: PageEnum.Monitoring, icon: <ShieldCheckIcon className="w-6 h-6" />, label: "Monitoramento" },
        { id: PageEnum.AlertaVigia, icon: <EyeIcon className="w-6 h-6" />, label: "Alerta Vigia" },
        { id: PageEnum.Reports, icon: <FileTextIcon className="w-6 h-6" />, label: "Relatórios" },
    ];

    const isAdmin = currentUser?.username === 'admin';

    const navItems = allNavItems.filter(item => {
        if (item.id === PageEnum.Dashboard) {
            return isAdmin;
        }
        return true;
    });

    return (
        <aside
            className={`z-40 fixed top-0 left-0 h-screen bg-gray-900/70 backdrop-blur-xl border-r border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0' : 'w-64'} overflow-hidden`}
            aria-label="Sidebar"
        >
            <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
                <div className={`flex items-center mb-10 h-10 ${isCollapsed ? 'justify-center' : 'pl-3'}`}>
                     <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
                        <span className={`self-center text-xl font-semibold whitespace-nowrap text-white ${isCollapsed ? 'hidden' : ''}`}>DeltaNuvem</span>
                     </div>
                </div>
                <ul className="space-y-2 font-medium flex-grow">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isCollapsed={isCollapsed}
                            isActive={currentPage === item.id}
                            onClick={() => setCurrentPage(item.id)}
                        />
                    ))}
                </ul>
            </div>
        </aside>
    );
};

const Header: React.FC<{ currentUser: Company, onLogout: () => void, isSidebarCollapsed: boolean, onToggleSidebar: () => void }> = ({ currentUser, onLogout, isSidebarCollapsed, onToggleSidebar }) => (
    <header className="fixed top-0 z-30 w-full bg-gray-900/50 backdrop-blur-md border-b border-gray-700">
        <div className={`px-3 py-3 lg:px-5 lg:pl-3`}>
            <div className={`flex items-center justify-between transition-all duration-300 ease-in-out ${!isSidebarCollapsed ? 'ml-64' : 'ml-0'}`}>
                <div className="flex items-center">
                    <button onClick={onToggleSidebar} className="p-2 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button className="p-2 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white" title="Notificações">
                        <BellIcon className="w-6 h-6" />
                    </button>
                    <img className="h-8 w-8 rounded-full object-cover" src={currentUser.logo} alt={currentUser.name} />
                    <button onClick={onLogout} className="flex items-center gap-2 p-2 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white">
                        <LogOutIcon className="w-6 h-6" />
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const Footer: React.FC = () => (
    <footer className="w-full p-4 text-center text-sm text-gray-400">
        Support WhatsApp: (11) 99803-7370
    </footer>
);

const Dashboard: React.FC<{
    currentUser: Company;
    onLogout: () => void;
    companies: Company[];
    posts: ServicePost[];
    events: MonitoringEvent[];
    onToggleEventStatus: (id: number) => void;
    onAddPost: () => void;
    onEdit: (c: Company) => void;
    onDelete: (c: Company) => void;
    onBlock: (c: Company) => void;
    onEditPost: (p: ServicePost) => void;
    onDeletePost: (p: ServicePost) => void;
    onBlockPost: (p: ServicePost) => void;
    onMonitorPost: (p: ServicePost) => void;
    onAddComment: (event: MonitoringEvent) => void;
    postSearchQuery: string;
    onPostSearchChange: (query: string) => void;
    companySearchQuery: string;
    onCompanySearchChange: (query: string) => void;
    onSendAlertVigiaAction: (postId: string, password: string) => Promise<string | true>;
    hiddenEventIds: Set<number>;
    onHideEvents: (idsToHide: Set<number>) => void;
    onRestoreHiddenEvents: () => void;
    onOpenTestEmailModal: () => void;
}> = ({ currentUser, onLogout, companies, posts, events, onToggleEventStatus, onAddPost, onEdit, onDelete, onBlock, onEditPost, onDeletePost, onBlockPost, onMonitorPost, onAddComment, postSearchQuery, onPostSearchChange, companySearchQuery, onCompanySearchChange, onSendAlertVigiaAction, hiddenEventIds, onHideEvents, onRestoreHiddenEvents, onOpenTestEmailModal }) => {
    const isAdmin = currentUser.username === 'admin';
    const [currentPage, setCurrentPage] = useState<Page>(isAdmin ? PageEnum.Dashboard : PageEnum.ServicePosts);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        // If a non-admin user somehow gets on a restricted page, redirect them.
        if (!isAdmin && (currentPage === PageEnum.Dashboard)) {
            setCurrentPage(PageEnum.ServicePosts);
        }
    }, [isAdmin, currentPage, setCurrentPage]);

    const renderContent = () => {
        switch (currentPage) {
            case PageEnum.Dashboard:
                return isAdmin ? <DashboardContent companies={companies} posts={posts} onEdit={onEdit} onDelete={onDelete} onBlock={onBlock} searchQuery={companySearchQuery} onSearchChange={onCompanySearchChange} onOpenTestEmailModal={onOpenTestEmailModal} /> : null;
            case PageEnum.ServicePosts:
                return <ServicePostsContent posts={posts} onAddPost={onAddPost} onEdit={onEditPost} onDelete={onDeletePost} onBlock={onBlockPost} onMonitor={onMonitorPost} searchQuery={postSearchQuery} onSearchChange={onPostSearchChange} isAdmin={isAdmin} />;
            case PageEnum.Monitoring:
                return <MonitoringContent events={events} onToggleStatus={onToggleEventStatus} onAddComment={onAddComment} hiddenEventIds={hiddenEventIds} onHideEvents={onHideEvents} onRestoreHiddenEvents={onRestoreHiddenEvents} />;
            case PageEnum.AlertaVigia:
                return <AlertaVigiaContent onSendAction={onSendAlertVigiaAction} />;
            case PageEnum.Reports:
                return <ReportsContent events={events} posts={posts} currentUser={currentUser} />;
                
            default:
                return isAdmin ? <DashboardContent companies={companies} posts={posts} onEdit={onEdit} onDelete={onDelete} onBlock={onBlock} searchQuery={companySearchQuery} onSearchChange={onCompanySearchChange} onOpenTestEmailModal={onOpenTestEmailModal} /> : <ServicePostsContent posts={posts} onAddPost={onAddPost} onEdit={onEditPost} onDelete={onDeletePost} onBlock={onBlockPost} onMonitor={onMonitorPost} searchQuery={postSearchQuery} onSearchChange={onPostSearchChange} isAdmin={isAdmin} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                currentUser={currentUser} 
            />
            <Header 
                currentUser={currentUser} 
                onLogout={onLogout} 
                isSidebarCollapsed={isSidebarCollapsed} 
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className={`p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out mt-16 ${isSidebarCollapsed ? 'ml-0' : 'ml-64'}`}>
                {renderContent()}
            </main>
            
            <div className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-0' : 'ml-64'}`}>
                 <Footer />
            </div>
        </div>
    );
};

export default Dashboard;