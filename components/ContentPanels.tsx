
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Company, ServicePost, MonitoringEvent, AlertaVigiaConfig } from '../types';
import { Page, EventType, EventStatus } from '../types';
import {
    PlusIcon, EditIcon, LockIcon, TrashIcon, EyeIcon, CheckCircle, XCircle, ShieldCheckIcon,
    BuildingOfficeIcon, SearchIcon, EyeOffIcon, PlayIcon, StopIcon, ExclamationTriangleIcon, XIcon,
    MonitorIcon,
    FileTextIcon,
    UploadCloud,
    MailIcon,
    WhatsAppIcon, // Added WhatsAppIcon
    ZapIcon
} from './Icons';
import { Modal } from './Modals';
import { supabase } from '../supabaseClient';
import { Device } from '@capacitor/device';

// A simple reusable card component for KPIs
const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-5 flex items-center">
        <div className="bg-blue-600/30 text-blue-400 rounded-lg p-3 mr-4">
            {icon}
        </div>
        <div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{title}</div>
        </div>
    </div>
);

// A reusable header for each content panel
const ContentHeader: React.FC<{ title: Page; buttonLabel?: string; onButtonClick?: () => void; children?: React.ReactNode }> = ({ title, buttonLabel, onButtonClick, children }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <div className="flex items-center gap-4 self-end sm:self-auto">
            {children}
            {buttonLabel && onButtonClick && (
                <button onClick={onButtonClick} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    {buttonLabel}
                </button>
            )}
        </div>
    </div>
);

// Reusable chip helpers
const getStatusChip = (status: EventStatus) => {
    return status === EventStatus.Unresolved
        ? <span className="px-3 py-1 text-xs font-semibold text-white bg-red-700 rounded-full flex items-center gap-1.5 w-fit"><XCircle className="w-4 h-4" />{status}</span>
        : <span className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full flex items-center gap-1.5 w-fit"><CheckCircle className="w-4 h-4" />{status}</span>;
};

const getEventTypeChip = (type: EventType | string) => {
    const baseClass = "px-2 py-1 text-xs font-medium rounded-full";
    switch (type) {
        case EventType.PanicButton:
            return <span className={`${baseClass} bg-red-900 text-red-200 animate-pulse`}>{type}</span>;
        case EventType.VigilantFailure:
            return <span className={`${baseClass} bg-yellow-700 text-yellow-200`}>{type}</span>;
        case EventType.GatehouseOnline:
            return <span className={`${baseClass} bg-green-700 text-green-200`}>{type}</span>;
        case EventType.GatehouseOffline:
            return <span className={`${baseClass} bg-amber-700 text-amber-200`}>{type}</span>;
        case EventType.LocalSemInternet:
            return <span className={`${baseClass} bg-orange-700 text-orange-200`}>{type}</span>;
        case EventType.SystemActivated:
            return <span className={`${baseClass} bg-sky-700 text-sky-200`}>{type}</span>;
        case EventType.SystemDeactivated:
            return <span className={`${baseClass} bg-slate-700 text-slate-200`}>{type}</span>;
        default:
            return <span className={`${baseClass} bg-gray-600 text-gray-200`}>{type}</span>;
    }
}

const LiveClock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-end justify-center px-4 py-1.5 bg-gray-800/60 border border-gray-700 rounded-lg shadow-sm">
            <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Tempo Real</span>
            </div>
            <span className="text-xl font-mono font-bold text-blue-400 leading-tight">
                {currentTime.toLocaleTimeString('pt-BR')}
            </span>
        </div>
    );
};

