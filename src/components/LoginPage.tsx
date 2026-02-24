// ============================================
// LOGIN PAGE - Lale Studio
// Tylko logowanie - konta zakłada admin przez Supabase panel
// Whitelist emaili - tylko uprawnione osoby mogą się zalogować
// ============================================

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react';

// Lista dozwolonych emaili z .env (oddzielone przecinkami)
const ALLOWED_EMAILS: string[] = (import.meta.env.VITE_ALLOWED_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

interface LoginPageProps {
    onSignIn: (email: string, password: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        // Sprawdź whitelist (jeśli ustawiona)
        if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email.toLowerCase())) {
            setError('Nie masz dostępu do tej aplikacji. Skontaktuj się z administratorem.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSignIn(email, password);
        } catch (err: any) {
            const msg = err?.message || '';
            if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
                setError('Nieprawidłowy email lub hasło.');
            } else if (msg.includes('Email not confirmed')) {
                setError('Potwierdź email przed zalogowaniem.');
            } else {
                setError(msg || 'Wystąpił błąd. Spróbuj ponownie.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative blobs */}
            <div style={{
                position: 'absolute', top: '-100px', right: '-100px',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-80px', left: '-80px',
                width: '300px', height: '300px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Card */}
            <div style={{
                width: '100%', maxWidth: '400px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '48px 40px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d97706, #92400e)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 32px rgba(245,158,11,0.3)',
                        fontSize: '28px', color: 'white',
                        fontFamily: 'Georgia, serif', fontWeight: 'bold',
                    }}>
                        L
                    </div>
                    <h1 style={{
                        color: 'white', fontSize: '26px', fontWeight: '700',
                        letterSpacing: '0.08em', fontFamily: 'Georgia, serif',
                        margin: '0 0 6px',
                    }}>
                        LALE STUDIO
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.35)', fontSize: '11px',
                        margin: 0, letterSpacing: '0.15em', textTransform: 'uppercase',
                    }}>
                        Etsy Strategy 2026
                    </p>
                </div>

                {/* Access badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '8px', padding: '8px 12px', marginBottom: '28px',
                }}>
                    <Shield size={12} style={{ color: '#d97706' }} />
                    <span style={{ color: 'rgba(245,158,11,0.8)', fontSize: '11px', letterSpacing: '0.05em' }}>
                        Dostęp tylko dla uprawnionych użytkowników
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                        <AlertCircle size={14} style={{ color: '#f87171', marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Email */}
                    <div>
                        <label style={{
                            display: 'block', color: 'rgba(255,255,255,0.5)',
                            fontSize: '11px', marginBottom: '8px', letterSpacing: '0.08em',
                        }}>
                            EMAIL
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="twoj@email.com"
                            required
                            style={{
                                width: '100%', padding: '14px 16px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '12px', color: 'white',
                                fontSize: '14px', outline: 'none',
                                boxSizing: 'border-box', transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{
                            display: 'block', color: 'rgba(255,255,255,0.5)',
                            fontSize: '11px', marginBottom: '8px', letterSpacing: '0.08em',
                        }}>
                            HASŁO
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%', padding: '14px 48px 14px 16px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '12px', color: 'white',
                                    fontSize: '14px', outline: 'none',
                                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                                    cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        style={{
                            marginTop: '4px',
                            padding: '15px',
                            background: loading || !email || !password
                                ? 'rgba(245,158,11,0.2)'
                                : 'linear-gradient(135deg, #d97706, #b45309)',
                            border: 'none', borderRadius: '12px',
                            color: loading || !email || !password ? 'rgba(255,255,255,0.3)' : 'white',
                            fontSize: '14px', fontWeight: '700',
                            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            letterSpacing: '0.05em',
                            boxShadow: loading || !email || !password ? 'none' : '0 4px 20px rgba(217,119,6,0.35)',
                        }}
                    >
                        {loading
                            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Logowanie...</>
                            : '→ Zaloguj się'
                        }
                    </button>
                </form>

                <p style={{
                    textAlign: 'center', marginTop: '24px', marginBottom: 0,
                    color: 'rgba(255,255,255,0.15)', fontSize: '11px',
                }}>
                    Nie masz dostępu? Skontaktuj się z&nbsp;administratorem.
                </p>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
      `}</style>
        </div>
    );
};
