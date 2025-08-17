'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function StatusPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Test connection
      const { data: testData, error: testError } = await supabase
        .from('car_sales_sessions')
        .select('count')
        .limit(1);
      
      if (testError) {
        setConnectionStatus('❌ Database connection failed');
      } else {
        setConnectionStatus('✅ Database connected');
      }

      // Get recent sessions
      const { data, error } = await supabase
        .from('car_sales_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CopilotKit + Supabase Integration Status</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg">{connectionStatus}</p>
        </div>

        {/* Integration Checklist */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Integration Progress</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Supabase client configured</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Global state with sessionId</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Contact info saves to database</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⏳</span>
              <span>Car selection persistence (pending)</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⏳</span>
              <span>Financing info persistence (pending)</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⏳</span>
              <span>Payment info persistence (pending)</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⏳</span>
              <span>Order confirmation persistence (pending)</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
          {loading ? (
            <p>Loading...</p>
          ) : sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Session ID</th>
                    <th className="text-left py-2">Stage</th>
                    <th className="text-left py-2">Contact ✓</th>
                    <th className="text-left py-2">Car ✓</th>
                    <th className="text-left py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b">
                      <td className="py-2 text-sm font-mono">
                        {session.session_id?.substring(0, 20)}...
                      </td>
                      <td className="py-2">{session.current_stage}</td>
                      <td className="py-2">
                        {session.contact_info_completed ? '✅' : '⏳'}
                      </td>
                      <td className="py-2">
                        {session.car_built ? '✅' : '⏳'}
                      </td>
                      <td className="py-2 text-sm">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No sessions found. Start using the app to create sessions.</p>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 space-x-4">
          <a href="/" className="text-blue-600 hover:underline">← Back to App</a>
          <a href="/test-supabase" className="text-blue-600 hover:underline">Test Connection</a>
        </div>
      </div>
    </div>
  );
}
