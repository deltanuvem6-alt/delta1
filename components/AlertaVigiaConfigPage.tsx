import React, { useEffect, useState } from 'react';
import type { ServicePost, AlertaVigiaConfig } from '../types';
import { EventType } from '../types';

interface AlertaVigiaConfigPageProps {
    post: ServicePost;
    onClose: () => void;
    onResetFailures: () => void;
    failures: number;
    config: AlertaVigiaConfig;
    onSaveConfig: (newConfig: AlertaVigiaConfig) => void;
}

const AlertaVigiaConfigPage: React.FC<AlertaVigiaConfigPageProps> = ({ post, onClose, onResetFailures, failures, config, onSaveConfig }) => {
    
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [activationTime, setActivationTime] = useState(config.activationTime.substring(0, 5));
    const [deactivationTime, setDeactivationTime] = useState(config.deactivationTime.substring(0, 5));
    const [progressMinutes, setProgressMinutes] = useState(String(config.progressDurationMinutes));
    const [alertSeconds, setAlertSeconds] = useState(String(config.alertSoundSeconds));
    const [password, setPassword] = useState(post.password);
    const [saveError, setSaveError] = useState('');

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setSaveError('');
        const input = e.target.value;
        let digits = input.replace(/\D/g, '').substring(0, 4);

        if (digits.length >= 2) {
            if (parseInt(digits.substring(0, 2), 10) > 23) {
                digits = '23' + digits.substring(2);
            }
        }
        if (digits.length === 4) {
            if (parseInt(digits.substring(2, 4), 10) > 59) {
                digits = digits.substring(0, 2) + '59';
            }
        }

        let formatted = digits;
        if (digits.length > 2) {
            formatted = `${digits.substring(0, 2)}:${digits.substring(2)}`;
        }
        
        setter(formatted);
    };

    const handleSave = () => {
        setSaveError('');
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(activationTime)) {
            setSaveError('Formato de hora de Ativação inválido. Use HH:MM.');
            return;
        }
        if (!timeRegex.test(deactivationTime)) {
            setSaveError('Formato de hora de Desativação inválido. Use HH:MM.');
            return;
        }

        onSaveConfig({
            activationTime,
            deactivationTime,
            progressDurationMinutes: Number(progressMinutes) || 0,
            alertSoundSeconds: Number(alertSeconds) || 0,
        });
    };
    
    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
        <style>{`
            #alerta-vigia-body {
                font-family: 'Inter', sans-serif; 
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            .card-shadow { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
            
            .btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                transition: all 0.3s ease;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
            }
            .btn-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                transition: all 0.3s ease;
            }
            .btn-success:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
            }
            .btn-danger {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                transition: all 0.3s ease;
            }
            .btn-danger:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
            }
            .dark-mode {
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            }
            .dark-mode .bg-white\\/95 {
                background: rgba(31, 41, 55, 0.95) !important;
            }
            .dark-mode .text-gray-800 { color: #f9fafb !important; }
            .dark-mode .text-gray-500 { color: #9ca3af !important; }
            .dark-mode .text-gray-600 { color: #d1d5db !important; }
            .dark-mode input, .dark-mode select {
                background: rgba(55, 65, 81, 0.9) !important;
                color: #f9fafb !important;
                border-color: rgba(107, 114, 128, 0.6) !important;
            }
            .upload-area {
                transition: all 0.3s ease;
                border-style: dashed;
                border-width: 2px;
                aspect-ratio: 1;
            }
            .upload-area:hover {
                background: rgba(59, 130, 246, 0.05);
                border-color: #3b82f6;
                transform: scale(1.05);
            }
            .dark-mode .upload-area {
                background: rgba(55, 65, 81, 0.3) !important;
                border-color: rgba(107, 114, 128, 0.6) !important;
            }
            .dark-mode .upload-area:hover {
                background: rgba(59, 130, 246, 0.15) !important;
                border-color: rgba(59, 130, 246, 0.8) !important;
            }
        `}</style>
        <div id="alerta-vigia-body" className="dark-mode min-h-screen p-3 sm:p-4">
             <button onClick={onClose} className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/30 transition-colors">
                 <i className="fas fa-arrow-left"></i>
             </button>

            <div className="max-w-sm sm:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full mb-3 sm:mb-4 p-2">
                        <img src={post.companyLogo} alt="DeltaNuvem Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full" />
                    </div>
                    <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">Configurações do Alerta Vigia</h1>
                    <p className="text-white/80 text-sm">Posto: {post.name}</p>

                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 xl:p-10 card-shadow mb-4 sm:mb-6">
                    
                    <div className="mb-6">
                        <label htmlFor="posto-id" className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
                            <i className="fas fa-id-card mr-2 text-blue-600"></i>
                            ID do Posto
                        </label>
                        <input
                            type="text"
                            id="posto-id"
                            readOnly
                            value={`Post-${post.id}`}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-[1.25rem] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 font-medium bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed"
                             />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="posto-nome" className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
                            <i className="fas fa-building mr-2 text-blue-600"></i>
                            Nome do Posto
                        </label>
                        <input
                            type="text"
                            id="posto-nome"
                            readOnly
                            value={post.name}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-[1.25rem] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 font-medium bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed"
                            />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="senha-acesso" className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
                            <i className="fas fa-key mr-2 text-blue-600"></i>
                            Senha de Acesso
                        </label>
                        <div className="relative">
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                id="senha-acesso"
                                value={password}
                                readOnly
                                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-[1.25rem] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 font-medium bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed"
                                 />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-300"
                                title="Mostrar/Ocultar senha">
                                <i id="password-icon" className={`fas ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6">
                        <div>
                            <label htmlFor="horario-ativacao" className="block text-xs sm:text-sm font-semibold text-green-800 mb-2">
                                <i className="fas fa-play mr-1 text-green-600"></i>
                                Ativação
                            </label>
                            <input
                                type="text"
                                id="horario-ativacao"
                                value={activationTime}
                                maxLength={5}
                                placeholder="HH:MM"
                                onChange={e => handleTimeChange(e, setActivationTime)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-green-300 rounded-[1rem] sm:rounded-[1.25rem] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-green-800 font-bold" />
                        </div>
                        <div>
                            <label htmlFor="horario-desativacao" className="block text-xs sm:text-sm font-semibold text-red-800 mb-2">
                                <i className="fas fa-stop mr-1 text-red-600"></i>
                                Desativação
                            </label>
                            <input
                                type="text"
                                id="horario-desativacao"
                                value={deactivationTime}
                                maxLength={5}
                                placeholder="HH:MM"
                                onChange={e => handleTimeChange(e, setDeactivationTime)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-red-300 rounded-[1rem] sm:rounded-[1.25rem] focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-red-800 font-bold" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
                        <div>
                            <label htmlFor="tempo-progresso" className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2">
                                <i className="fas fa-clock mr-2 text-blue-600"></i>
                                Tempo da Barra de Progresso (Minutos)
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    id="tempo-progresso"
                                    value={progressMinutes}
                                    onChange={e => setProgressMinutes(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Ex: 30"
                                    className="flex-1 px-4 py-3 lg:px-5 lg:py-4 border-2 border-gray-300 rounded-[1.25rem] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 font-medium text-base lg:text-lg" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-600/50 px-2.5 py-1.5 rounded-full">min</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="tempo-alerta" className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2">
                                <i className="fas fa-volume-up mr-2 text-orange-600"></i>
                                Alerta Sonoro antes do Fim (Segundos)
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    id="tempo-alerta"
                                    value={alertSeconds}
                                    onChange={e => setAlertSeconds(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Ex: 60"
                                    className="flex-1 px-4 py-3 lg:px-5 lg:py-4 border-2 border-orange-300 rounded-[1.25rem] focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 font-medium text-base lg:text-lg" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-200 bg-orange-100 dark:bg-orange-600/50 px-2.5 py-1.5 rounded-full">seg</span>
                            </div>
                        </div>
                    </div>
                    
                    {saveError && (
                        <div className="text-center text-red-500 font-semibold mb-4 text-sm -mt-2">
                            {saveError}
                        </div>
                    )}

                    <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg my-6 w-[70%] mx-auto flex items-center justify-between px-3" style={{ height: '30px' }}>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <i className="fas fa-exclamation-triangle text-orange-600 dark:text-orange-400 text-sm flex-shrink-0"></i>
                            <span className="text-xs font-semibold text-orange-800 dark:text-orange-200 whitespace-nowrap">Falhas ({EventType.VigilantFailure})</span>
                        </div>
                        <span className="text-base font-bold text-orange-600 dark:text-orange-400 bg-white/50 dark:bg-black/20 px-2 rounded-md">{failures}</span>
                    </div>


                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-stretch">
                        <button onClick={handleSave} className="btn-success flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center transition-all duration-300">
                            <i className="fas fa-save mr-2 text-lg"></i>
                            <span>Salvar</span>
                        </button>
                        <button onClick={onResetFailures} className="btn-danger flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center transition-all duration-300">
                            <i className="fas fa-eraser mr-2 text-lg"></i>
                            <span>Resetar Falhas</span>
                        </button>
                    </div>
                </div>

                <div className="text-center mt-4 sm:mt-0">
                    <p className="text-white/70 text-sm mb-2">
                        <i className="fas fa-shield-alt mr-2"></i>
                        Configuração Segura
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-white/50 text-xs">
                        <img src={post.companyLogo} alt="DeltaNuvem" className="w-3 h-3 sm:w-4 sm:h-4 object-cover rounded-full" />
                        <span className="text-center">© {new Date().getFullYear()} DeltaNuvem</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default AlertaVigiaConfigPage;