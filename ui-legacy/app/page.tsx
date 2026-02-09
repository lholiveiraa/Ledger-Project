"use client";

import { useEffect, useState } from "react";
import { Activity, Box, Database, Play, Square, Terminal, RefreshCw } from "lucide-react";

const AGENT_API = "http://localhost:8080/api";

export default function Home() {
  const [containers, setContainers] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${AGENT_API}/status`);
      const data = await res.json();
      setContainers(data.containers || []);
    } catch (e) {
      console.error("Agent offline?", e);
    }
  };

  const fetchLogs = async (service: string) => {
    try {
      const res = await fetch(`${AGENT_API}/logs?service=${service}`);
      const text = await res.text();
      setLogs(text);
    } catch (e) {
      setLogs("Error fetching logs");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchLogs(selectedService);
      const interval = setInterval(() => fetchLogs(selectedService), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedService]);

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Box className="text-blue-400" /> WorkOps Dashboard
          </h1>
          <p className="text-gray-400">Local Environment Manager</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
            onClick={() => alert("Use CLI 'workops up' to start full stack")}
          >
            <Play size={16} /> CLI Only
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} /> Running Services
          </h2>
          {containers.length === 0 ? (
            <div className="text-gray-500 italic">No active containers found. Run 'workops up'.</div>
          ) : (
            <ul className="space-y-2">
              {containers.map((name) => (
                <li 
                  key={name}
                  onClick={() => setSelectedService(name)}
                  className={`p-3 rounded cursor-pointer flex justify-between items-center ${
                    selectedService === name ? "bg-blue-900 border border-blue-500" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <span className="font-mono text-sm">{name}</span>
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Resources & Env (Mocked for MVP) */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database size={20} /> Resources & Config
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-700 p-3 rounded">
              <h3 className="text-sm font-bold text-gray-300 mb-1">Database (Postgres)</h3>
              <p className="text-xs font-mono text-gray-400">localhost:5432</p>
              <p className="text-xs font-mono text-gray-400">Vol: local-container</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <h3 className="text-sm font-bold text-gray-300 mb-1">Environment</h3>
              <p className="text-xs font-mono text-gray-400">ENV=development</p>
              <p className="text-xs font-mono text-gray-400">DEBUG=true</p>
            </div>
          </div>
        </div>

        {/* Logs Console */}
        <div className="bg-gray-800 rounded-lg p-6 md:col-span-3 lg:col-span-1 h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Terminal size={20} /> Logs: {selectedService || "Select a service"}
          </h2>
          <div className="bg-black rounded p-4 flex-1 overflow-auto font-mono text-xs text-green-400 whitespace-pre-wrap">
            {selectedService ? (logs || "No logs available...") : "Select a service to view live logs..."}
          </div>
        </div>
      </div>
    </main>
  );
}
