'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Copy, Check, LogIn } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  { role: 'Owner', email: 'owner@zoox-ps.com', password: 'ZooxOwner@2026', color: 'text-warning' },
  { role: 'Manager', email: 'manager@zoox-ps.com', password: 'ZooxMgr@2026', color: 'text-info' },
  { role: 'Staff', email: 'staff@zoox-ps.com', password: 'ZooxStaff@2026', color: 'text-accent' },
  { role: 'Customer', email: 'ahmed.k@gmail.com', password: 'AhmedK@2026', color: 'text-primary' },
];

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

export default function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // Backend integration point: POST /api/auth/login with { email, password }
    await new Promise((r) => setTimeout(r, 1200));
    const valid = demoAccounts.find((a) => a.email === data.email && a.password === data.password);
    if (!valid) {
      setError('email', {
        message: t('Invalid credentials — use the demo accounts below to sign in'),
      });
      setIsLoading(false);
      return;
    }
    // Redirect based on role
    window.location.href = '/';
    setIsLoading(false);
  };

  const fillCredentials = (account: DemoAccount) => {
    setValue('email', account.email);
    setValue('password', account.password);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary">Z</span>
          </div>
          <span className="font-bold text-lg text-foreground">Zoox</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('Welcome back')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('Sign in to your Zoox dashboard')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            {t('Email address')}
          </label>
          <input
            type="email"
            className={`input-field ${errors.email ? 'border-danger focus:ring-danger/50' : ''}`}
            placeholder="you@zoox-ps.com"
            {...register('email', {
              required: t('Email is required'),
              pattern: { value: /^\S+@\S+\.\S+$/, message: t('Enter a valid email') },
            })}
          />
          {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            {t('Password')}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input-field pr-10 ${errors.password ? 'border-danger focus:ring-danger/50' : ''}`}
              placeholder="••••••••••"
              {...register('password', {
                required: t('Password is required'),
                minLength: { value: 6, message: t('Password must be at least 6 characters') },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border bg-input accent-primary"
              {...register('remember')}
            />
            <span className="text-sm text-muted-foreground">{t('Remember me')}</span>
          </label>
          <button type="button" className="text-sm text-primary font-semibold hover:underline">
            {t('Forgot password?')}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full h-11 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={16} />
              {t('Sign In')}
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('New to Zoox?')}{' '}
        <button onClick={onSwitchToSignUp} className="text-primary font-semibold hover:underline">
          {t('Create an account')}
        </button>
      </p>

      {/* Demo credentials */}
      <div className="mt-8 p-4 bg-muted/50 border border-border rounded-xl">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          {t('Demo Accounts')}
        </p>
        <div className="space-y-2">
          {demoAccounts.map((account) => (
            <div
              key={`demo-${account.role}`}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
              onClick={() => fillCredentials(account)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-bold w-16 flex-shrink-0 ${account.color}`}>
                  {t(account.role)}
                </span>
                <span className="text-xs text-muted-foreground truncate">{account.email}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(account.email, `email-${account.role}`);
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title={t('Copy email')}
                >
                  {copiedField === `email-${account.role}` ? (
                    <Check size={11} className="text-accent" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
                <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('Use →')}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('Click any row to autofill credentials')}
        </p>
      </div>
    </div>
  );
}
