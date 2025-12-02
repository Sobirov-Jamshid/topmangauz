"use client";

import React, { useState } from 'react';
import apiClient, { getTokens } from '@/lib/api/axios';

/**
 * Notification Debug Component
 * Use this to test and debug notification API endpoints
 * Only use in development!
 */
export default function NotificationDebug() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/notifications/');
      setResult({
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setResult({
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const testMarkAsRead = async (id: string) => {
    if (!id) {
      setError('Please provide notification ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/notifications/${id}/`);
      setResult({
        status: response.status,
        data: response.data,
      });
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setResult({
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = () => {
    const tokens = getTokens();
    setResult({
      hasAccess: !!tokens.access,
      hasRefresh: !!tokens.refresh,
      expiry: tokens.expiry ? new Date(tokens.expiry).toISOString() : null,
      isExpired: tokens.expiry ? tokens.expiry < Date.now() : null,
    });
  };

  const [testId, setTestId] = useState('');

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black border-2 border-[#ff9900] rounded-lg p-4 max-w-md shadow-2xl">
      <h3 className="text-white font-bold mb-3 text-lg">🔍 Notification Debug</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testGetNotifications}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#ff9900] text-black rounded hover:bg-[#ff6600] transition-colors font-medium disabled:opacity-50"
        >
          Test GET /notifications/
        </button>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            placeholder="Notification ID"
            className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white text-sm"
          />
          <button
            onClick={() => testMarkAsRead(testId)}
            disabled={loading || !testId}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-medium disabled:opacity-50 text-sm"
          >
            Test Read
          </button>
        </div>
        
        <button
          onClick={checkAuth}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors font-medium"
        >
          Check Auth Tokens
        </button>
      </div>

      {loading && (
        <div className="text-[#ff9900] text-sm mb-2">Loading...</div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded p-2 mb-2">
          <p className="text-red-500 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded p-3 max-h-96 overflow-auto">
          <pre className="text-xs text-white whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

