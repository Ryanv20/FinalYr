"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import { apiClient } from '@/services/apiClient';

export default function RegisterScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'civilian' as 'eoc' | 'pho' | 'institution' | 'civilian',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const { data } = await apiClient.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            if (data.user) {
                if (data.session?.access_token) {
                    localStorage.setItem('token', data.session.access_token);
                    router.push('/dashboard');
                } else {
                    router.push('/login');
                }
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.id]: e.target.value
        }));
    }

    return (
        <AuthLayout
            heading="Create an account"
            subheading="Start building your next big thing."
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                        {errorMsg}
                    </div>
                )}

                <div className="flex gap-4">
                    <Input
                        id="firstName"
                        label="First name"
                        type="text"
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="lastName"
                        label="Last name"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Input
                    id="email"
                    label="Email address"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <div className="w-full space-y-2 text-left">
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                        Account Role
                    </label>
                    <div className="relative">
                        <select
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border text-slate-900 border-slate-200 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e52f1]/20 focus:border-[#1e52f1] appearance-none"
                            required
                        >
                            <option value="civilian">Civilian (Level 0)</option>
                            <option value="institution">Institution (Level 1)</option>
                            <option value="pho">Public Health Officer (Level 2)</option>
                            <option value="eoc">EOC Admin (Level 3)</option>
                        </select>
                        {/* Custom dropdown arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <Input
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <Button type="submit" fullWidth disabled={isLoading}>
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                        </span>
                    ) : (
                        'Create account'
                    )}
                </Button>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-[#1e52f1] hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>

        </AuthLayout>
    );
}
