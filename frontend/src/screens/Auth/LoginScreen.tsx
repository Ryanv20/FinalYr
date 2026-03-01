"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import { apiClient } from '@/services/apiClient';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const { data } = await apiClient.post('/auth/login', { email, password });
            if (data.session?.access_token) {
                localStorage.setItem('token', data.session.access_token);
                // Add minimal user routing based on role later, for now go to dashboard
                router.push('/dashboard');
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || 'Failed to sign in. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            heading="Welcome back"
            subheading="Enter your credentials to access your account."
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                        {errorMsg}
                    </div>
                )}

                <Input
                    label="Email address"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className="flex justify-end pt-1">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-[#1e52f1] hover:text-[#123bb5] hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button type="submit" fullWidth disabled={isLoading}>
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </span>
                    ) : (
                        'Sign in'
                    )}
                </Button>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-[#1e52f1] hover:underline">
                        Create account
                    </Link>
                </p>
            </div>

        </AuthLayout>
    );
}
