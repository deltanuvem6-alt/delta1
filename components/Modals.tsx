import React, { useState, useRef, ChangeEvent, useEffect, useMemo } from 'react';
import { XIcon, UploadCloud, EyeIcon, EyeOffIcon, ShieldCheckIcon } from './Icons';
import type { Company, ServicePost, MonitoringEvent } from '../types';
import { EventType } from '../types';

export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    footer?: React.ReactNode;
    paddingClass?: string;
    maxWidthClass?: string;
}> = ({ isOpen, onClose, children, title, footer, paddingClass = 'p-4 sm:p-6 space-y-4', maxWidthClass = 'max-w-md' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[150] flex justify-center items-center p-4" onClick={onClose}>
            <div className={`bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-xl w-full ${maxWidthClass} flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
                {title && (
                    <div className="flex items-center justify-center p-4 border-b border-slate-700/80 rounded-t relative flex-shrink-0">
                        <h3 className="text-xl font-semibold text-white">{title}</h3>
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-slate-700 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center" onClick={onClose}>
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className={`${paddingClass} overflow-y-auto`}>
                    {children}
                </div>
                {footer && (
                    <div className="p-4 border-t border-slate-700/80 rounded-b flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onLogin: (username: string, password: string) => Promise<string | true>; onSwitchToRegister: () => void }> = ({ isOpen, onClose, onLogin, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUsername('');
            setPassword('');
            setError('');
            setShowPassword(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const result = await onLogin(username, password);
        if (typeof result === 'string') {
            setError(result);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} paddingClass="p-6 sm:p-8" maxWidthClass="max-w-sm">
            <div className="flex flex-col items-center text-center">
                <div className="bg-blue-600/30 p-3 rounded-xl mb-4">
                    <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Supervisor Digital</h2>
                <p className="text-sm text-slate-400 mb-6">DeltaNuvem Tecnologia</p>
            </div>

            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400">Acesso Restrito</h3>
                <p className="text-sm text-slate-400">Faça login para continuar</p>
            </div>
            
            <form id="login-form" className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="login-user" className="sr-only">Usuário</label>
                    <input id="login-user" value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3" placeholder="Usuário" required />
                </div>
                <div>
                    <label htmlFor="login-pass" className="sr-only">Senha</label>
                    <div className="relative">
                        <input id="login-pass" value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Senha" className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 pr-10" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white">
                            {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
                <div className="flex items-center text-sm">
                    <input id="remember" type="checkbox" className="w-4 h-4 border-slate-600 rounded bg-slate-700 focus:ring-blue-600 ring-offset-slate-800" />
                    <label htmlFor="remember" className="ml-2 font-medium text-slate-300">Salvar a senha</label>
                </div>

                {error && <p className="text-sm text-red-400 text-center !mt-2">{error}</p>}
                
                <button type="submit" className="w-full text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-800 font-bold rounded-lg text-base px-5 py-3 text-center transition-all !mt-6">Entrar</button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm font-medium text-slate-400">
                <button onClick={onClose} className="hover:text-white transition-colors">← Voltar</button>
                <div className="h-4 w-px bg-slate-600"></div>
                <button onClick={onSwitchToRegister} className="hover:text-white transition-colors">Criar Conta</button>
            </div>
        </Modal>
    );
};

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const getStrength = () => {
        let score = 0;
        if (!password) return score;
        if (password.length > 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };

    const strength = getStrength();
    const colors = ['bg-gray-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const labels = ['', 'Fraca', 'Média', 'Forte', 'Muito Forte'];

    return (
        <div className="w-full">
            <div className="flex gap-1 mt-1">
                {Array.from(Array(4).keys()).map(i => (
                    <div key={i} className={`h-1.5 rounded-full flex-1 ${i < strength ? colors[strength] : 'bg-gray-600'}`}></div>
                ))}
            </div>
            {password && <p className="text-xs mt-1 text-right" style={{color: colors[strength].replace('bg-', '')}}>{labels[strength]}</p>}
        </div>
    );
};


export const RegisterModal: React.FC<{ isOpen: boolean; onClose: () => void; onRegister: (c: Omit<Company, 'id' | 'postCount' | 'blocked'>) => Promise<string | true> }> = ({ isOpen, onClose, onRegister }) => {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const newCompany = {
            logo: logoPreview || `https://picsum.photos/seed/${formData.get('companyName')}/100`,
            name: formData.get('companyName') as string,
            cnpj: formData.get('cnpj') as string,
            location: `${formData.get('city')}, ${formData.get('state')}`,
            email: formData.get('email') as string,
            whatsapp: formData.get('whatsapp') as string,
            username: formData.get('username') as string,
            password: password,
        };
        const result = await onRegister(newCompany);

        if (typeof result === 'string') {
            setError(result);
        }
        
        setLoading(false);
    };

    const footer = (
        <>
            {error && <p className="text-sm text-red-500 text-center mb-2">{error}</p>}
            <button type="submit" form="register-form" disabled={loading} className="w-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center">
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registrando...
                    </>
                ) : (
                    'Registrar'
                )}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Nova Conta" footer={footer}>
            <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-2 overflow-hidden border-2 border-gray-600">
                        {logoPreview ? <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" /> : <UploadCloud className="w-10 h-10 text-gray-500" />}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-500 hover:underline">Carregar logo</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="companyName" placeholder="Nome da Empresa" className="col-span-1 sm:col-span-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                    <input name="cnpj" placeholder="CNPJ" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                    <input name="whatsapp" placeholder="WhatsApp" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                    <input name="state" placeholder="Estado" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                    <input name="city" placeholder="Cidade" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                </div>
                <input name="email" type="email" placeholder="Email" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                <input name="username" placeholder="Nome de usuário" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                        {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                    </button>
                </div>
                <div className="relative">
                    <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirmar Senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                        {showConfirmPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                    </button>
                </div>
                <PasswordStrengthMeter password={password} />
            </form>
        </Modal>
    );
};

export const EditCompanyModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (company: Company) => void; 
    company: Company | null;
}> = ({ isOpen, onClose, onSave, company }) => {
    const [formData, setFormData] = useState<Company | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (company) {
            setFormData(company);
            setLogoPreview(company.logo);
            // Reset password fields on company change or modal open
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setPasswordError('');
        }
    }, [company]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                setFormData(prev => prev ? { ...prev, logo: result } : null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordError('');

        if (isChangingPassword) {
            if (newPassword !== confirmPassword) {
                setPasswordError('As senhas não coincidem.');
                return;
            }
            if (newPassword.length > 0 && newPassword.length < 6) {
                 setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
                return;
            }
        }
        
        if (formData) {
            const finalData = { ...formData };
            if (isChangingPassword && newPassword) {
                finalData.password = newPassword;
            }
            onSave(finalData);
        }
    };

    const footer = (
        <div className="flex justify-end gap-4">
             <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 text-white">Cancelar</button>
             <button type="submit" form="edit-company-form" className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Salvar Alterações</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar ${company?.name}`} footer={footer}>
            <form id="edit-company-form" onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-2 overflow-hidden border-2 border-gray-600">
                        {logoPreview ? <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" /> : <UploadCloud className="w-10 h-10 text-gray-500" />}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-500 hover:underline">Alterar logo</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                
                <label className="block text-sm font-medium text-gray-300 -mb-2">Nome da Empresa</label>
                <input name="name" value={formData.name} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                
                <label className="block text-sm font-medium text-gray-300 -mb-2">CNPJ</label>
                <input name="cnpj" value={formData.cnpj} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                
                <label className="block text-sm font-medium text-gray-300 -mb-2">Localização</label>
                <input name="location" value={formData.location} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                
                <label className="block text-sm font-medium text-gray-300 -mb-2">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                
                <label className="block text-sm font-medium text-gray-300 -mb-2">WhatsApp</label>
                <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />
                
                <label className="block text-sm font-medium text-gray-300 -mb-2">Usuário</label>
                <input name="username" value={formData.username} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full" required />

                <hr className="border-t border-gray-600 !my-6" />

                {isChangingPassword ? (
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-200">Alterar Senha</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                                    {showNewPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Nova Senha</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        {passwordError && <p className="text-sm text-red-500 text-center">{passwordError}</p>}
                        <button type="button" onClick={() => setIsChangingPassword(false)} className="text-sm text-blue-500 hover:underline w-full text-center">
                            Cancelar Alteração de Senha
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <button type="button" onClick={() => setIsChangingPassword(true)} className="py-2 px-5 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium transition-colors">
                            Alterar Senha
                        </button>
                    </div>
                )}
            </form>
        </Modal>
    );
};


export const ConfirmationModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    message: string;
    confirmButtonClass?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmButtonClass }) => {
    const footer = (
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
            <button onClick={onClose} className="w-full sm:w-auto py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 text-white">Cancelar</button>
            <button onClick={onConfirm} className={`w-full sm:w-auto py-2 px-4 rounded-lg text-white ${confirmButtonClass || 'bg-red-600 hover:bg-red-700'}`}>Confirmar</button>
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
            <p className="text-gray-300">{message}</p>
        </Modal>
    );
};

export const AddPostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; location: string; companyId: number; password: string }) => void;
    currentUser: Company | null;
    companies: Company[];
}> = ({ isOpen, onClose, onSave, currentUser, companies }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

    const isAdmin = currentUser?.username === 'admin';
    const availableCompanies = useMemo(() =>
        companies.filter(c => c.username !== 'admin'),
        [companies]
    );

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setName('');
            setLocation('');
            setPassword('');
            setShowPassword(false);
            // If admin, set default selection. If not admin, it's irrelevant.
            if (isAdmin && availableCompanies.length > 0) {
                setSelectedCompanyId(availableCompanies[0].id.toString());
            }
        }
    }, [isOpen, isAdmin, availableCompanies]);

    if (!isOpen || !currentUser) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const companyId = isAdmin ? parseInt(selectedCompanyId) : currentUser.id;
        if (!name || !location || !companyId || !password) {
            return;
        }
        onSave({ name, location, companyId, password });
    };

    const footer = (
        <div className="flex justify-end gap-4">
             <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 text-white">Cancelar</button>
             <button type="submit" form="add-post-form" className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Salvar Posto</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Novo Posto de Serviço" footer={footer}>
            <form id="add-post-form" onSubmit={handleSubmit} className="space-y-4">
                {isAdmin && (
                    <div>
                        <label htmlFor="company-select" className="block mb-2 text-sm font-medium text-gray-300">Empresa</label>
                        <select
                            id="company-select"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                            {availableCompanies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="post-name" className="block mb-2 text-sm font-medium text-gray-300">Nome do Posto</label>
                    <input
                        id="post-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Ex: Condomínio Residencial Plaza"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="post-location" className="block mb-2 text-sm font-medium text-gray-300">Localização</label>
                    <input
                        id="post-location"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Ex: São Paulo, SP"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="post-password-add" className="block mb-2 text-sm font-medium text-gray-300">Senha do Posto</label>
                    <div className="relative">
                        <input 
                            id="post-password-add"
                            type={showPassword ? 'text' : 'password'} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2.5 w-full pr-10" 
                            placeholder="••••••••"
                            required 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                            {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export const EditPostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (post: ServicePost) => void;
    post: ServicePost | null;
}> = ({ isOpen, onClose, onSave, post }) => {
    const [formData, setFormData] = useState<ServicePost | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    useEffect(() => {
        if (post) {
            setFormData(post);
            setShowPassword(false);
        }
    }, [post]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData) {
            onSave({ ...formData, companyId: Number(formData.companyId) });
        }
    };

    const footer = (
        <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 text-white">Cancelar</button>
            <button type="submit" form="edit-post-form" className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Salvar Alterações</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Posto: ${post?.name}`} footer={footer}>
            <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="edit-post-name" className="block mb-2 text-sm font-medium text-gray-300">Nome do Posto</label>
                    <input
                        id="edit-post-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="edit-post-location" className="block mb-2 text-sm font-medium text-gray-300">Localização</label>
                    <input
                        id="edit-post-location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="edit-post-password" className="block mb-2 text-sm font-medium text-gray-300">Senha do Posto</label>
                    <div className="relative">
                        <input
                            id="edit-post-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                            {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};


