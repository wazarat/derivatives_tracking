const fetch = require('node-fetch');

async function testSupabaseRest() {
  const url = 'https://jmwcmthgtazgzxfqtrpn.supabase.co/rest/v1/dex_derivatives_instruments';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2NtdGhndGF6Z3p4ZnF0cnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU2ODEsImV4cCI6MjA2ODI5MTY4MX0.X61P7TPVZIRiQB8GZPfJ95CmYfIwMFttokxwMX6C4y8';
  
  const params = new URLSearchParams({
    select: 'exchange,symbol,contract_type,vol24h,price,symbol_base,symbol_quote',
    order: 'ts.desc,exchange.asc,vol24h.desc',
    limit: '10'
  });
  
  const fullUrl = `${url}?${params.toString()}`;
  
  console.log('Testing Supabase REST API endpoint...');
  console.log('URL:', fullUrl);
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Data count:', data.length);
      if (data.length > 0) {
        console.log('Sample record:', JSON.stringify(data[0], null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testSupabaseRest();
