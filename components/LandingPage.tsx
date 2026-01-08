import React, { useEffect } from 'react';

const LandingPage: React.FC<{ onLoginClick: () => void; onDemoClick: () => void }> = ({ onLoginClick, onDemoClick }) => {

    useEffect(() => {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Clear existing particles to prevent duplication on re-renders in dev mode
        if (particlesContainer.childElementCount > 0) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = `${Math.random() * 6 + 2}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${(Math.random() * 10 + 15)}s`;
            particlesContainer.appendChild(particle);
        }
    }, []);

    const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const featuresSection = document.getElementById('recursos');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <style>{`
                body {
                    overflow-x: hidden;
                    background-color: #050f23;
                }
                .hero-section {
                    background: linear-gradient(135deg, rgba(5, 15, 35, 0.85) 0%, rgba(10, 30, 60, 0.75) 50%, rgba(15, 45, 85, 0.85) 100%),
                                url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80');
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                    position: relative;
                    overflow: hidden;
                }
                .particles { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; }
                .particle {
                    position: absolute;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%);
                    border-radius: 50%;
                    animation: float-particle 20s infinite;
                }
                @keyframes float-particle {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translate(100px, -1000px) scale(0.5); opacity: 0; }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-style: preserve-3d;
                    perspective: 1000px;
                }
                .glass-card:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(59, 130, 246, 0.5);
                    transform: translateY(-15px) rotateX(5deg);
                    box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
                }
                .glow-button {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    box-shadow: 0 0 10px rgba(37, 99, 235, 0.3), 0 10px 30px rgba(29, 78, 216, 0.2);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .glow-button::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transform: rotate(45deg);
                    animation: shine 3s infinite;
                }
                @keyframes shine {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }
                .glow-button:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 0 25px rgba(37, 99, 235, 0.5), 0 15px 40px rgba(29, 78, 216, 0.3);
                }
                .logo-3d {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3), inset 0 -3px 10px rgba(0, 0, 0, 0.3);
                    transform-style: preserve-3d;
                    transition: all 0.3s ease;
                }
                .logo-3d:hover {
                    transform: rotateY(10deg) rotateX(10deg);
                    box-shadow: 0 15px 40px rgba(37, 99, 235, 0.4);
                }
                .stat-card-3d {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transform-style: preserve-3d;
                    transition: all 0.4s ease;
                }
                .stat-card-3d:hover {
                    transform: translateY(-10px) translateZ(50px);
                    box-shadow: 0 30px 60px rgba(59, 130, 246, 0.4);
                }
                .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 10px 30px rgba(37, 99, 235, 0.5), inset 0 -3px 10px rgba(0, 0, 0, 0.3); }
                    50% { box-shadow: 0 10px 40px rgba(37, 99, 235, 0.8), inset 0 -3px 10px rgba(0, 0, 0, 0.3), 0 0 30px rgba(59, 130, 246, 0.5); }
                }
                .icon-glow { filter: drop-shadow(0 0 5px rgba(96, 165, 250, 0.4)); }
                .grid-overlay {
                    position: absolute; width: 100%; height: 100%;
                    background-image: linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px; pointer-events: none;
                }
                @media (max-width: 768px) { .hero-section { background-attachment: scroll; } }
            `}</style>
            
            <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="logo-3d w-14 h-14 rounded-2xl flex items-center justify-center pulse-glow">
                            <svg className="w-8 h-8 text-white icon-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl tracking-tight">Supervisor Digital</h1>
                            <p className="text-blue-300 text-xs font-medium">DeltaNuvem Tecnologia</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button onClick={onLoginClick} className="glass-card px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 text-sm">
                            <span>Entrar</span>
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <section className="hero-section min-h-screen flex items-center justify-center px-6 py-32 relative">
                <div className="grid-overlay"></div>
                <div className="particles" id="particles"></div>
                
                <div className="max-w-7xl mx-auto text-center relative z-20">
                    <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-black mb-3 leading-tight tracking-tight">
                        Supervisor Digital
                    </h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-10 leading-tight tracking-tight" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 15px rgba(96, 165, 250, 0.3)' }}>
                        Alerta Vigia 24h
                    </h3>
                    
                    <p className="text-blue-100 text-lg sm:text-xl mb-14 max-w-3xl mx-auto leading-relaxed font-light">
                        Sistema avançado de monitoramento 24h para portaria de condomínios e indústrias. Supervisão digital inteligente que nunca dorme.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="#recursos" onClick={handleScrollToFeatures} className="glow-button px-10 py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 w-full sm:w-auto">
                            <span>Conhecer Recursos</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                            </svg>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onDemoClick(); }} className="glass-card px-10 py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 w-full sm:w-auto">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>Alerta Vigia Digital</span>
                        </a>
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 relative" style={{ background: 'linear-gradient(180deg, rgba(5, 15, 35, 0.95) 0%, rgba(10, 25, 50, 0.98) 100%)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="stat-card-3d p-8 rounded-3xl text-center">
                            <div className="text-5xl font-black mb-3" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>99.9%</div>
                            <p className="text-blue-200 text-lg font-semibold">Uptime Garantido</p>
                        </div>
                        <div className="stat-card-3d p-8 rounded-3xl text-center">
                            <div className="text-5xl font-black mb-3" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>24/7</div>
                            <p className="text-blue-200 text-lg font-semibold">Monitoramento Contínuo</p>
                        </div>
                        <div className="stat-card-3d p-8 rounded-3xl text-center">
                            <div className="text-5xl font-black mb-3" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>&lt;30s</div>
                            <p className="text-blue-200 text-lg font-semibold">Tempo de Resposta</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="recursos" className="py-32 px-6 relative" style={{ background: 'linear-gradient(180deg, rgba(10, 25, 50, 0.98) 0%, rgba(5, 15, 35, 0.95) 100%)' }}>
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-white text-5xl font-black text-center mb-6">Recursos Avançados</h2>
                    <p className="text-blue-200 text-xl text-center mb-20 max-w-3xl mx-auto">Tecnologia de ponta para garantir a segurança e eficiência do seu condomínio ou indústria</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-10 rounded-3xl">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-4">Vigilância Inteligente</h3>
                            <p className="text-blue-200 text-lg leading-relaxed">Sistema de câmeras com IA que identifica comportamentos suspeitos e envia alertas instantâneos.</p>
                        </div>

                        <div className="glass-card p-10 rounded-3xl">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-4">App Mobile</h3>
                            <p className="text-blue-200 text-lg leading-relaxed">Acesse o sistema de qualquer lugar através do nosso aplicativo mobile intuitivo e seguro.</p>
                        </div>

                        <div className="glass-card p-10 rounded-3xl">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-4">Relatórios Detalhados</h3>
                            <p className="text-blue-200 text-lg leading-relaxed">Análises completas e relatórios personalizados sobre todas as atividades monitoradas.</p>
                        </div>

                        <div className="glass-card p-10 rounded-3xl">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-4">Segurança Máxima</h3>
                            <p className="text-blue-200 text-lg leading-relaxed">Criptografia de ponta a ponta e armazenamento em nuvem com backup automático.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 px-6" style={{ background: 'rgba(5, 10, 25, 0.98)' }}>
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="logo-3d w-12 h-12 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold">Supervisor Digital</h3>
                    </div>
                     <p className="text-blue-300 mb-2 font-semibold">Support WhatsApp: (11) 99803-7370</p>
                    <p className="text-blue-300 mb-6">DeltaNuvem Tecnologia - Monitoramento Inteligente 24h</p>
                    <p className="text-blue-400 text-sm">&copy; {new Date().getFullYear()} Todos os direitos reservados</p>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;