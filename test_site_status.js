async function testSiteStatus() {
  console.log('🔍 Checking Website Local & Vercel Availability...\n');

  try {
    const resLocalDev = await fetch('http://localhost:5173/');
    console.log('✅ Local Dev Server (5173) status:', resLocalDev.status);
  } catch (err) {
    try {
      const resLocalDev2 = await fetch('http://localhost:5174/');
      console.log('✅ Local Dev Server (5174) status:', resLocalDev2.status);
    } catch (err2) {
      console.error('❌ Local Dev Server not responding:', err2.message);
    }
  }

  try {
    const resLocalApi = await fetch('http://localhost:5000/api/health');
    const jsonLocalApi = await resLocalApi.json();
    console.log('✅ Local Express API status:', resLocalApi.status, jsonLocalApi);
  } catch (err) {
    console.error('❌ Local Express API (5000) error:', err.message);
  }

  try {
    const resVercelPage = await fetch('https://student-bustrack.vercel.app/');
    console.log('✅ Live Vercel Page status:', resVercelPage.status);
    const htmlSnippet = await resVercelPage.text();
    console.log('Vercel HTML snippet:', htmlSnippet.slice(0, 200));
  } catch (err) {
    console.error('❌ Live Vercel Page fetch error:', err.message);
  }

  try {
    const resVercelApi = await fetch('https://student-bustrack.vercel.app/api/health');
    console.log('✅ Live Vercel API status:', resVercelApi.status);
    const apiSnippet = await resVercelApi.text();
    console.log('Vercel API snippet:', apiSnippet);
  } catch (err) {
    console.error('❌ Live Vercel API fetch error:', err.message);
  }
}

testSiteStatus();
