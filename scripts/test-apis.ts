import { loadEnvConfig } from '@next/env';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
}

async function testAPI(endpoint: string, method: string = 'GET', body?: any): Promise<TestResult> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (response.ok && data.success) {
      return {
        endpoint,
        success: true,
        data: data.data,
        count: Array.isArray(data.data) ? data.data.length : 1,
      };
    } else {
      return {
        endpoint,
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      endpoint,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Trading Journal APIs...\n');

  const tests: Array<{ name: string; endpoint: string; method?: string }> = [
    { name: 'Users API', endpoint: '/api/users' },
    { name: 'Accounts API', endpoint: '/api/accounts' },
    { name: 'Strategies API', endpoint: '/api/strategies' },
    { name: 'Trades API', endpoint: '/api/trades' },
    { name: 'Journal Entries API', endpoint: '/api/journal-entries' },
    { name: 'Performance Metrics API', endpoint: '/api/performance-metrics' },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    const result = await testAPI(test.endpoint, test.method || 'GET');
    results.push(result);

    if (result.success) {
      console.log(`✅ ${test.name}: ${result.count} records found`);
    } else {
      console.log(`❌ ${test.name}: ${result.error}`);
    }
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log('================');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\n📈 Data Found:');
    successful.forEach(result => {
      console.log(`  - ${result.endpoint}: ${result.count} records`);
    });
  }

  if (failed.length > 0) {
    console.log('\n⚠️ Failed Tests:');
    failed.forEach(result => {
      console.log(`  - ${result.endpoint}: ${result.error}`);
    });
  }

  // Test creating a new account
  console.log('\n🔧 Testing CREATE operations...');
  const createAccountTest = await testAPI('/api/accounts', 'POST', {
    userId: '69c1194ba84c42e638b96e03', // Demo user from seeded data
    name: 'Test API Account',
    broker: 'Test Broker',
    accountType: 'DEMO',
    initialBalance: 5000,
    currency: 'USD',
  });

  if (createAccountTest.success) {
    console.log('✅ CREATE Account: Success');
    console.log(`   Created account: ${createAccountTest.data?.name}`);
  } else {
    console.log('❌ CREATE Account: Failed');
    console.log(`   Error: ${createAccountTest.error}`);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Helper function to test specific endpoints with filters
async function testFilters() {
  console.log('\n🔍 Testing API Filters...');

  // Test trades with status filter
  const openTradesResult = await testAPI('/api/trades?status=OPEN');
  console.log(`Open Trades: ${openTradesResult.success ? openTradesResult.count : 'Failed'}`);

  // Test trades with direction filter
  const longTradesResult = await testAPI('/api/trades?direction=LONG');
  console.log(`Long Trades: ${longTradesResult.success ? longTradesResult.count : 'Failed'}`);

  // Test journal entries with type filter
  const dailyEntriesResult = await testAPI('/api/journal-entries?entryType=DAILY');
  console.log(`Daily Journal Entries: ${dailyEntriesResult.success ? dailyEntriesResult.count : 'Failed'}`);
}

// Main execution
async function main() {
  console.log('🚀 Starting API Tests...');
  console.log('Make sure the Next.js server is running on port 3000\n');

  try {
    await runTests();
    await testFilters();

    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('💥 Test execution failed:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { testAPI, runTests };
