'use client';
import { useEffect, useState } from 'react';
import { testConnection } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [details, setDetails] = useState<string>('');
  
  useEffect(() => {
    const test = async () => {
      try {
        const connected = await testConnection();
        if (connected) {
          setStatus('✅ Connected to Supabase!');
          setDetails('Database connection successful. Ready for integration.');
        } else {
          setStatus('❌ Connection failed');
          setDetails('Check your Supabase credentials in .env file');
        }
      } catch (error) {
        setStatus('❌ Error');
        setDetails(String(error));
      }
    };
    
    test();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <p className="text-lg">{status}</p>
          {details && <p className="text-gray-600 mt-2">{details}</p>}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium">SUPABASE_URL:</span>{' '}
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
              </span>
            </li>
            <li>
              <span className="font-medium">SUPABASE_ANON_KEY:</span>{' '}
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </span>
            </li>
          </ul>
        </div>
        
        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:underline">← Back to main app</a>
        </div>
      </div>
    </div>
  );
}
