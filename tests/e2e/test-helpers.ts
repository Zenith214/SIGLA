/**
 * Test helpers for E2E tests
 * Handles environment setup and common utilities
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { Page } from '@playwright/test';

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Supabase admin client for tests
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Test data constants
export const TEST_CYCLE_ID = 1;
export const TEST_BARANGAY_ID = 1;
export const TEST_BARANGAY_ID_2 = 2;

/**
 * Generate JWT token for test user
 */
export function generateToken(user: any): string {
  return jwt.sign(
    {
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Login user by setting cookie
 */
export async function loginUser(page: Page, user: any) {
  const token = generateToken(user);
  await page.context().addCookies([
    {
      name: 'pulse_token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    }
  ]);
}

/**
 * Setup test users with different roles
 */
export async function setupTestUsers() {
  const testUsers: any = {};

  // Create Officer user for barangay 1
  const { data: officer1, error: officer1Error } = await supabaseAdmin
    .from('user')
    .upsert({
      email: 'e2e.officer1@cpap.test',
      first_name: 'E2E',
      last_name: 'Officer1',
      role: 'Officer',
      barangay_id: TEST_BARANGAY_ID,
      password_hash: '$2a$10$test.hash.for.e2e.testing'
    }, { onConflict: 'email' })
    .select()
    .single();

  if (officer1Error && officer1Error.code !== '23505') {
    console.error('Error creating officer1:', officer1Error);
  }
  testUsers.officer1 = officer1 || (await supabaseAdmin
    .from('user')
    .select()
    .eq('email', 'e2e.officer1@cpap.test')
    .single()).data;

  // Create Officer user for barangay 2
  const { data: officer2, error: officer2Error } = await supabaseAdmin
    .from('user')
    .upsert({
      email: 'e2e.officer2@cpap.test',
      first_name: 'E2E',
      last_name: 'Officer2',
      role: 'Officer',
      barangay_id: TEST_BARANGAY_ID_2,
      password_hash: '$2a$10$test.hash.for.e2e.testing'
    }, { onConflict: 'email' })
    .select()
    .single();

  if (officer2Error && officer2Error.code !== '23505') {
    console.error('Error creating officer2:', officer2Error);
  }
  testUsers.officer2 = officer2 || (await supabaseAdmin
    .from('user')
    .select()
    .eq('email', 'e2e.officer2@cpap.test')
    .single()).data;

  // Create Admin user
  const { data: admin, error: adminError } = await supabaseAdmin
    .from('user')
    .upsert({
      email: 'e2e.admin@cpap.test',
      first_name: 'E2E',
      last_name: 'Admin',
      role: 'Admin',
      password_hash: '$2a$10$test.hash.for.e2e.testing'
    }, { onConflict: 'email' })
    .select()
    .single();

  if (adminError && adminError.code !== '23505') {
    console.error('Error creating admin:', adminError);
  }
  testUsers.admin = admin || (await supabaseAdmin
    .from('user')
    .select()
    .eq('email', 'e2e.admin@cpap.test')
    .single()).data;

  // Create FS user
  const { data: fs, error: fsError } = await supabaseAdmin
    .from('user')
    .upsert({
      email: 'e2e.fs@cpap.test',
      first_name: 'E2E',
      last_name: 'FS',
      role: 'FS',
      password_hash: '$2a$10$test.hash.for.e2e.testing'
    }, { onConflict: 'email' })
    .select()
    .single();

  if (fsError && fsError.code !== '23505') {
    console.error('Error creating fs:', fsError);
  }
  testUsers.fs = fs || (await supabaseAdmin
    .from('user')
    .select()
    .eq('email', 'e2e.fs@cpap.test')
    .single()).data;

  // Create Interviewer user
  const { data: interviewer, error: interviewerError } = await supabaseAdmin
    .from('user')
    .upsert({
      email: 'e2e.interviewer@cpap.test',
      first_name: 'E2E',
      last_name: 'Interviewer',
      role: 'Interviewer',
      password_hash: '$2a$10$test.hash.for.e2e.testing'
    }, { onConflict: 'email' })
    .select()
    .single();

  if (interviewerError && interviewerError.code !== '23505') {
    console.error('Error creating interviewer:', interviewerError);
  }
  testUsers.interviewer = interviewer || (await supabaseAdmin
    .from('user')
    .select()
    .eq('email', 'e2e.interviewer@cpap.test')
    .single()).data;

  return testUsers;
}

/**
 * Cleanup test users
 */
export async function cleanupTestUsers() {
  const testEmails = [
    'e2e.officer1@cpap.test',
    'e2e.officer2@cpap.test',
    'e2e.admin@cpap.test',
    'e2e.fs@cpap.test',
    'e2e.interviewer@cpap.test'
  ];

  await supabaseAdmin
    .from('user')
    .delete()
    .in('email', testEmails);
}

/**
 * Cleanup test CPAP data
 */
export async function cleanupTestData() {
  // Delete test CPAPs (cascade will handle items)
  await supabaseAdmin
    .from('cpaps')
    .delete()
    .in('barangay_id', [TEST_BARANGAY_ID, TEST_BARANGAY_ID_2]);
}
