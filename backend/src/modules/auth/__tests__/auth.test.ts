import { AuthService } from '../auth.service.js';
import { AuthRepository } from '../auth.repository.js';
import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('AuthService', () => {
    let service: AuthService;
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            createUser: async () => ({}),
            createProfile: async () => ({}),
            signInWithPassword: async () => ({})
        };
        service = new AuthService(mockRepo as unknown as AuthRepository);
    });

    it('should register user successfully', async () => {
        mockRepo.createUser = async () => ({
            data: { user: { id: '123', email: 'test@example.com' } },
            error: null
        });
        mockRepo.createProfile = async () => ({ error: null });

        const result = await service.registerUser({
            email: 'test@example.com',
            password: 'password123',
            role: 'eoc'
        });

        assert.equal(result.id, '123');
        assert.equal(result.email, 'test@example.com');
        assert.equal(result.role, 'eoc');
    });

    it('should throw validation error on invalid email', async () => {
        await assert.rejects(
            async () => {
                await service.registerUser({
                    email: 'not-an-email',
                    password: 'password123'
                });
            },
            /Validation failed/
        );
    });

    it('should login successfully', async () => {
        mockRepo.signInWithPassword = async () => ({
            data: { user: { id: '123' }, session: { access_token: 'abc' } },
            error: null
        });

        const result = await service.loginUser({
            email: 'test@example.com',
            password: 'password123'
        });

        assert.equal(result.user.id, '123');
        assert.equal(result.session.access_token, 'abc');
    });
});