export const DashboardContent: React.FC<{
    companies: Company[];
    posts: ServicePost[];
    onEdit: (c: Company) => void;
    onDelete: (c: Company) => void;
    onBlock: (c: Company) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onOpenTestEmailModal: () => void;
}> = ({ companies, posts, onEdit, onDelete, onBlock, searchQuery, onSearchChange, onOpenTestEmailModal }) => {
    const [visiblePasswordId, setVisiblePasswordId] = useState<number | null>(null);
    return (
        <>
            <ContentHeader title={Page.Dashboard}>
                <button
                    onClick={onOpenTestEmailModal}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <MailIcon className="w-5 h-5" />
                    Enviar Email Teste
                </button>
            </ContentHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <KpiCard title="Empresas Registradas" value={companies.length} icon={<BuildingOfficeIcon className="w-8 h-8" />} />
                <KpiCard title="Postos de Serviço" value={posts.length} icon={<ShieldCheckIcon className="w-8 h-8" />} />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Gerenciamento de Empresas</h2>
                    <div className="relative w-full md:w-auto md:min-w-[300px]">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                            placeholder="Buscar por nome, CNPJ, email..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Empresa</th>
                                <th scope="col" className="px-6 py-3">CNPJ</th>
                                <th scope="col" className="px-6 py-3">Contato</th>
                                <th scope="col" className="px-6 py-3">Usuário/Senha</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Postos</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company.id} className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${company.blocked ? 'bg-red-900/40 opacity-80' : ''}`}>
                                    <td className="px-6 py-4">{company.id}</td>
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                        <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-full object-cover" />
                                        {company.name}
                                    </td>
                                    <td className="px-6 py-4">{company.cnpj}</td>
                                    <td className="px-6 py-4">
                                        <div>{company.email}</div>
                                        <div className="text-xs text-gray-400">{company.whatsapp}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{company.username}</div>
                                        <div className="flex items-center gap-2">
                                            <span>{visiblePasswordId === company.id ? company.password : '••••••••'}</span>
                                            <button onClick={() => setVisiblePasswordId(visiblePasswordId === company.id ? null : company.id)} className="text-gray-400 hover:text-white">
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 w-fit ${company.blocked
                                            ? 'bg-red-600/50 text-red-200'
                                            : 'bg-green-600/50 text-green-200'
                                            }`}>
                                            <span className={`h-2 w-2 rounded-full ${company.blocked ? 'bg-red-400' : 'bg-green-400'}`}></span>
                                            {company.blocked ? 'Bloqueado' : 'Ativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">{company.postCount}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-3">
                                            <button onClick={() => onEdit(company)} className="text-blue-400 hover:text-blue-300" title="Editar"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => onBlock(company)} className={company.blocked ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} title={company.blocked ? 'Desbloquear' : 'Bloquear'}>
                                                <LockIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => onDelete(company)} className="text-red-400 hover:text-red-300" title="Deletar"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export const ServicePostsContent: React.FC<{
    posts: ServicePost[];
    onAddPost: () => void;
    onEdit: (p: ServicePost) => void;
    onDelete: (p: ServicePost) => void;
    onBlock: (p: ServicePost) => void;
    onMonitor: (p: ServicePost) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isAdmin: boolean;
}> = ({ posts, onAddPost, onEdit, onDelete, onBlock, onMonitor, searchQuery, onSearchChange, isAdmin }) => {
    const [visiblePasswordId, setVisiblePasswordId] = useState<number | null>(null);
    const [visibleWhatsappId, setVisibleWhatsappId] = useState<number | null>(null);
    return (
        <>
            <ContentHeader title={Page.ServicePosts} buttonLabel="Registrar Posto" onButtonClick={onAddPost} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <KpiCard title="Total de Postos Registrados" value={posts.length} icon={<ShieldCheckIcon className="w-8 h-8" />} />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Gerenciamento de Postos de Serviço</h2>
                    <div className="relative w-full md:w-auto md:min-w-[300px]">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                            placeholder="Buscar por nome, local ou empresa..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Empresa</th>
                                <th scope="col" className="px-6 py-3">Nome do Posto</th>
                                <th scope="col" className="px-6 py-3">Localização</th>
                                <th scope="col" className="px-6 py-3">Senha</th>
                                <th scope="col" className="px-6 py-3">WhatsApp</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${post.blocked ? 'bg-yellow-900/40 opacity-80' : ''}`}>
                                    <td className="px-6 py-4">{post.id}</td>
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                        <img src={post.companyLogo} alt={post.companyName} className="w-10 h-10 rounded-full object-cover" />
                                        {post.companyName}
                                    </td>
                                    <td className="px-6 py-4">{post.name}</td>
                                    <td className="px-6 py-4">{post.location}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-300">
                                                {visibleWhatsappId === post.id ? (post.whatsapp || 'Não informado') : '••••••••'}
                                            </span>
                                            <button
                                                onClick={() => setVisibleWhatsappId(visibleWhatsappId === post.id ? null : post.id)}
                                                className={`transition-colors ${visibleWhatsappId === post.id ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                                                title="Ver WhatsApp"
                                            >
                                                <WhatsAppIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => onMonitor(post)} className="text-teal-400 hover:text-teal-300" title="Configurar Alerta"><MonitorIcon className="w-5 h-5" /></button>
                                            <button onClick={() => onEdit(post)} className="text-blue-400 hover:text-blue-300" title="Editar"><EditIcon className="w-5 h-5" /></button>
                                            {isAdmin && (
                                                <button onClick={() => onBlock(post)} className={post.blocked ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'} title={post.blocked ? 'Desbloquear' : 'Bloquear'}>
                                                    <LockIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button onClick={() => onDelete(post)} className="text-red-400 hover:text-red-300" title="Deletar"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export const MonitoringContent: React.FC<{
    events: MonitoringEvent[],
    onToggleStatus: (id: number) => void,
    onAddComment: (event: MonitoringEvent) => void,
    hiddenEventIds: Set<number>,
    onHideEvents: (idsToHide: Set<number>) => void,
    onRestoreHiddenEvents: () => void,
}> = ({ events, onToggleStatus, onAddComment, hiddenEventIds, onHideEvents, onRestoreHiddenEvents }) => {

    const [selectedEventIds, setSelectedEventIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const unresolvedEvents = events.filter(e => e.status === EventStatus.Unresolved).length;
    const resolvedEvents = events.filter(e => e.status === EventStatus.Resolved).length;

    const visibleEvents = useMemo(() =>
        events.filter(event => {
            if (hiddenEventIds.has(event.id)) {
                return false;
            }
            const searchLower = searchQuery.toLowerCase().trim();
            if (!searchLower) {
                return true;
            }
            return (
                event.postId.toString().includes(searchLower) ||
                event.postName.toLowerCase().includes(searchLower)
            );
        }),
        [events, hiddenEventIds, searchQuery]
    );

    const resolvedEventIdsInView = useMemo(() =>
        visibleEvents.filter(e => e.status === EventStatus.Resolved).map(e => e.id),
        [visibleEvents]
    );

    const isAllResolvedSelected = resolvedEventIdsInView.length > 0 && resolvedEventIdsInView.every(id => selectedEventIds.has(id));

    const handleSelectAllClick = () => {
        const newSelectedIds = new Set(selectedEventIds);
        if (isAllResolvedSelected) {
            resolvedEventIdsInView.forEach(id => newSelectedIds.delete(id));
        } else {
            resolvedEventIdsInView.forEach(id => newSelectedIds.add(id));
        }
        setSelectedEventIds(newSelectedIds);
    };

    const handleCheckboxChange = (eventId: number) => {
        const newSelectedIds = new Set(selectedEventIds);
        if (newSelectedIds.has(eventId)) {
            newSelectedIds.delete(eventId);
        } else {
            newSelectedIds.add(eventId);
        }
        setSelectedEventIds(newSelectedIds);
    };

    const handleClearClick = () => {
        onHideEvents(selectedEventIds);
        setSelectedEventIds(new Set());
    };

    return (
        <>
            <ContentHeader title={Page.Monitoring}>
                <LiveClock />
            </ContentHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <KpiCard title="Eventos Não Resolvidos" value={unresolvedEvents} icon={<XCircle className="w-8 h-8 text-red-400" />} />
                <KpiCard title="Eventos Resolvidos" value={resolvedEvents} icon={<CheckCircle className="w-8 h-8 text-green-400" />} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <button
                        onClick={onRestoreHiddenEvents}
                        disabled={hiddenEventIds.size === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors h-full"
                    >
                        Restaurar Visão
                    </button>
                    <button
                        onClick={handleClearClick}
                        disabled={selectedEventIds.size === 0}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors h-full"
                    >
                        {selectedEventIds.size > 0 ? `Limpar ${selectedEventIds.size} Selecionado(s)` : 'Limpar Selecionados'}
                    </button>
                </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Eventos</h2>
                    <div className="relative w-full md:w-auto md:min-w-[300px]">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                            placeholder="Buscar por ID do Posto ou Nome..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input
                                            id="checkbox-all-events"
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                                            checked={isAllResolvedSelected}
                                            onChange={handleSelectAllClick}
                                            disabled={resolvedEventIdsInView.length === 0}
                                        />
                                        <label htmlFor="checkbox-all-events" className="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3">ID DO EVENTO</th>
                                <th scope="col" className="px-6 py-3">ID DO POSTO</th>
                                <th scope="col" className="px-6 py-3">Posto de Serviço</th>
                                <th scope="col" className="px-6 py-3">Evento</th>
                                <th scope="col" className="px-6 py-3">Data/Hora</th>
                                <th scope="col" className="px-6 py-3">Comentário</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleEvents.map(event => (
                                <tr key={event.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input
                                                id={`checkbox-event-${event.id}`}
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                disabled={event.status !== EventStatus.Resolved}
                                                checked={selectedEventIds.has(event.id)}
                                                onChange={() => handleCheckboxChange(event.id)}
                                            />
                                            <label htmlFor={`checkbox-event-${event.id}`} className="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{event.id}</td>
                                    <td className="px-6 py-4">{event.postId}</td>
                                    <td className="px-6 py-4 font-medium text-white">{event.postName}</td>
                                    <td className="px-6 py-4">{getEventTypeChip(event.type)}</td>
                                    <td className="px-6 py-4">{event.timestamp.toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <p className="truncate" title={event.comment}>
                                            {event.comment || <span className="text-gray-500 italic">Nenhum</span>}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">{getStatusChip(event.status)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={() => onToggleStatus(event.id)} className="font-medium text-blue-400 hover:underline">
                                                {event.status === EventStatus.Unresolved ? 'Resolver' : 'Reabrir'}
                                            </button>
                                            <button onClick={() => onAddComment(event)} title="Adicionar Comentário" className="text-gray-400 hover:text-white">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export const AlertaVigiaContent: React.FC<{
    onSendAction: (postId: string, password: string) => Promise<string | true>;
}> = ({ onSendAction }) => {
    const [postId, setPostId] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Carrega credenciais salvas ao montar o componente (Compatível com APK v1)
    useEffect(() => {
        const savedCreds = localStorage.getItem('vigia_creds');
        if (savedCreds) {
            try {
                const { postId, password } = JSON.parse(savedCreds);
                if (postId && password) {
                    setPostId(postId.toString());
                    setPassword(password);
                    setRemember(true);
                }
            } catch (e) {
                console.error("Erro ao carregar credenciais salvas:", e);
                localStorage.removeItem('vigia_creds');
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const result = await onSendAction(postId, password);
        if (typeof result === 'string') {
            setError(result);
        } else {
            // Se o login for sucesso e o 'lembrar' estiver marcado, salva no formato do APK
            if (remember) {
                localStorage.setItem('vigia_creds', JSON.stringify({ postId, password }));
            } else {
                localStorage.removeItem('vigia_creds');
            }
        }
    };

    return (
        <>
            <ContentHeader title={Page.AlertaVigia} />
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <EyeIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-white">Alerta Vigia Digital</h2>
                    <p className="text-gray-300">Insira as credenciais do posto para iniciar o monitoramento.</p>
                </div>

                <form id="alert-vigia-form" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="post-id" className="block mb-2 text-sm font-medium text-slate-300">ID do Posto</label>
                            <input
                                id="post-id"
                                value={postId}
                                onChange={(e) => setPostId(e.target.value)}
                                className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                placeholder="Ex: 1010"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="post-password" className="block mb-2 text-sm font-medium text-slate-300">Senha do Posto</label>
                            <div className="relative">
                                <input
                                    id="post-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
                                    placeholder="••••••"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white">
                                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Novo Checkbox de Salvar Credenciais */}
                        <div className="flex items-center">
                            <input
                                id="remember-vigia"
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4 h-4 border-slate-600 rounded bg-slate-700 focus:ring-blue-600 ring-offset-slate-800"
                            />
                            <label htmlFor="remember-vigia" className="ml-2 text-sm font-medium text-slate-300">
                                Salvar ID e Senha neste dispositivo
                            </label>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center pt-4">
                            {error}
                        </p>
                    )}

                    <div className="mt-6">
                        <button type="submit" form="alert-vigia-form" className="w-full py-3 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors flex items-center justify-center gap-2">
                            <ShieldCheckIcon className="w-6 h-6" />
                            Iniciar Monitoramento
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export const AlertaVigiaActiveScreen: React.FC<{
    post: ServicePost;
    config: AlertaVigiaConfig;
    failures: number;
    onConfirmPresence: (postId: number) => void;
    onPanic: () => void;
    onExit: () => void;
    onCreateSystemEvent: (postId: number, type: EventType) => void;
    onIncrementFailure: (postId: number) => void;
}> = ({ post, config, failures, onConfirmPresence, onPanic, onExit, onCreateSystemEvent, onIncrementFailure }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isActive, setIsActive] = useState(false);
    const progressDurationSeconds = config.progressDurationMinutes * 60;
    const [remainingTime, setRemainingTime] = useState(progressDurationSeconds);
    const [isCharging, setIsCharging] = useState<boolean | null>(null); // State for visual indicator
    const prevIsActiveRef = useRef<boolean>();
    const audioRef = useRef<HTMLAudioElement>(null);
    const DEFAULT_SOUND_URL = 'https://hrubgwggnnxyqeomhhyc.supabase.co/storage/v1/object/public/sons_alerta/Alarme.mp3';

    // Timer for the clock
    useEffect(() => {
        const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(clockTimer);
    }, []);

    // Effect to control audio playback based on remaining time
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Ensure audio source is set, falling back to default if not in localStorage.
        if (!audio.src) {
            const savedSoundData = localStorage.getItem('alertaVigiaSound');
            audio.src = savedSoundData || DEFAULT_SOUND_URL;
            if (!savedSoundData) {
                console.log("Nenhum som de alerta personalizado encontrado. Usando som padrão.");
            }
        }

        const shouldPlay = isActive && remainingTime > 0 && remainingTime <= config.alertSoundSeconds;

        if (shouldPlay) {
            if (audio.paused) {
                audio.loop = true;
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error("Erro ao tocar o som de alerta (reprodução automática pode ser bloqueada pelo navegador):", error);
                        }
                    });
                }
            }
        } else {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
                audio.loop = false;
            }
        }
    }, [isActive, remainingTime, config.alertSoundSeconds]);


    // Effect to determine if the system should be active based on schedule
    useEffect(() => {
        const [activationHours, activationMinutes] = config.activationTime.split(':').map(Number);
        const [deactivationHours, deactivationMinutes] = config.deactivationTime.split(':').map(Number);

        const now = currentTime;
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        const activationTotalMinutes = activationHours * 60 + activationMinutes;
        const deactivationTotalMinutes = deactivationHours * 60 + deactivationMinutes;

        let shouldBeActive = false;
        if (activationTotalMinutes > deactivationTotalMinutes) { // Overnight schedule
            if (currentTotalMinutes >= activationTotalMinutes || currentTotalMinutes < deactivationTotalMinutes) {
                shouldBeActive = true;
            }
        } else { // Same-day schedule
            if (currentTotalMinutes >= activationTotalMinutes && currentTotalMinutes < deactivationTotalMinutes) {
                shouldBeActive = true;
            }
        }

        setIsActive(shouldBeActive);
    }, [currentTime, config.activationTime, config.deactivationTime]);

    // Effect to log activation/deactivation events on state change
    useEffect(() => {
        const prevIsActive = prevIsActiveRef.current;

        if (prevIsActive === undefined) {
            prevIsActiveRef.current = isActive;
            return;
        }

        // Função assíncrona para verificar e criar eventos
        const handleActivationChange = async () => {
            if (!prevIsActive && isActive) {
                // PROTEÇÃO ANTI-DUPLICAÇÃO: Verificar se já existe evento "Sistema Ativado" recente
                // Calcula janela de tempo: últimos 30 minutos a partir do horário de ativação programado
                const [activationHours, activationMinutes] = config.activationTime.split(':').map(Number);
                const now = new Date();

                // Cria referência do horário de ativação programado para hoje
                const activationRef = new Date(now);
                activationRef.setHours(activationHours, activationMinutes, 0, 0);

                // Se já passou do horário de ativação, considera o horário de hoje
                // Se ainda não chegou, considera o horário de ontem (caso overnight)
                if (now.getHours() * 60 + now.getMinutes() < activationHours * 60 + activationMinutes) {
                    // Ainda não chegou no horário de ativação de hoje, pode ser turno overnight de ontem
                    activationRef.setDate(activationRef.getDate() - 1);
                }

                // Define janela de busca: 30 minutos antes do horário de ativação até agora
                const searchWindowStart = new Date(activationRef.getTime() - 30 * 60 * 1000); // 30 min antes

                console.log(`[ANTI-DUP] Verificando eventos "Sistema Ativado" para posto ${post.id} desde ${searchWindowStart.toLocaleString('pt-BR')}`);

                // Busca no banco se já existe evento "Sistema Ativado" nesta janela de tempo
                const { data: recentEvents, error } = await supabase
                    .from('monitoring_events')
                    .select('id, timestamp, type')
                    .eq('post_id', post.id)
                    .eq('type', EventType.SystemActivated)
                    .gte('timestamp', searchWindowStart.toISOString())
                    .order('timestamp', { ascending: false })
                    .limit(1);

                if (error) {
                    console.error('[ANTI-DUP] Erro ao verificar eventos recentes:', error.message);
                    // Em caso de erro, cria o evento mesmo assim (fail-safe)
                    onCreateSystemEvent(post.id, EventType.SystemActivated);
                    return;
                }

                if (recentEvents && recentEvents.length > 0) {
                    const lastEvent = recentEvents[0];
                    const lastEventTime = new Date(lastEvent.timestamp);
                    console.log(`[ANTI-DUP] ⚠️ Evento "Sistema Ativado" JÁ EXISTE para posto ${post.id} às ${lastEventTime.toLocaleString('pt-BR')}. Bloqueando duplicação.`);
                    // NÃO cria evento duplicado
                    return;
                }

                // Não existe evento recente, pode criar
                console.log(`[ANTI-DUP] ✅ Nenhum evento "Sistema Ativado" recente encontrado. Criando novo evento para posto ${post.id}.`);
                onCreateSystemEvent(post.id, EventType.SystemActivated);
            }
            else if (prevIsActive && !isActive) {
                // Para desativação, mantém comportamento normal (sem verificação)
                onCreateSystemEvent(post.id, EventType.SystemDeactivated);
            }
        };

        // Executa a função assíncrona
        handleActivationChange();

        prevIsActiveRef.current = isActive;
    }, [isActive, post.id, onCreateSystemEvent, config.activationTime]);

    // Effect to monitor battery/power status
    // Effect to monitor battery/power status (ROBUST: Listener + Polling)
    // STABLE CALLBACKS: Avoid useEffect re-runs when network status changes (isOnline)
    const onCreateSystemEventRef = useRef(onCreateSystemEvent);
    useEffect(() => {
        onCreateSystemEventRef.current = onCreateSystemEvent;
    }, [onCreateSystemEvent]);

    const postIdRef = useRef(post.id);
    useEffect(() => {
        postIdRef.current = post.id;
    }, [post.id]);

    // Effect to monitor battery/power status (ROBUST: Listener + Polling)
    useEffect(() => {
        let isMounted = true;
        let lastKnownState: boolean | null = null;
        let pollingInterval: any = null;

        const handleBatteryChange = (isCharging: boolean) => {
            if (!isMounted) return;

            // Update visual state
            setIsCharging(isCharging);

            // LOGIC: Only trigger event if state CHANGED from what we last knew
            if (lastKnownState !== null && lastKnownState !== isCharging) {
                console.log(`[POWER] Mudança confirmada: ${isCharging ? 'Conectou' : 'Desconectou'}`);

                // Use Ref current value to call event without restarting effect
                if (isCharging) {
                    onCreateSystemEventRef.current(postIdRef.current, EventType.PowerConnected);
                } else {
                    onCreateSystemEventRef.current(postIdRef.current, EventType.PowerDisconnected);
                }
            }
            lastKnownState = isCharging;
        };

        const setupBatteryMonitoring = async () => {
            try {
                // 1. Initial Check
                const info = await Device.getBatteryInfo();
                if (isMounted) {
                    console.log(`[POWER] Inicial: ${info.isCharging ? 'Carregando' : 'Bateria'}`);
                    lastKnownState = info.isCharging || false;
                    setIsCharging(info.isCharging || false);
                }

                // 2. Listener (Realtime)
                await (Device as any).addListener('batteryStatusChange', (status: any) => {
                    console.log(`[POWER LISTENER] Evento recebido: ${status.isCharging}`);
                    handleBatteryChange(status.isCharging || false);
                });

            } catch (error) {
                console.error('[POWER] Erro no setup:', error);
            }
        };

        setupBatteryMonitoring();

        // 3. Polling (Backup a cada 10s sem resetar o listener)
        pollingInterval = setInterval(async () => {
            if (!isMounted) return;
            try {
                const info = await Device.getBatteryInfo();
                const currentCharging = info.isCharging || false;

                // If distinct from internal state, force update
                if (lastKnownState !== currentCharging) {
                    console.log(`[POWER POLLING] Detectou mudança perdida pelo listener!`);
                    handleBatteryChange(currentCharging);
                }
            } catch (err) {
                console.error('[POWER POLLING] Erro:', err);
            }
        }, 10000);

        return () => {
            isMounted = false;
            if (pollingInterval) clearInterval(pollingInterval);
            (Device as any).removeAllListeners();
        };
        // DEPENDENCY ARRAY IS EMPTY (once per mount) or very stable.
        // We use Refs for dynamic data.
    }, []); // <--- EMPTY ARRAY: Runs once on mount, never tears down listeners!

    // Timer for the progress countdown, only runs when system is active
    useEffect(() => {
        if (!isActive) {
            setRemainingTime(progressDurationSeconds);
            return;
        }

        const progressTimer = setInterval(() => {
            setRemainingTime(prevTime => {
                if (prevTime <= 1) {
                    onIncrementFailure(post.id);
                    return progressDurationSeconds;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(progressTimer);
    }, [isActive, onIncrementFailure, progressDurationSeconds, post.id]);


    const handleConfirm = () => {
        // FIX: The onConfirmPresence function expects the post ID as an argument.
        onConfirmPresence(post.id);
        setRemainingTime(progressDurationSeconds);
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.loop = false;
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const progressPercent = (remainingTime / progressDurationSeconds) * 100;

    return (
        <div className="bg-black min-h-screen text-white p-4 sm:p-6 md:p-8 flex flex-col items-center font-sans antialiased">
            <audio ref={audioRef} preload="auto" />
            <button onClick={onExit} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10" title="Sair">
                <XIcon className="w-8 h-8" />
            </button>

            <div className="w-full max-w-md mx-auto">
                {/* Header */}
                <header className="text-center mt-2 mb-2">
                    <img src={post.companyLogo} alt="Logo" className="w-[100px] h-[100px] rounded-full mx-auto mb-2 border-2 border-gray-600 object-cover" />
                    <h1 className="text-2xl sm:text-3xl font-bold">Alerta Vigia</h1>
                    <p className="text-gray-400">Sistema de Monitoramento</p>
                </header>

                {/* Power Status Indicator (Top Left) */}
                <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-colors ${isCharging === true
                    ? 'bg-green-900/40 border-green-500/50 text-green-400'
                    : isCharging === false
                        ? 'bg-red-900/40 border-red-500/50 text-red-400'
                        : 'bg-gray-800/40 border-gray-600/50 text-gray-400'
                    }`}>
                    <ZapIcon className={`w-4 h-4 ${isCharging ? 'fill-current' : ''}`} />
                    <span className="text-xs font-bold uppercase">
                        {isCharging === true ? 'Energia' : isCharging === false ? 'Bateria' : '...'}
                    </span>
                </div>

                {/* Main Card */}
                <main className="bg-[#2b3749] rounded-3xl p-4 space-y-3">
                    {/* Status Badge */}
                    <div className={`rounded-xl p-3 text-center transition-colors ${isActive ? 'bg-green-600/50' : 'bg-red-600/50'}`}>
                        <p className={`text-xl font-black ${isActive ? 'text-green-200' : 'text-red-200'}`}>
                            {isActive ? 'SISTEMA ATIVADO' : 'SISTEMA DESATIVADO'}
                        </p>
                    </div>

                    {/* ID do Posto */}
                    <div className="bg-[#3b5998] rounded-xl p-3 text-center">
                        <p className="text-sm text-blue-200">ID do Posto</p>
                        <p className="text-xl font-black">Post-{post.id}</p>
                    </div>

                    {/* Nome e Hora */}
                    <div className="bg-[#3a475a] rounded-xl p-3 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-400">Nome</p>
                            <p className="font-bold text-sm">{post.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Hora Atual</p>
                            <p className="font-bold text-lg">{currentTime.toLocaleTimeString('pt-BR')}</p>
                        </div>
                    </div>

                    {/* Ativação e Desativação */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#1c4a34] rounded-2xl p-3 text-center">
                            <div className="w-10 h-10 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-1">
                                <PlayIcon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-sm font-bold text-green-200">Ativação</p>
                            <p className="text-2xl font-black">{config.activationTime.substring(0, 5)}</p>
                        </div>
                        <div className="bg-[#5a2a2a] rounded-2xl p-3 text-center">
                            <div className="w-10 h-10 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-1">
                                <StopIcon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-sm font-bold text-red-200">Desativação</p>
                            <p className="text-2xl font-black">{config.deactivationTime.substring(0, 5)}</p>
                        </div>
                    </div>

                    {/* Status do Vigia */}
                    <div>
                        <div className="flex justify-between items-center mb-1 px-1">
                            <h3 className="font-semibold text-sm">Status do Vigia</h3>
                            {isActive && (
                                <span className="text-sm font-mono font-semibold text-blue-300 tabular-nums">
                                    {formatTime(remainingTime)}
                                </span>
                            )}
                        </div>
                        <div className="bg-gray-700 rounded-full h-[20px] overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${isActive ? 'bg-gradient-to-r from-yellow-400 via-cyan-400 to-green-400 ease-linear' : 'bg-gray-500'}`}
                                style={{ width: isActive ? `${progressPercent}%` : '100%' }}
                            ></div>
                        </div>
                    </div>

                    {/* Faltas Registradas */}
                    <div className="bg-[#4a3c3c] rounded-xl p-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-orange-200 text-sm">({EventType.VigilantFailure})</p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold">{failures}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={handleConfirm}
                            disabled={!isActive}
                            className={`w-full font-bold h-[95px] rounded-xl flex items-center justify-center gap-2 text-base sm:text-lg transition-transform active:scale-95 ${isActive ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                        >
                            <CheckCircle className="w-6 h-6" />
                            CONFIRMAR PRESENÇA
                        </button>
                        <button
                            onClick={onPanic}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-[60px] rounded-xl flex items-center justify-center gap-2 text-base sm:text-lg transition-transform active:scale-95"
                        >
                            <ExclamationTriangleIcon className="w-6 h-6" />
                            BOTÃO DE PÂNICO
                        </button>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center mt-6 text-gray-400 text-xs">
                    <p className="flex items-center justify-center gap-2">
                        &copy; {new Date().getFullYear()} DeltaNuvem Tecnologia
                    </p>
                </footer>
            </div>
        </div>
    );
};

const CalendarDatePicker: React.FC<{
    selectedDate: string;
    onDateChange: (date: string) => void;
    highlightedDates: Set<string>;
    onClose: () => void;
}> = ({ selectedDate, onDateChange, highlightedDates, onClose }) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    const [viewDate, setViewDate] = useState(initialDate);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);


    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    const formattedMonthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(viewDate);
    const displayMonthYear = formattedMonthYear.charAt(0).toUpperCase() + formattedMonthYear.slice(1);

    const dayElements = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        dayElements.push(<div key={`pad-start-${i}`} className="w-10 h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSelected = dateStr === selectedDate;
        const hasEvent = highlightedDates.has(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = new Date(year, month, day).getTime() === today.getTime();

        dayElements.push(
            <div key={day} className="relative flex justify-center items-center">
                <button
                    onClick={() => onDateChange(dateStr)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors text-sm font-medium ${isSelected
                        ? 'bg-blue-600 text-white font-bold ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500'
                        : isToday
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-200 hover:bg-slate-700/50'
                        }`}
                >
                    {day}
                </button>
                {hasEvent && !isSelected && (
                    <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                )}
            </div>
        );
    }

    return (
        <div ref={calendarRef} className="absolute top-full mt-2 z-50 left-0 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-2xl w-80">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">&lt;</button>
                <div className="font-bold text-white text-base">
                    {displayMonthYear}
                </div>
                <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
                {dayNames.map((day, i) => <div key={i} className="w-10 h-10 flex items-center justify-center">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
                {dayElements}
            </div>
        </div>
    );
};


export const ReportsContent: React.FC<{ events: MonitoringEvent[]; posts: ServicePost[]; currentUser: Company; onDeleteEvents: (ids: number[]) => void }> = ({ events, posts, currentUser, onDeleteEvents }) => {
    const [selectedPostId, setSelectedPostId] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    const eventDates = useMemo(() => {
        const dates = new Set<string>();
        events.forEach(event => {
            const d = event.timestamp;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.add(`${year}-${month}-${day}`);
        });
        return dates;
    }, [events]);

    // Filter events based on criteria
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesPost = selectedPostId === 'all' || event.postId.toString() === selectedPostId;

            let matchesDate = true;
            if (startDate) {
                const start = new Date(startDate);
                start.setUTCHours(0, 0, 0, 0);
                matchesDate = matchesDate && event.timestamp >= start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                matchesDate = matchesDate && event.timestamp <= end;
            }

            const searchLower = searchQuery.toLowerCase().trim();
            const matchesSearch = !searchLower ||
                event.id.toString().includes(searchLower) ||
                event.postName.toLowerCase().includes(searchLower) ||
                event.type.toLowerCase().includes(searchLower);

            return matchesPost && matchesDate && matchesSearch;
        });
    }, [events, selectedPostId, startDate, endDate, searchQuery]);

    const [selectedEventIds, setSelectedEventIds] = useState<Set<number>>(new Set());

    const handleReportCheckbox = (id: number) => {
        const next = new Set(selectedEventIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedEventIds(next);
    };

    const handleSelectAllReport = (checked: boolean) => {
        if (checked) setSelectedEventIds(new Set(filteredEvents.map(e => e.id)));
        else setSelectedEventIds(new Set());
    };

    const handleDeleteSelected = () => {
        if (selectedEventIds.size === 0) return;
        onDeleteEvents(Array.from(selectedEventIds));
        setSelectedEventIds(new Set());
    };

    const generatePDF = async () => {
        const doc = new (window as any).jsPDF();

        const getCircularImage = (image: HTMLImageElement): string => {
            const canvasSize = 200;
            const canvas = document.createElement('canvas');
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return image.src;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Add a subtle shadow for better anti-aliasing effect
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Draw the outer circle (the shape for the image)
            ctx.beginPath();
            ctx.arc(canvasSize / 2, canvasSize / 2, (canvasSize / 2) - 2, 0, Math.PI * 2, true); // a bit smaller for border
            ctx.closePath();
            ctx.fillStyle = '#fff';
            ctx.fill();

            // Add a thin stroke for definition
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Reset shadow before drawing the image
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.globalCompositeOperation = 'source-in';

            const aspect = image.width / image.height;
            let drawWidth, drawHeight, x, y;

            if (image.width > image.height) {
                drawHeight = canvasSize;
                drawWidth = canvasSize * aspect;
                x = (canvasSize - drawWidth) / 2;
                y = 0;
            } else {
                drawWidth = canvasSize;
                drawHeight = canvasSize / aspect;
                x = 0;
                y = (canvasSize - drawHeight) / 2;
            }

            ctx.drawImage(image, x, y, drawWidth, drawHeight);

            return canvas.toDataURL('image/png');
        };

        // 1. Add Company Logo
        const logoUrl = currentUser.logo;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = logoUrl;

        try {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const circularLogoDataUrl = getCircularImage(img);
            doc.addImage(circularLogoDataUrl, 'PNG', 14, 10, 20, 20);

        } catch (e) {
            console.error("Error loading logo for PDF", e);
            // Fallback if image fails
            doc.setFontSize(10);
            doc.text("[Logo]", 14, 20);
        }

        // 2. Header Text
        doc.setFontSize(22);
        doc.setTextColor(33, 33, 33);
        doc.text("Relatório de Eventos", 50, 20);

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(currentUser.name, 50, 28);

        // 3. Metadata line
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const postName = selectedPostId === 'all' ? 'Todos os Postos' : posts.find(p => p.id.toString() === selectedPostId)?.name || 'Posto Desconhecido';
        const dateStr = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
        const periodStr = `Período: ${startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Início'} a ${endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Agora'}`;

        doc.text(`Posto: ${postName}`, 14, 45);
        doc.text(periodStr, 14, 50);
        doc.text(dateStr, 150, 45);

        // 4. Table
        const tableColumn = ["Posto", "Evento", "Data/Hora", "Comentário", "Status"];
        const tableRows: any[] = [];

        filteredEvents.forEach(event => {
            const eventData = [
                event.postName,
                event.type,
                event.timestamp.toLocaleString('pt-BR'),
                event.comment || 'Nenhum',
                event.status
            ];
            tableRows.push(eventData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235], // Blue #2563eb as requested
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            }
        });

        doc.save(`relatorio_eventos_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <>
            <ContentHeader title={Page.Reports} />
            <div className="relative z-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Posto de Serviço</label>
                        <select
                            value={selectedPostId}
                            onChange={(e) => setSelectedPostId(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"
                        >
                            <option value="all">Todos os Postos</option>
                            {posts.map(post => (
                                <option key={post.id} value={post.id}>{post.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <label className="block mb-2 text-sm font-medium text-gray-300">Data Inicial</label>
                        <button
                            onClick={() => { setShowStartCalendar(!showStartCalendar); setShowEndCalendar(false); }}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 text-left"
                        >
                            {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Selecione uma data'}
                        </button>
                        {showStartCalendar && (
                            <CalendarDatePicker
                                selectedDate={startDate}
                                onDateChange={(date) => { setStartDate(date); setShowStartCalendar(false); }}
                                highlightedDates={eventDates}
                                onClose={() => setShowStartCalendar(false)}
                            />
                        )}
                    </div>
                    <div className="relative">
                        <label className="block mb-2 text-sm font-medium text-gray-300">Data Final</label>
                        <button
                            onClick={() => { setShowEndCalendar(!showEndCalendar); setShowStartCalendar(false); }}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 text-left"
                        >
                            {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Selecione uma data'}
                        </button>
                        {showEndCalendar && (
                            <CalendarDatePicker
                                selectedDate={endDate}
                                onDateChange={(date) => { setEndDate(date); setShowEndCalendar(false); }}
                                highlightedDates={eventDates}
                                onClose={() => setShowEndCalendar(false)}
                            />
                        )}
                    </div>
                    <div>
                        <button
                            onClick={generatePDF}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <FileTextIcon className="w-5 h-5" />
                            Gerar PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="reports-search" className="block mb-2 text-sm font-medium text-gray-300">Buscar por ID, Posto ou Evento</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="reports-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        placeholder="ID, Posto ou Tipo de Evento"
                    />
                </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Relatório de Eventos ({filteredEvents.length} eventos)</h3>
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selectedEventIds.size === 0}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900/40 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        <TrashIcon className="w-4 h-4" />
                        {selectedEventIds.size > 0 ? `Deletar ${selectedEventIds.size} Selecionado(s)` : 'Deletar Selecionados'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                                        checked={filteredEvents.length > 0 && filteredEvents.every(e => selectedEventIds.has(e.id))}
                                        onChange={e => handleSelectAllReport(e.target.checked)}
                                        disabled={filteredEvents.length === 0}
                                    />
                                </th>
                                <th className="px-6 py-3">ID Evento</th>
                                <th className="px-6 py-3">Data/Hora</th>
                                <th className="px-6 py-3">Posto</th>
                                <th className="px-6 py-3">Evento</th>
                                <th className="px-6 py-3">Comentário</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map(event => (
                                <tr key={event.id} className={`border-b border-gray-700 hover:bg-gray-700/30 transition-colors ${selectedEventIds.has(event.id) ? 'bg-blue-600/10' : ''}`}>
                                    <td className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                                            checked={selectedEventIds.has(event.id)}
                                            onChange={() => handleReportCheckbox(event.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{event.id}</td>
                                    <td className="px-6 py-4">{event.timestamp.toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4">{event.postName}</td>
                                    <td className="px-6 py-4">{getEventTypeChip(event.type)}</td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <p className="truncate" title={event.comment}>
                                            {event.comment || <span className="text-gray-500 italic">Nenhum</span>}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">{getStatusChip(event.status)}</td>
                                </tr>
                            ))}

                            {filteredEvents.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        Nenhum evento encontrado para os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};