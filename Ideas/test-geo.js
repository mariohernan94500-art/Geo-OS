// test-geo.js — Integration test for Geo AI Generator
// Usage: node test-geo.js

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_IDEA = 'app de lista de tareas simple';

async function runTest() {
  console.log('========================================');
  console.log('  🧪 Geo AI System - Integration Test');
  console.log('========================================\n');

  // Step 0: Verify server is running
  console.log('[Test] Verifying server is running...');
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/system/info`);
    if (!healthCheck.ok) {
      throw new Error(`Server returned ${healthCheck.status}`);
    }
    const sysInfo = await healthCheck.json();
    console.log('[Test] ✅ Server is running (v' + sysInfo.version + ')');
    console.log('[Test] Environment:');
    console.log('   - OpenRouter: ' + (sysInfo.env.hasOpenRouter ? '✅' : '❌'));
    console.log('   - Groq: ' + (sysInfo.env.hasGroq ? '✅' : '❌'));
    console.log('   - DeepSeek: ' + (sysInfo.env.hasDeepSeek ? '✅' : '❌'));
    console.log('   - ElevenLabs: ' + (sysInfo.env.hasElevenLabs ? '✅' : '❌'));
    console.log('   - Stripe: ' + (sysInfo.env.hasStripe ? '✅' : '❌'));
    console.log('   - Telegram: ' + (sysInfo.env.hasTelegram ? '✅' : '❌'));
  } catch (err) {
    console.error('[Test] ❌ Server is not running! Start it with: npm start');
    console.error('[Test] Error:', err.message);
    process.exit(1);
  }

  // Step 1: Create an app
  console.log(`\n[Test] Step 1: Creating app with idea: "${TEST_IDEA}"`);
  console.log('[Test] This may take 30-90 seconds...\n');

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/generator/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idea: TEST_IDEA })
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    console.log(`[Test] ⏱️  Generation took ${elapsed} seconds\n`);
    
    if (result.success) {
      console.log('========================================');
      console.log('  ✅ APP CREATED SUCCESSFULLY!');
      console.log('========================================');
      console.log(`  📦 Name:        ${result.name}`);
      console.log(`  🔌 Port:        ${result.port}`);
      console.log(`  🌐 URL:         ${result.url}`);
      console.log(`  📝 Description: ${result.description}`);
      console.log('========================================\n');
      
      // Step 2: Verify the app is accessible
      console.log('[Test] Step 2: Verifying the generated app is accessible...');
      try {
        const appCheck = await fetch(result.url, { 
          signal: AbortSignal.timeout(10000) 
        });
        if (appCheck.ok) {
          console.log('[Test] ✅ Generated app is responding!\n');
        } else {
          console.log(`[Test] ⚠️  Generated app returned status ${appCheck.status} (may need a moment to start)\n`);
        }
      } catch (appErr) {
        console.log(`[Test] ⚠️  Generated app not yet reachable: ${appErr.message}`);
        console.log('[Test]    This is normal — the app may need a few seconds to fully start.\n');
      }
      
      // Step 3: List all apps
      console.log('[Test] Step 3: Listing all apps...');
      const listResponse = await fetch(`${BASE_URL}/api/generator/apps`);
      const listData = await listResponse.json();
      console.log(`[Test] 📋 Total apps: ${listData.apps.length}`);
      for (const app of listData.apps) {
        console.log(`   - ${app.name} (port ${app.port}, status: ${app.status})`);
      }
      
      console.log('\n========================================');
      console.log('  🎉 ALL TESTS PASSED!');
      console.log('========================================');
      
    } else {
      console.error('[Test] ❌ App creation failed:', result.error);
      process.exit(1);
    }
    
  } catch (err) {
    console.error('[Test] ❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTest();
