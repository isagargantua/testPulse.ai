// Demo user seed script
// Run this once to create the demo user: admin123@testpulse.ai / admin1234
//
// Usage:
//   npm run seed:demo
//   Or with inline env:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-demo-user.ts

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

// Load env manually - try parent directories
function loadEnv() {
  const possiblePaths = [
    path.join(__dirname, '..', '..', '.env.local'),
    path.join(__dirname, '..', '..', '..', '.env.local'),
    path.join(process.cwd(), '.env.local'),
  ];

  for (const envPath of possiblePaths) {
    try {
      console.log('Trying:', envPath);
      const content = readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIndex = trimmed.indexOf('=');
          if (eqIndex > 0) {
            const key = trimmed.substring(0, eqIndex).trim();
            const value = trimmed.substring(eqIndex + 1).trim();
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      console.log('Loaded env from:', envPath);
      return;
    } catch {
      // Try next path
    }
  }
  console.log('Warning: No .env.local found, using existing env vars');
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  console.error('\nMake sure .env.local exists in the root directory');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedDemoUser() {
  console.log('Creating demo user...');

  const email = 'admin123@testpulse.ai';
  const password = 'admin1234';

  // Check if user already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u) => u.email === email);

  if (existingUser) {
    console.log(`Demo user ${email} already exists. Deleting...`);
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }

  // Create new demo user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'Demo Admin',
      is_demo_user: true,
    },
  });

  if (error) {
    console.error('Error creating demo user:', error.message);
    process.exit(1);
  }

  console.log(`✓ Demo user created successfully!`);
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  User ID: ${data.user.id}`);

  // Create a profile for the demo user
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: data.user.id,
    full_name: 'Demo Admin',
    timezone: 'UTC',
    preferences: {},
  });

  if (profileError) {
    console.warn('Profile creation skipped (table may not exist yet):', profileError.message);
  } else {
    console.log('✓ Profile created');
  }

  // Create a demo project with sample data
  const { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .insert({
      user_id: data.user.id,
      name: 'Demo Project',
      slug: 'demo-project',
      description: 'A demo project showcasing TestPulse features',
      framework: 'playwright',
      status: 'active',
    })
    .select()
    .single();

  if (projectError) {
    console.warn('Demo project creation skipped:', projectError.message);
  } else {
    console.log('✓ Demo project created');

    // Add sample failures
    const sampleFailures = [
      {
        project_id: project.id,
        title: 'Login button not found after page load',
        description: 'The login button selector fails intermittently on slow networks',
        framework: 'playwright',
        failure_category: 'locator_instability',
        error_message: 'TimeoutError: locator("//button[contains(text(),\'Login\')]") did not appear within 5000ms',
        test_name: 'login.spec.ts',
        test_file: 'tests/login.spec.ts',
        line_number: 42,
        browser: 'chromium',
        os: 'windows',
        retry_count: 2,
        is_flaky: true,
        flakiness_score: 0.75,
        raw_data: { stack: '...', logs: '...' },
      },
      {
        project_id: project.id,
        title: 'API timeout on dashboard fetch',
        description: 'Dashboard API calls timing out when server is under load',
        framework: 'playwright',
        failure_category: 'timeout',
        error_message: 'Request timeout: API call exceeded 30s limit',
        test_name: 'dashboard.spec.ts',
        test_file: 'tests/dashboard.spec.ts',
        line_number: 78,
        browser: 'firefox',
        os: 'linux',
        retry_count: 1,
        is_flaky: false,
        flakiness_score: 0.3,
        raw_data: { stack: '...', logs: '...' },
      },
      {
        project_id: project.id,
        title: 'Stale element reference in product list',
        description: 'Product list re-renders causing stale element references',
        framework: 'selenium',
        failure_category: 'stale_element',
        error_message: 'StaleElementReferenceException: Element is no longer attached to DOM',
        test_name: 'ProductListTest.java',
        test_file: 'src/test/java/com/example/ProductListTest.java',
        line_number: 156,
        browser: 'chrome',
        os: 'macos',
        retry_count: 3,
        is_flaky: true,
        flakiness_score: 0.85,
        raw_data: { stack: '...', logs: '...' },
      },
      {
        project_id: project.id,
        title: 'Modal overlay blocking interaction',
        description: 'Cookie consent modal appearing and blocking test interactions',
        framework: 'playwright',
        failure_category: 'overlay',
        error_message: 'Actionability check failed: element is obscured by another element',
        test_name: 'checkout.spec.ts',
        test_file: 'tests/checkout.spec.ts',
        line_number: 89,
        browser: 'chromium',
        os: 'windows',
        retry_count: 0,
        is_flaky: false,
        flakiness_score: 0.1,
        raw_data: { stack: '...', logs: '...' },
      },
      {
        project_id: project.id,
        title: 'Network request failed on file upload',
        description: 'File upload API returning 500 on concurrent uploads',
        framework: 'cypress',
        failure_category: 'api_failure',
        error_message: 'cy.intercept() - Route handler threw an error: Internal Server Error',
        test_name: 'upload.spec.ts',
        test_file: 'cypress/e2e/upload.spec.ts',
        line_number: 67,
        browser: 'electron',
        os: 'windows',
        retry_count: 2,
        is_flaky: true,
        flakiness_score: 0.65,
        raw_data: { stack: '...', logs: '...' },
      },
    ];

    const { error: failuresError } = await supabaseAdmin.from('failures').insert(sampleFailures);

    if (failuresError) {
      console.warn('Sample failures creation skipped:', failuresError.message);
    } else {
      console.log(`✓ ${sampleFailures.length} sample failures created`);
    }
  }

  console.log('\n✅ Demo user setup complete!');
  console.log('\nYou can now login with:');
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

seedDemoUser().catch(console.error);