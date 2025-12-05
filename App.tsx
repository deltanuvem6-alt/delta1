import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Company, ServicePost, MonitoringEvent, AlertaVigiaConfig, OfflineEvent } from './types';
import { EventType, EventStatus } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { AlertaVigiaActiveScreen, AlertaVigiaContent } from './components/ContentPanels';
import { LoginModal, RegisterModal, ConfirmationModal, EditCompanyModal, InfoModal, AddPostModal, EditPostModal, CommentModal, TestEmailModal } from './components/Modals';
import AlertaVigiaConfigPage from './components/AlertaVigiaConfigPage';
import { ArrowLeftIcon, ExclamationTriangleIcon } from './components/Icons';
import { supabase } from './supabaseClient';
import { sendEmail } from './services/emailService';
import { sendEventNotification, sendAdminNotification, sendCompanyNotification } from './services/notificationService';

const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 seconds
const HEARTBEAT_THRESHOLD_SECONDS = 45; // 45 seconds tolerance

function App() {
    // Global State
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<Company | null>(null);
    const [demoMode, setDemoMode] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Data State
    const [companies, setCompanies] = useState<Company[]>([]);
    const [posts, setPosts] = useState<ServicePost[]>([]);
    const [events, setEvents] = useState<MonitoringEvent[]>([]);
    const [postFailures, setPostFailures] = useState<Record<number, number>>({});
    const [alertaVigiaConfigs, setAlertaVigiaConfigs] = useState<Record<number, AlertaVigiaConfig>>({});

    const [postSearchQuery, setPostSearchQuery] = useState('');
    const [companySearchQuery, setCompanySearchQuery] = useState('');
    const [activeVigiaPost, setActiveVigiaPost] = useState<ServicePost | null>(null);

    // Modal State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
    const [showEditPostModal, setShowEditPostModal] = useState(false);
    const [showAddPostModal, setShowAddPostModal] = useState(false);
    const [showTestEmailModal, setShowTestEmailModal] = useState(false);
    const [showRegistrationSuccessModal, setShowRegistrationSuccessModal] = useState(false);
    const [infoModal, setInfoModal] = useState<{ title: string; message: string | React.ReactNode; isOpen: boolean; autoCloseDelay?: number; }>({ title: '', message: '', isOpen: false });
    const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
    const [showPanicSuccessModal, setShowPanicSuccessModal] = useState(false);
    const [showConfigSaveSuccess, setShowConfigSaveSuccess] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [eventForComment, setEventForComment] = useState<MonitoringEvent | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [selectedPost, setSelectedPost] = useState<ServicePost | null>(null);
    const [hiddenEventIds, setHiddenEventIds] = useState<Set<number>>(() => {
        try {
            const item = window.localStorage.getItem('hiddenEventIds');
            const ids = item ? JSON.parse(item) : [];
            return new Set(ids);
        } catch (error) {
            console.error("Error reading hiddenEventIds from localStorage", error);
            return new Set();
        }
    });
    const [confirmation, setConfirmation] = useState<{
        type: 'company' | 'post' | 'panic_button' | 'reset_failures';
        action: 'block' | 'delete';
        data: Company | ServicePost;
        title: string;
        message: string;
        confirmButtonClass?: string;
    } | null>(null);

    // New state for config page
    const [showAlertaVigiaConfig, setShowAlertaVigiaConfig] = useState(false);
    const [selectedPostForConfig, setSelectedPostForConfig] = useState<ServicePost | null>(null);

    const newEventSoundRef = useRef<HTMLAudioElement>(null);

    // Refs to hold current state for use inside event listeners/subscriptions
    const currentUserRef = useRef<Company | null>(null);
    const postsRef = useRef<ServicePost[]>([]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        postsRef.current = posts;
    }, [posts]);

    // --- OFFLINE FUNCTIONALITY ---
    const processOfflineQueue = useCallback(async () => {
        const queueJson = localStorage.getItem('offlineEventQueue');
        if (!queueJson) return;

        const queue: OfflineEvent[] = JSON.parse(queueJson);
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} offline events.`);

        const eventsToInsert = queue.map(e => ({
            post_id: e.postId,
            type: e.type,
            timestamp: e.timestamp,
            status: EventStatus.Unresolved
        }));

        const { error: insertError } = await supabase.from('monitoring_events').insert(eventsToInsert);

        if (insertError) {
            console.error("Failed to sync offline events:", insertError.message);
            setInfoModal({
                isOpen: true,
                title: 'Falha na Sincronização',
                message: `Não foi possível enviar os eventos offline. Eles permanecerão salvos para uma nova tentativa. Erro: ${insertError.message}`
            });
            return;
        }

        // Events inserted successfully, clear the queue immediately to prevent duplicates
        localStorage.removeItem('offlineEventQueue');

        const failureCountsByPost: { [key: number]: number } = {};
        queue.forEach(event => {
            if (event.type === EventType.VigilantFailure) {
                failureCountsByPost[event.postId] = (failureCountsByPost[event.postId] || 0) + 1;
            }
        });

        let failureSyncError = false;
        for (const postIdStr in failureCountsByPost) {
            const postId = parseInt(postIdStr, 10);
            const failuresToAdd = failureCountsByPost[postId];

            const { data: currentFailure, error: fetchError } = await supabase
                .from('post_failures')
                .select('count')
                .eq('post_id', postId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error(`Failed to fetch current failure count for post ${postId}:`, fetchError.message);
                failureSyncError = true;
                continue;
            }

            const currentCount = currentFailure?.count || 0;
            const newTotalCount = currentCount + failuresToAdd;

            const { error: upsertError } = await supabase
                .from('post_failures')
                .upsert({ post_id: postId, count: newTotalCount });

            if (upsertError) {
                console.error(`Failed to sync failure count for post ${postId}:`, upsertError.message);
                failureSyncError = true;
            } else {
                setPostFailures(prev => ({ ...prev, [postId]: newTotalCount }));
            }
        }

        if (failureSyncError) {
            setInfoModal({
                isOpen: true,
                title: 'Sincronização Parcial',
                message: 'Os eventos foram enviados, mas houve um erro ao atualizar a contagem de falhas. Por favor, verifique os totais de falhas.',
            });
        } else {
            setInfoModal({
                isOpen: true,
                title: 'Sincronização Completa',
                message: `${queue.length} evento(s) registrado(s) durante o período offline foram enviados com sucesso.`,
                autoCloseDelay: 3000
            });
        }

    }, []);

    useEffect(() => {
        const handleOnline = () => {
            console.log("Connection restored. Checking for offline events.");
            setIsOnline(true);
        };
        const handleOffline = () => {
            console.log("Connection lost. Offline mode activated.");
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOnline) {
            processOfflineQueue();
        }
    }, [isOnline, processOfflineQueue]);

    // Effect for PWA Service Worker registration
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    }, []);

    // --- DATA FETCHING & REALTIME SUBSCRIPTION ---

    // Effect for initial data fetching
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setFetchError(null);

            const { data: companiesData, error: companiesError } = await supabase.from('companies').select('*').order('id');

            if (companiesError) {
                console.error('Error fetching data from Supabase:', companiesError.message);
                const errorMessage = companiesError.message.toLowerCase();

                if (errorMessage.includes('does not exist') || errorMessage.includes('could not find the table')) {
                    setFetchError("As tabelas do banco de dados não foram encontradas. Por favor, acesse o 'SQL Editor' no seu projeto Supabase e execute o script SQL fornecido para criar a estrutura necessária.");
                }
                else if (errorMessage.includes('security policies') || errorMessage.includes('rls')) {
                    setFetchError("Falha ao carregar dados devido às Políticas de Segurança (RLS). Verifique no Supabase se a role 'anon' tem permissão de leitura (SELECT) para a tabela 'companies'.");
                }
                else {
                    setFetchError(`Ocorreu um erro inesperado: ${companiesError.message}`);
                }
                setLoading(false);
                return;
            }

            const [
                postsRes,
                eventsRes,
                failuresRes,
                configsRes,
            ] = await Promise.all([
                supabase.from('service_posts').select('*, companies(logo, name)').order('id'),
                supabase.from('monitoring_events').select('*, service_posts(name)').order('timestamp', { ascending: false }),
                supabase.from('post_failures').select('*'),
                supabase.from('alerta_vigia_configs').select('*')
            ]);

            const fetchErrors = { posts: postsRes.error, events: eventsRes.error, failures: failuresRes.error, configs: configsRes.error, };
            const hasError = Object.values(fetchErrors).some(e => e !== null);

            if (hasError) {
                Object.entries(fetchErrors).forEach(([key, error]) => {
                    if (error) console.error(`Error fetching ${key}:`, error.message);
                });
                setFetchError("Ocorreu um erro ao buscar dados adicionais (postos, eventos, etc). Verifique se todas as tabelas foram criadas corretamente pelo script SQL.");
                setLoading(false);
                return;
            }

            setCompanies(companiesData.map(c => ({ ...c, postCount: c.post_count })));

            if (postsRes.data) {
                const initialPosts = postsRes.data.map((p: any) => ({
                    id: p.id, companyId: p.company_id, name: p.name, location: p.location,
                    blocked: p.blocked, password: p.password,
                    companyLogo: p.companies.logo, companyName: p.companies.name,
                    last_heartbeat: p.last_heartbeat,
                }));
                setPosts(initialPosts);
            }

            if (eventsRes.data) {
                const mappedEvents = eventsRes.data.map((e: any) => ({
                    id: e.id, postId: e.post_id, type: e.type, timestamp: new Date(e.timestamp),
                    status: e.status, comment: e.comment, postName: e.service_posts.name
                }));
                setEvents(mappedEvents);
            }

            if (failuresRes.data) {
                const failuresMap = failuresRes.data.reduce((acc, failure) => {
                    acc[failure.post_id] = failure.count;
                    return acc;
                }, {});
                setPostFailures(failuresMap);
            }

            if (configsRes.data) {
                const configsMap = configsRes.data.reduce((acc, config) => {
                    acc[config.post_id] = {
                        activationTime: config.activation_time,
                        deactivationTime: config.deactivation_time,
                        progressDurationMinutes: config.progress_duration_minutes,
                        alertSoundSeconds: config.alert_sound_seconds,
                    };
                    return acc;
                }, {});
                setAlertaVigiaConfigs(configsMap);
            }

            setLoading(false);
        };

        fetchInitialData();
    }, []);

    // Effect to persist hiddenEventIds to localStorage
    useEffect(() => {
        try {
            window.localStorage.setItem('hiddenEventIds', JSON.stringify(Array.from(hiddenEventIds)));
        } catch (error) {
            console.error("Error saving hiddenEventIds to localStorage", error);
        }
    }, [hiddenEventIds]);

    // Real-time subscription for monitoring events
    useEffect(() => {
        const channel = supabase
            .channel('monitoring_events')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'monitoring_events' },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newRecord = payload.new as any;
                        // The payload doesn't include foreign table data, so we must fetch it.
                        const { data: postData } = await supabase
                            .from('service_posts')
                            .select('name')
                            .eq('id', newRecord.post_id)
                            .single();

                        const newEvent: MonitoringEvent = {
                            id: newRecord.id,
                            postId: newRecord.post_id,
                            postName: postData?.name || 'Post Desconhecido',
                            type: newRecord.type as EventType,
                            timestamp: new Date(newRecord.timestamp),
                            status: newRecord.status as EventStatus,
                            comment: newRecord.comment,
                        };
                        // Prepend the new event, ensuring no duplicates from optimistic updates
                        setEvents(prev => [newEvent, ...prev.filter(e => e.id !== newEvent.id)]);

                        // Sound Logic: Check refs to ensure sound only plays for the right company and only if logged in
                        const user = currentUserRef.current;
                        const currentPosts = postsRef.current;

                        if (user) {
                            const isAdmin = user.username === 'admin';
                            // Check if the event's post belongs to the currently logged-in user's company
                            const belongsToUser = currentPosts.some(p => p.id === newEvent.postId && p.companyId === user.id);

                            // Only play sound if logged in AND (is Admin OR is Owner) AND event is Unresolved
                            if ((isAdmin || belongsToUser) && newEvent.status === EventStatus.Unresolved && newEventSoundRef.current) {
                                newEventSoundRef.current.play().catch(error => {
                                    console.warn("A reprodução do som de alerta falhou.", error);
                                });
                            }
                        }

                    } else if (payload.eventType === 'UPDATE') {
                        const updatedRecord = payload.new as any;
                        setEvents(prev =>
                            prev.map(event =>
                                event.id === updatedRecord.id
                                    ? { ...event, status: updatedRecord.status, comment: updatedRecord.comment, type: updatedRecord.type, timestamp: new Date(updatedRecord.timestamp) }
                                    : event
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        const deletedRecord = payload.old as any;
                        setEvents(prev => prev.filter(event => event.id !== deletedRecord.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Effect for handling page close/hide to log 'Portaria Offline' event
    useEffect(() => {
        const handlePageHide = () => {
            if (activeVigiaPost) {
                // This is a "best effort" attempt. Modern browsers may allow this fetch-based call to complete.
                supabase
                    .from('monitoring_events')
                    .insert([{
                        post_id: activeVigiaPost.id,
                        type: EventType.GatehouseOffline,
                        status: EventStatus.Unresolved
                    }])
                    .then(({ error }) => {
                        if (error) {
                            console.error('Error creating GatehouseOffline event on pagehide:', error.message);
                        }
                    });
            }
        };

        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [activeVigiaPost]);

    // Heartbeat effect for active vigia session
    useEffect(() => {
        if (!activeVigiaPost) {
            return;
        }

        const heartbeat = async () => {
            console.log(`[HEARTBEAT] Sending heartbeat for post ${activeVigiaPost.id} at ${new Date().toLocaleTimeString('pt-BR')}`);
            const { error } = await supabase
                .from('service_posts')
                .update({ last_heartbeat: new Date().toISOString() })
                .eq('id', activeVigiaPost.id);
            if (error) {
                console.error("[HEARTBEAT] Failed:", error.message);
            } else {
                console.log(`[HEARTBEAT] Success for post ${activeVigiaPost.id}`);
            }
        };

        heartbeat(); // Initial heartbeat on login
        const intervalId = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

        return () => {
            clearInterval(intervalId);
        };
    }, [activeVigiaPost]);


    const handleHideEvents = (idsToHide: Set<number>) => {
        setHiddenEventIds(prev => new Set([...prev, ...idsToHide]));
    };

    const handleRestoreHiddenEvents = () => {
        setHiddenEventIds(new Set());
    };

    // --- HELPER FUNCTION TO CREATE ANY EVENT ---
    const createEvent = useCallback(async (postId: number, eventType: EventType): Promise<boolean> => {
        if (!isOnline) {
            console.log(`Offline: Queuing ${eventType} event for post ${postId}`);
            const queue: OfflineEvent[] = JSON.parse(localStorage.getItem('offlineEventQueue') || '[]');
            queue.push({ postId, type: eventType, timestamp: new Date().toISOString() });
            localStorage.setItem('offlineEventQueue', JSON.stringify(queue));
            return true;
        }

        const { data: newEventData, error } = await supabase
            .from('monitoring_events')
            .insert([{ post_id: postId, type: eventType, status: EventStatus.Unresolved }])
            .select()
            .single();

        if (error) {
            console.error(`Failed to create ${eventType} event`, error.message);
            setInfoModal({
                isOpen: true,
                title: 'Erro ao Registrar Evento',
                message: `Não foi possível registrar o evento "${eventType}". Verifique sua conexão ou contate o suporte. Detalhes: ${error.message}`
            });
            return false;
        }

        // EMAIL NOTIFICATION: Send email only from the client that created the event
        try {
            console.log(`🔍 [CREATE EVENT] Novo evento criado: ${eventType}`);

            // Fetch full post and company data for email
            const { data: fullPostData } = await supabase
                .from('service_posts')
                .select('*, companies(*)')
                .eq('id', postId)
                .single();

            if (fullPostData && fullPostData.companies) {
                const company = fullPostData.companies;
                console.log(`🔍 [CREATE EVENT] Empresa: ${company.name}, Email: ${company.email}`);

                if (company.email) {
                    const notifyEvents = [
                        EventType.SystemActivated,
                        EventType.SystemDeactivated,
                        EventType.PanicButton,
                        EventType.GatehouseOnline,
                        EventType.GatehouseOffline,
                        EventType.LocalSemInternet,
                        EventType.VigilantFailure
                    ];

                    console.log(`🔍 [CREATE EVENT] Evento ${eventType} requer notificação?`, notifyEvents.includes(eventType));

                    if (notifyEvents.includes(eventType)) {
                        console.log(`📧 [CREATE EVENT TRIGGER] Enviando email para ${company.email}`);
                        sendEventNotification(
                            company.email,
                            company.name,
                            fullPostData.name,
                            eventType,
                            new Date(newEventData.timestamp)
                        ).catch(err => console.error("❌ [CREATE EVENT EMAIL ERROR]:", err));
                    }
                }
            }
        } catch (emailErr) {
            console.error("❌ [CREATE EVENT EMAIL ERROR] Error sending email:", emailErr);
        }

        return true;
    }, [isOnline]);

    // --- SYSTEM HEALTH CHECK / TICKER ---
    const checkPostStatus = useCallback(() => {
        if (!isLoggedIn || !currentUser) return;

        const now = new Date();
        const postsToCheck = currentUser.username === 'admin' ? posts : posts.filter(p => p.companyId === currentUser.id);

        postsToCheck.forEach(post => {
            const config = alertaVigiaConfigs[post.id];
            // Don't check the post currently being monitored on this screen
            if (!config || post.id === activeVigiaPost?.id) {
                return;
            }

            const gracePeriodMinutes = 5;
            const nowMinutes = now.getHours() * 60 + now.getMinutes();

            const [activationHours, activationMinutes] = config.activationTime.split(':').map(Number);
            const activationTotalMinutes = activationHours * 60 + activationMinutes;

            const [deactivationHours, deactivationMinutes] = config.deactivationTime.split(':').map(Number);
            const deactivationTotalMinutes = deactivationHours * 60 + deactivationMinutes;

            // Determine if the post should be active right now
            let shouldBeActive = false;
            if (activationTotalMinutes > deactivationTotalMinutes) { // Overnight schedule
                if (nowMinutes >= activationTotalMinutes || nowMinutes < deactivationTotalMinutes) {
                    shouldBeActive = true;
                }
            } else { // Same-day schedule
                if (nowMinutes >= activationTotalMinutes && nowMinutes < deactivationTotalMinutes) {
                    shouldBeActive = true;
                }
            }

            // Only check for communication loss if the post should be active
            if (!shouldBeActive) {
                return;
            }

            const eventsForPost = events.filter(e => e.postId === post.id);

            // Check if there's a recent "Sem Comunicação" event to avoid duplicates
            const recentCommLossEvent = eventsForPost.find(e =>
                e.type === EventType.LocalSemInternet &&
                (now.getTime() - e.timestamp.getTime()) < 10 * 60 * 1000 // Within last 10 minutes
            );

            if (recentCommLossEvent) {
                return; // Already reported communication loss recently
            }

            // Check if there's a recent activation event (Sistema Ativado or Portaria Online)
            const recentActivationEvent = eventsForPost.find(e =>
                (e.type === EventType.SystemActivated || e.type === EventType.GatehouseOnline) &&
                (now.getTime() - e.timestamp.getTime()) < 3 * 60 * 1000 // Within last 3 minutes
            );

            // If recently activated, don't check for communication loss yet (give time for heartbeat to establish)
            if (recentActivationEvent) {
                return;
            }

            // Check if the post has a recent heartbeat
            if (post.last_heartbeat) {
                const lastHeartbeatTime = new Date(post.last_heartbeat).getTime();
                const timeSinceHeartbeat = (now.getTime() - lastHeartbeatTime) / 1000; // in seconds

                console.log(`[HEARTBEAT CHECK] Post ${post.id} (${post.name}): Last heartbeat ${Math.floor(timeSinceHeartbeat)}s ago`);

                // If no heartbeat for more than 5 minutes (300 seconds), consider it offline
                // Increased from 2 minutes to account for mobile browser background behavior
                if (timeSinceHeartbeat > 300) {
                    console.log(`Post ${post.id} (${post.name}) has no heartbeat for ${Math.floor(timeSinceHeartbeat)}s. Creating 'Sem Comunicação' event.`);
                    createEvent(post.id, EventType.LocalSemInternet);
                }
            } else {
                // No heartbeat at all - check if there's a "Sistema Ativado" event today
                const activationTimeToday = new Date(now);
                activationTimeToday.setHours(activationHours, activationMinutes, 0, 0);

                const hasActivatedToday = eventsForPost.some(e =>
                    e.type === EventType.SystemActivated &&
                    e.timestamp >= activationTimeToday
                );

                // Only create event if we're past the grace period and no activation was detected
                const minutesSinceActivation = nowMinutes - activationTotalMinutes;
                if (!hasActivatedToday && minutesSinceActivation >= gracePeriodMinutes) {
                    console.log(`Post ${post.id} (${post.name}) has no heartbeat and missed activation. Creating 'Sem Comunicação' event.`);
                    createEvent(post.id, EventType.LocalSemInternet);
                }
            }
        });
    }, [isLoggedIn, currentUser, posts, alertaVigiaConfigs, events, activeVigiaPost, createEvent]);

    useEffect(() => {
        const intervalId = setInterval(checkPostStatus, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }, [checkPostStatus]);

    // Handlers
    const handleOpenTestEmailModal = () => setShowTestEmailModal(true);

    const handleSendTestEmail = async (email: string) => {
        console.log(`Sending test email to: ${email}`);

        const testEmailHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Email - DeltaNuvem</title>
</head>
<body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; color: #333;">
    <div style="background-color: #ffffff; margin: 30px auto; padding: 0; width: 100%; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); text-align: center; padding: 40px 30px; border-bottom: 4px solid #1e40af;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✅ Teste de Email
            </h1>
            <p style="color: #e0e7ff; fontSize: 14px; margin: 10px 0 0; font-weight: 500;">
                DeltaNuvem Tecnologia - Supervisor Digital
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; line-height: 1.8; font-size: 16px;">
            <p style="margin: 0 0 20px; color: #1f2937; font-size: 18px; font-weight: 600;">
                Olá! 👋
            </p>
            
            <p style="margin: 0 0 20px; color: #4b5563;">
                Este é um <strong style="color: #1d4ed8;">email de teste</strong> enviado pelo sistema <strong>DeltaNuvem - Supervisor Digital</strong>.
            </p>

            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-weight: 600; font-size: 15px;">
                    ✓ Sistema de Email Funcionando Corretamente
                </p>
                <p style="margin: 10px 0 0; color: #1e3a8a; font-size: 14px;">
                    Se você recebeu este email, significa que o serviço de notificações está operacional e pronto para enviar alertas em tempo real.
                </p>
            </div>

            <p style="margin: 20px 0 0; color: #4b5563;">
                O sistema está configurado para enviar notificações automáticas sobre:
            </p>

            <ul style="margin: 15px 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 8px;">🔔 <strong>Portaria Online/Offline</strong> - Status do vigilante</li>
                <li style="margin-bottom: 8px;">🚨 <strong>Botão de Pânico</strong> - Alertas de emergência</li>
                <li style="margin-bottom: 8px;">😴 <strong>Vigia Adormeceu</strong> - Falhas de confirmação</li>
                <li style="margin-bottom: 8px;">📡 <strong>Sem Comunicação</strong> - Problemas de conexão</li>
                <li style="margin-bottom: 8px;">⏰ <strong>Sistema Ativado/Desativado</strong> - Início e fim de turnos</li>
            </ul>

            <div style="text-align: center; margin: 35px 0 25px;">
                <div style="display: inline-block; background-color: #1d4ed8; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                    Sistema Operacional ✓
                </div>
            </div>

            <p style="margin: 25px 0 0; color: #6b7280; font-size: 14px; font-style: italic;">
                Data/Hora do Teste: ${new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' })}
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; text-align: center; padding: 30px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <p style="margin: 0 0 10px; font-weight: 600; color: #374151;">
                Precisa de ajuda ou suporte técnico?
            </p>
            <p style="margin: 0 0 15px;">
                <strong style="color: #1d4ed8; font-size: 16px;">📱 WhatsApp: (11) 99803-7370</strong>
            </p>
            <p style="margin: 15px 0 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} DeltaNuvem Tecnologia. Todos os direitos reservados.
            </p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #d1d5db;">
                Este é um email automático do sistema de monitoramento 24h.
            </p>
        </div>

    </div>
</body>
</html>
        `;

        try {
            await sendEmail(
                email,
                '✅ Teste de Notificação - DeltaNuvem Supervisor Digital',
                testEmailHTML
            );

            setShowTestEmailModal(false);
            setInfoModal({
                isOpen: true,
                title: "Sucesso",
                message: `Email de teste enviado com sucesso para ${email}.`,
                autoCloseDelay: 3000
            });
        } catch (error: any) {
            console.error("Falha ao enviar email de teste:", error);
            setInfoModal({
                isOpen: true,
                title: "Erro no Envio",
                message: `Falha ao enviar email: ${error.message || 'Erro desconhecido'}. Verifique se a API Key do SendGrid está configurada no Render.`,
            });
        }
    };

    const handleLogin = async (username: string, password: string): Promise<string | true> => {
        const { data: user, error } = await supabase
            .from('companies')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (error) {
            console.error('Login error:', error.message);
            if (error.message.toLowerCase().includes('rls')) {
                return "Falha de autenticação. Por favor, contate o suporte técnico (Código: RLS).";
            }
            return `Erro de conexão: ${error.message}`;
        }

        if (!user || user.password !== password) {
            return 'Nome de usuário ou senha inválidos.';
        }

        if (user.blocked) {
            return 'Sua conta está pendente de aprovação. Por favor, aguarde.';
        }

        const currentUserData: Company = { ...user, postCount: user.post_count };
        setCurrentUser(currentUserData);
        setIsLoggedIn(true);
        setShowLoginModal(false);
        return true;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsLoggedIn(false);
    };

    const handleRegisterCompany = async (newCompanyData: Omit<Company, 'id' | 'postCount' | 'blocked'>): Promise<string | true> => {
        // 1. Check if the email already exists
        const { data: emailExists, error: emailError } = await supabase
            .from('companies')
            .select('email')
            .eq('email', newCompanyData.email)
            .maybeSingle();

        if (emailError) {
            console.error('Error checking for existing email:', emailError.message);
            return 'Ocorreu um erro ao verificar o email. Tente novamente.';
        }

        if (emailExists) {
            return 'Este email já está cadastrado.';
        }

        // 2. Check if the username already exists
        const { data: usernameExists, error: usernameError } = await supabase
            .from('companies')
            .select('username')
            .eq('username', newCompanyData.username)
            .maybeSingle();

        if (usernameError) {
            console.error('Error checking for existing username:', usernameError.message);
            return 'Ocorreu um erro ao verificar o nome de usuário. Por favor, escolha outro.';
        }

        if (usernameExists) {
            return 'Este nome de usuário já está em uso. Por favor, escolha outro.';
        }

        // 3. If both are unique, proceed with insertion
        const { data, error: insertError } = await supabase
            .from('companies')
            .insert([{ ...newCompanyData, post_count: 0, blocked: true }])
            .select()
            .single();

        if (insertError) {
            console.error('Error registering company:', insertError.message);
            // Fallback checks for unique constraints, though the checks above should prevent these.
            if (insertError.message.includes('companies_email_key')) {
                return 'Este email já está cadastrado.';
            }
            if (insertError.message.includes('companies_username_key')) {
                return 'Este nome de usuário já está em uso. Por favor, escolha outro.';
            }
            return 'Não foi possível concluir o registro. Tente novamente mais tarde.';
        }

        const registeredCompany: Company = { ...data, postCount: data.post_count };
        setCompanies(prev => [...prev, registeredCompany]);

        // Notificar Admin sobre Nova Empresa
        sendAdminNotification('Nova Empresa Cadastrada', {
            'Nome da Empresa': registeredCompany.name,
            'Email': registeredCompany.email,
            'CNPJ': registeredCompany.cnpj,
            'Data de Cadastro': new Date().toLocaleDateString('pt-BR')
        }).catch(err => console.error("Failed to notify admin about new company:", err));

        setShowRegisterModal(false);
        setShowRegistrationSuccessModal(true);
        return true;
    };

    const handleAddPost = () => setShowAddPostModal(true);

    const handleSaveNewPost = async (newPostData: { name: string; location: string; companyId: number; password: string; }) => {
        const { companyId, ...postInsertData } = newPostData;
        const { data: newPost, error: postError } = await supabase
            .from('service_posts')
            .insert([{ ...postInsertData, company_id: companyId, blocked: false }])
            .select()
            .single();

        if (postError) return console.error("Error creating post:", postError.message);

        const company = companies.find(c => c.id === companyId);
        if (!company) return;

        const newConfig = {
            post_id: newPost.id,
            activation_time: '22:00',
            deactivation_time: '06:00',
            progress_duration_minutes: 30,
            alert_sound_seconds: 60,
        };
        const { error: configError } = await supabase.from('alerta_vigia_configs').insert([newConfig]);
        if (configError) console.error("Error creating default config:", configError.message);

        const { error: companyUpdateError } = await supabase
            .from('companies')
            .update({ post_count: company.postCount + 1 })
            .eq('id', company.id);

        if (companyUpdateError) return console.error("Error updating company post count:", companyUpdateError.message);

        const newPostForState: ServicePost = {
            ...newPost, companyId: newPost.company_id,
            companyLogo: company.logo, companyName: company.name
        };
        setPosts(prev => [newPostForState, ...prev]);
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, postCount: c.postCount + 1 } : c));
        setAlertaVigiaConfigs(prev => ({ ...prev, [newPost.id]: { activationTime: newConfig.activation_time, deactivationTime: newConfig.deactivation_time, progressDurationMinutes: newConfig.progress_duration_minutes, alertSoundSeconds: newConfig.alert_sound_seconds } }));

        // Notificar Admin sobre Novo Posto
        sendAdminNotification('Novo Posto de Serviço Cadastrado', {
            'Nome do Posto': newPost.name,
            'Localização': newPost.location,
            'Empresa Pertencente': company.name,
            'Data de Cadastro': new Date().toLocaleDateString('pt-BR')
        }).catch(err => console.error("Failed to notify admin about new post:", err));

        setShowAddPostModal(false);
    };

    const handleSendAlertVigiaAction = async (postIdStr: string, password: string): Promise<string | true> => {
        const postId = parseInt(postIdStr.trim(), 10);
        if (isNaN(postId)) return 'ID do Posto inválido. Use apenas números.';

        const { data: post, error } = await supabase
            .from('service_posts')
            .select('*, companies(logo, name)')
            .eq('id', postId)
            .eq('password', password.trim())
            .maybeSingle();

        if (error) {
            console.error('Error fetching post for login:', error);
            return 'Erro ao verificar as credenciais do posto.';
        }
        if (!post) return 'ID do Posto ou Senha incorretos.';
        if (post.blocked) return 'Este posto de serviço está bloqueado.';

        if (post.last_heartbeat) {
            const lastHeartbeatTime = new Date(post.last_heartbeat).getTime();
            const now = new Date().getTime();
            const secondsSinceHeartbeat = (now - lastHeartbeatTime) / 1000;

            if (secondsSinceHeartbeat < HEARTBEAT_THRESHOLD_SECONDS) {
                return 'Este posto já está sendo monitorado em outro dispositivo.';
            }
        }

        await supabase
            .from('service_posts')
            .update({ last_heartbeat: new Date().toISOString() })
            .eq('id', post.id);

        await createEvent(post.id, EventType.GatehouseOnline);

        const postForState: ServicePost = {
            id: post.id, companyId: post.company_id, name: post.name, location: post.location,
            blocked: post.blocked, password: post.password,
            companyLogo: post.companies.logo, companyName: post.companies.name,
            last_heartbeat: new Date().toISOString()
        };

        setActiveVigiaPost(postForState);
        setDemoMode(false);
        return true;
    };

    const handleCreateSystemEvent = async (postId: number, eventType: EventType) => {
        await createEvent(postId, eventType);
    };

    const handleVigilantPresence = async (postId: number) => {
        if (!isOnline) return;
        const { error } = await supabase
            .from('service_posts')
            .update({ last_heartbeat: new Date().toISOString() })
            .eq('id', postId);
        if (error) {
            console.error("Manual heartbeat on presence confirmation failed:", error.message);
        }
    };

    const handleIncrementFailure = async (postId: number) => {
        const currentFailures = postFailures[postId] || 0;
        const newCount = currentFailures + 1;

        // Optimistically update UI
        setPostFailures(prev => ({ ...prev, [postId]: newCount }));

        // This will queue the event if offline
        const eventCreated = await createEvent(postId, EventType.VigilantFailure);

        // If online, we update the count immediately.
        // If offline, the count will be updated by processOfflineQueue when connection is restored.
        if (isOnline && eventCreated) {
            const { error: upsertError } = await supabase.from('post_failures').upsert({ post_id: postId, count: newCount });
            if (upsertError) {
                console.error("Error upserting failure count:", upsertError.message);
                // Revert optimistic update if DB call fails
                setPostFailures(prev => ({ ...prev, [postId]: currentFailures }));
                setInfoModal({
                    isOpen: true,
                    title: 'Erro ao Salvar Falha',
                    message: `O evento foi registrado, mas não foi possível atualizar o contador de falhas. Detalhes: ${upsertError.message}`
                });
            }
        } else if (!eventCreated) {
            // Revert optimistic update if event creation itself failed
            setPostFailures(prev => ({ ...prev, [postId]: currentFailures }));
        }
    };

    const handlePanic = () => {
        if (!activeVigiaPost) return;
        setConfirmation({
            type: 'panic_button', action: 'delete', data: activeVigiaPost,
            title: 'Confirmar Ação de Pânico',
            message: `Tem certeza que deseja ativar o BOTÃO DE PÂNICO para o posto "${activeVigiaPost.name}"? Esta ação é irreversível e irá alertar a central.`,
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
        });
    };

    const handleExitVigiaScreen = async () => {
        if (activeVigiaPost) {
            await createEvent(activeVigiaPost.id, EventType.GatehouseOffline);
            const { error } = await supabase
                .from('service_posts')
                .update({ last_heartbeat: null })
                .eq('id', activeVigiaPost.id);
            if (error) {
                console.error("Failed to clear heartbeat on exit:", error.message);
            }
        }
        setActiveVigiaPost(null);
    };

    const handleSaveAlertaVigiaConfig = async (postId: number, newConfig: AlertaVigiaConfig) => {
        const { error } = await supabase.from('alerta_vigia_configs').upsert({
            post_id: postId,
            activation_time: newConfig.activationTime,
            deactivation_time: newConfig.deactivationTime,
            progress_duration_minutes: newConfig.progressDurationMinutes,
            alert_sound_seconds: newConfig.alertSoundSeconds,
        });

        if (error) {
            console.error("Error saving config:", error.message);
        } else {
            setAlertaVigiaConfigs(prev => ({ ...prev, [postId]: newConfig }));
            setShowConfigSaveSuccess(true);
        }
    };

    const handleOpenCommentModal = (event: MonitoringEvent) => {
        setEventForComment(event);
        setShowCommentModal(true);
    };

    const handleSaveComment = async (eventId: number, comment: string) => {
        const { error } = await supabase.from('monitoring_events').update({ comment }).eq('id', eventId);
        if (error) console.error("Error saving comment:", error.message);
        else {
            setEvents(prevEvents => prevEvents.map(e => (e.id === eventId ? { ...e, comment } : e)));
            setShowCommentModal(false);
            setEventForComment(null);
        }
    };

    const handleEditCompanyClick = (company: Company) => {
        setSelectedCompany(company);
        setShowEditCompanyModal(true);
    };

    const handleBlockCompanyClick = (company: Company) => setConfirmation({
        type: 'company', action: 'block', data: company,
        title: `${company.blocked ? 'Desbloquear' : 'Bloquear'} Empresa`,
        message: `Você tem certeza que deseja ${company.blocked ? 'desbloquear' : 'bloquear'} a empresa ${company.name}?`,
        confirmButtonClass: company.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
    });

    const handleDeleteCompanyClick = (company: Company) => setConfirmation({
        type: 'company', action: 'delete', data: company, title: 'Excluir Empresa',
        message: `Você tem certeza que deseja excluir a empresa ${company.name}? Esta ação não pode ser desfeita.`
    });

    const handleUpdateCompany = async (updatedCompany: Company) => {
        const originalCompany = companies.find(c => c.id === updatedCompany.id);
        if (!originalCompany) {
            console.error("Original company not found for update.");
            return;
        }

        // Remove id and postCount from the update payload
        // We also want to remove fields that haven't changed to avoid unnecessary unique constraint checks
        const { id, postCount, ...tempUpdateData } = updatedCompany;
        const companyUpdateData: any = { ...tempUpdateData };

        if (originalCompany.email === updatedCompany.email) {
            delete companyUpdateData.email;
        }
        if (originalCompany.username === updatedCompany.username) {
            delete companyUpdateData.username;
        }
        if (originalCompany.cnpj === updatedCompany.cnpj) {
            delete companyUpdateData.cnpj;
        }

        console.log("Updating company:", updatedCompany.id, companyUpdateData);

        // If there are no changes to save, just close the modal
        if (Object.keys(companyUpdateData).length === 0) {
            setShowEditCompanyModal(false);
            return;
        }

        const { data, error } = await supabase
            .from('companies')
            .update(companyUpdateData)
            .eq('id', updatedCompany.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating company:", error.message);
            if (error.message.includes('companies_email_key')) {
                alert('Erro: Este email já está cadastrado em outra empresa.');
            } else if (error.message.includes('companies_username_key')) {
                alert('Erro: Este nome de usuário já está em uso.');
            } else {
                alert(`Erro ao atualizar empresa: ${error.message}`);
            }
            return;
        }

        setCompanies(companies.map(c => c.id === updatedCompany.id ? { ...c, ...updatedCompany } : c));
        setPosts(prevPosts => prevPosts.map(post =>
            post.companyId === updatedCompany.id ? { ...post, companyName: updatedCompany.name, companyLogo: updatedCompany.logo } : post
        ));
        setShowEditCompanyModal(false);
    };

    const handleEditPostClick = (post: ServicePost) => {
        setSelectedPost(post);
        setShowEditPostModal(true);
    };

    const handleOpenAlertaVigiaConfig = (post: ServicePost) => {
        setSelectedPostForConfig(post);
        setShowAlertaVigiaConfig(true);
    };

    const handleResetFailures = (post: ServicePost) => setConfirmation({
        type: 'reset_failures', action: 'delete', data: post, title: 'Resetar Falhas',
        message: `Tem certeza que deseja resetar as falhas do posto "${post.name}"? O contador será zerado.`,
        confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    });

    const handleBlockPostClick = (post: ServicePost) => setConfirmation({
        type: 'post', action: 'block', data: post,
        title: `${post.blocked ? 'Desbloquear' : 'Bloquear'} Posto`,
        message: `Você tem certeza que deseja ${post.blocked ? 'desbloquear' : 'bloquear'} o posto de serviço "${post.name}"?`,
        confirmButtonClass: post.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
    });

    const handleDeletePostClick = (post: ServicePost) => setConfirmation({
        type: 'post', action: 'delete', data: post, title: 'Excluir Posto de Serviço',
        message: `Você tem certeza que deseja excluir o posto "${post.name}"? Todos os eventos relacionados serão perdidos.`
    });

    const handleUpdatePost = async (updatedPost: ServicePost) => {
        const { id, companyId, companyLogo, companyName, ...updateData } = updatedPost;
        const { error } = await supabase
            .from('service_posts')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error("Error updating post:", error.message);
        } else {
            setPosts(prevPosts => prevPosts.map(p => (p.id === id ? updatedPost : p)));
            setShowEditPostModal(false);
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmation) return;
        const { type, action, data } = confirmation;

        if (type === 'panic_button') {
            const post = data as ServicePost;
            await createEvent(post.id, EventType.PanicButton);
            setShowPanicSuccessModal(true);
        } else if (type === 'reset_failures') {
            const post = data as ServicePost;
            const { error } = await supabase.from('post_failures').upsert({ post_id: post.id, count: 0 });
            if (error) console.error("Error resetting failures", error.message);
            else setPostFailures(prev => ({ ...prev, [post.id]: 0 }));
            setShowResetSuccessModal(true);
        } else if (type === 'company') {
            const company = data as Company;
            if (action === 'delete') {
                const { error } = await supabase.from('companies').delete().eq('id', company.id);
                if (error) console.error("Error deleting company", error.message);
                else {
                    setCompanies(prev => prev.filter(c => c.id !== company.id));
                    // Notificar Admin sobre Empresa Excluída
                    sendAdminNotification('Empresa Excluída', {
                        'Nome da Empresa': company.name,
                        'CNPJ': company.cnpj,
                        'Motivo': 'Exclusão Manual pelo Admin'
                    }).catch(err => console.error("Failed to notify admin about company deletion:", err));
                }
            } else if (action === 'block') {
                const { error } = await supabase.from('companies').update({ blocked: !company.blocked }).eq('id', company.id);
                if (error) console.error("Error blocking company", error.message);
                else {
                    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, blocked: !c.blocked } : c));
                    // Notificar Admin sobre Empresa Bloqueada/Desbloqueada
                    const status = !company.blocked ? 'Bloqueada' : 'Desbloqueada';
                    sendAdminNotification(`Empresa ${status}`, {
                        'Nome da Empresa': company.name,
                        'Novo Status': status
                    }).catch(err => console.error("Failed to notify admin about company block:", err));
                }
            }
        } else if (type === 'post') {
            const post = data as ServicePost;
            if (action === 'delete') {
                const { error } = await supabase.from('service_posts').delete().eq('id', post.id);
                if (error) console.error("Error deleting post", error.message);
                else {
                    setPosts(prev => prev.filter(p => p.id !== post.id));
                    setEvents(prev => prev.filter(e => e.postId !== post.id));
                    const company = companies.find(c => c.id === post.companyId);
                    if (company) {
                        const newCount = Math.max(0, company.postCount - 1);
                        await supabase.from('companies').update({ post_count: newCount }).eq('id', post.companyId);
                        setCompanies(prev => prev.map(c => c.id === post.companyId ? { ...c, postCount: newCount } : c));

                        // Notificar Admin sobre Posto Excluído
                        sendAdminNotification('Posto de Serviço Excluído', {
                            'Nome do Posto': post.name,
                            'Empresa': company.name,
                            'Excluído Por': currentUser?.username || 'Desconhecido'
                        }).catch(err => console.error("Failed to notify admin about post deletion:", err));

                        // Notificar Empresa se ela mesma excluiu (ou se foi o admin, o pedido diz "Quando uma Empresa excluir seu Posto... notifique ela")
                        // Vou notificar a empresa em ambos os casos para garantir transparência
                        if (company.email) {
                            sendCompanyNotification(company.email, 'Posto de Serviço Excluído', {
                                'Nome do Posto': post.name,
                                'Data da Exclusão': new Date().toLocaleDateString('pt-BR')
                            }).catch(err => console.error("Failed to notify company about post deletion:", err));
                        }
                    }
                }
            } else if (action === 'block') {
                const { error } = await supabase.from('service_posts').update({ blocked: !post.blocked }).eq('id', post.id);
                if (error) console.error("Error blocking post", error.message);
                // Fix: Changed incorrect variable 'c' to 'p' to correctly map over the posts.
                else setPosts(prev => prev.map(p => p.id === post.id ? { ...p, blocked: !p.blocked } : p));
            }
        }
        setConfirmation(null);
    };

    const handleToggleEventStatus = async (eventId: number) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        const newStatus = event.status === EventStatus.Resolved ? EventStatus.Unresolved : EventStatus.Resolved;
        const { error } = await supabase.from('monitoring_events').update({ status: newStatus }).eq('id', eventId);
        if (error) console.error("Error updating event status", error.message);
        else setEvents(prevEvents => prevEvents.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
        company.cnpj.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
        company.email.toLowerCase().includes(companySearchQuery.toLowerCase())
    );

    const postsForCurrentUser = currentUser
        ? currentUser.username === 'admin' ? posts : posts.filter(post => post.companyId === currentUser.id)
        : [];

    const filteredPosts = postsForCurrentUser.filter(post =>
        post.name.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
        post.companyName.toLowerCase().includes(postSearchQuery.toLowerCase())
    );

    const postIdsForCurrentUser = new Set(postsForCurrentUser.map(p => p.id));
    const eventsForCurrentUser = events.filter(event => currentUser?.username === 'admin' || postIdsForCurrentUser.has(event.postId));

    const renderContent = () => {
        if (fetchError) {
            return (
                <div className="fixed inset-0 bg-gray-900 flex items-center justify-center text-white p-8">
                    <div className="text-center max-w-lg bg-gray-800/50 backdrop-blur-sm border border-red-500/50 rounded-lg p-8">
                        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Erro de Conexão com o Banco de Dados</h2>
                        <p className="text-md text-gray-300 mb-6">{fetchError}</p>
                        <p className="text-sm text-gray-400">
                            A causa mais comum para este erro é a falta das tabelas no Supabase ou uma política de segurança (RLS) restritiva.
                            Por favor, vá para <code className="bg-gray-700 p-1 rounded">SQL Editor</code> para executar o script de criação das tabelas e verifique as <code className="bg-gray-700 p-1 rounded">Policies</code> do seu banco de dados.
                        </p>
                    </div>
                </div>
            );
        }
        if (loading) {
            return (
                <div className="fixed inset-0 bg-gray-900 flex items-center justify-center text-white">
                    <div className="flex items-center gap-4">
                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xl font-semibold">Carregando Dados...</span>
                    </div>
                </div>
            );
        }
        if (showAlertaVigiaConfig && selectedPostForConfig) {
            const postConfig = alertaVigiaConfigs[selectedPostForConfig.id] || {
                activationTime: '22:00',
                deactivationTime: '06:00',
                progressDurationMinutes: 30,
                alertSoundSeconds: 60
            };
            return (
                <AlertaVigiaConfigPage
                    post={selectedPostForConfig}
                    failures={postFailures[selectedPostForConfig.id] || 0}
                    onClose={() => setShowAlertaVigiaConfig(false)}
                    onResetFailures={() => handleResetFailures(selectedPostForConfig)}
                    config={postConfig}
                    onSaveConfig={(newConfig) => handleSaveAlertaVigiaConfig(selectedPostForConfig.id, newConfig)}
                />
            );
        }
        if (activeVigiaPost) {
            return (
                <AlertaVigiaActiveScreen
                    post={activeVigiaPost}
                    failures={postFailures[activeVigiaPost.id] || 0}
                    config={alertaVigiaConfigs[activeVigiaPost.id] || { activationTime: '22:00', deactivationTime: '06:00', progressDurationMinutes: 30, alertSoundSeconds: 60 }}
                    onConfirmPresence={handleVigilantPresence}
                    onPanic={handlePanic}
                    onExit={handleExitVigiaScreen}
                    onCreateSystemEvent={handleCreateSystemEvent}
                    onIncrementFailure={handleIncrementFailure}
                />
            );
        }
        if (demoMode) {
            return (
                <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 relative">
                    <button onClick={() => setDemoMode(false)} className="absolute top-4 left-4 z-50 bg-gray-800/50 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-700 transition-colors" title="Voltar">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="w-full max-w-2xl">
                        <AlertaVigiaContent onSendAction={handleSendAlertVigiaAction} />
                    </div>
                    <footer className="absolute bottom-4 text-center text-sm text-gray-500">
                        Support WhatsApp: (11) 99803-7370
                    </footer>
                </div>
            )
        }
        if (isLoggedIn && currentUser) {
            return (
                <Dashboard
                    currentUser={currentUser} onLogout={handleLogout} companies={filteredCompanies} posts={filteredPosts}
                    events={eventsForCurrentUser} onToggleEventStatus={handleToggleEventStatus}
                    onAddPost={handleAddPost} onEdit={handleEditCompanyClick} onBlock={handleBlockCompanyClick} onDelete={handleDeleteCompanyClick}
                    onEditPost={handleEditPostClick} onBlockPost={handleBlockPostClick} onDeletePost={handleDeletePostClick} onMonitorPost={handleOpenAlertaVigiaConfig}
                    onAddComment={handleOpenCommentModal} postSearchQuery={postSearchQuery} onPostSearchChange={setPostSearchQuery}
                    companySearchQuery={companySearchQuery} onCompanySearchChange={setCompanySearchQuery}
                    onSendAlertVigiaAction={handleSendAlertVigiaAction}
                    hiddenEventIds={hiddenEventIds}
                    onHideEvents={handleHideEvents}
                    onRestoreHiddenEvents={handleRestoreHiddenEvents}
                    onOpenTestEmailModal={handleOpenTestEmailModal}
                />
            );
        }
        return <LandingPage onLoginClick={() => setShowLoginModal(true)} onDemoClick={() => setDemoMode(true)} />;
    };

    return (
        <>
            {renderContent()}
            <audio ref={newEventSoundRef} src="https://hrubgwggnnxyqeomhhyc.supabase.co/storage/v1/object/public/som%20de%20eventos/som%20de%20eventos.mp3" preload="auto" />
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }} />
            <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} onRegister={handleRegisterCompany} />
            <EditCompanyModal isOpen={showEditCompanyModal} onClose={() => setShowEditCompanyModal(false)} onSave={handleUpdateCompany} company={selectedCompany} />
            <EditPostModal isOpen={showEditPostModal} onClose={() => setShowEditPostModal(false)} onSave={handleUpdatePost} post={selectedPost} />
            <ConfirmationModal isOpen={!!confirmation} onClose={() => setConfirmation(null)} onConfirm={handleConfirmAction} title={confirmation?.title || ''} message={confirmation?.message || ''} confirmButtonClass={confirmation?.confirmButtonClass} />
            <AddPostModal isOpen={showAddPostModal} onClose={() => setShowAddPostModal(false)} onSave={handleSaveNewPost} currentUser={currentUser} companies={companies} />
            <CommentModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} onSave={handleSaveComment} event={eventForComment} />
            <TestEmailModal isOpen={showTestEmailModal} onClose={() => setShowTestEmailModal(false)} onSend={handleSendTestEmail} />
            <InfoModal isOpen={showRegistrationSuccessModal} onClose={() => setShowRegistrationSuccessModal(false)} title="Registro Enviado para Aprovação!" message="Sua conta foi criada com sucesso e aguarda a aprovação de um administrador. Por favor, aguarde." />
            <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} title={infoModal.title} message={infoModal.message} autoCloseDelay={infoModal.autoCloseDelay} />
            <InfoModal isOpen={showConfigSaveSuccess} onClose={() => setShowConfigSaveSuccess(false)} title="Sucesso!" message="Salvo com Sucesso!" autoCloseDelay={2500} />
            <InfoModal isOpen={showResetSuccessModal} onClose={() => setShowResetSuccessModal(false)} title="Sucesso!" message="As falhas registradas para o vigia foram zeradas." autoCloseDelay={3000} />
            <InfoModal isOpen={showPanicSuccessModal} onClose={() => setShowPanicSuccessModal(false)} title="Sucesso!" message="Alerta de Pânico Enviado com Sucesso!" autoCloseDelay={3000} />
        </>
    );
}

export default App;