export const InfoModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string | React.ReactNode;
    buttonText?: string;
    autoCloseDelay?: number;
}> = ({ isOpen, onClose, title, message, buttonText = "Entendi", autoCloseDelay }) => {
    
    useEffect(() => {
        if (isOpen && autoCloseDelay) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoCloseDelay, onClose]);
    
    const footer = !autoCloseDelay ? (
        <div className="flex justify-end gap-4">
            <button onClick={onClose} className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                {buttonText}
            </button>
        </div>
    ) : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-600/20 mb-4">
                    <svg className="h-6 w-6 text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-gray-300 text-lg">{message}</p>
            </div>
        </Modal>
    );
};

export const CommentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (eventId: number, comment: string) => void;
    event: MonitoringEvent | null;
}> = ({ isOpen, onClose, onSave, event }) => {
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (event) {
            setComment(event.comment || '');
        }
    }, [event]);

    if (!isOpen || !event) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(event.id, comment);
    };
    
    const remainingChars = 100 - comment.length;

    const footer = (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className={`text-sm ${remainingChars < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {remainingChars} caracteres restantes
            </span>
            <div className="flex gap-4">
                <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 text-white">Cancelar</button>
                <button type="submit" form="comment-form" className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white" disabled={comment.length > 100}>Salvar</button>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Comentário para Evento #${event.id}`} footer={footer}>
            <form id="comment-form" onSubmit={handleSubmit}>
                <div>
                    <p className="mb-2 text-sm text-gray-300">
                        <strong>Posto:</strong> {event.postName}<br/>
                        <strong>Evento:</strong> {event.type}
                    </p>
                    <label htmlFor="comment-textarea" className="block mb-2 text-sm font-medium text-gray-300">Descreva o que aconteceu:</label>
                    <textarea
                        id="comment-textarea"
                        rows={4}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        maxLength={100}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Adicione um comentário..."
                    ></textarea>
                </div>
            </form>
        </Modal>
    );
};

export const TestEmailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: string) => void;
}> = ({ isOpen, onClose, onSend }) => {
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEmail('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSend(email);
    };

    const footer = (
        <button type="submit" form="test-email-form" className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            Enviar Email
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enviar Email de Teste" footer={footer}>
            <form id="test-email-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="test-email-input" className="block mb-2 text-sm font-medium text-gray-300">Email do Destinatário</label>
                    <input
                        id="test-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="exemplo@email.com"
                        required
                    />
                </div>
            </form>
        </Modal>
    );
};