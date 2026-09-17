import React, { useState } from 'react';

function App() {
  const [logs, setLogs] = useState([]);
  const [cart] = useState([undefined]); // Defect trigger: uninitialized cart item

  const appendLog = (msg) => setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  // Original Bug 1: TypeError on cart reduce
  const testNullCrash = async () => {
    appendLog("Dispatching POST /api/orders/calculate with empty item...");
    try {
      const res = await fetch('http://localhost:5050/api/orders/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      const data = await res.json();
      appendLog(`Response: ${JSON.stringify(data)}`);
    } catch (err) {
      appendLog(`Error: ${err.message}`);
    }
  };

  // Original Bug 2: Blocking CPU loop
  const testCpuBurn = async () => {
    appendLog("Invoking blocking compute loop (5000ms core burn)...");
    try {
      const res = await fetch('http://localhost:5050/api/debug/cpu-burn');
      const data = await res.json();
      appendLog(`Completed: ${JSON.stringify(data)}`);
    } catch (err) {
      appendLog(`Error: ${err.message}`);
    }
  };

  // Original Bug 3: Missing customerId rejection
  const testUnhandledRejection = async () => {
    appendLog("Sending invalid customer payload (POST /api/orders/create)...");
    try {
      await fetch('http://localhost:5050/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (err) {
      appendLog(`Client catch: ${err.message}`);
    }
  };

  // New Bug 1: Numeric discount trim crash
  const testDiscountCrash = async () => {
    appendLog("Sending numeric discount to trigger .trim() crash (POST /api/orders/discount)...");
    try {
      const res = await fetch('http://localhost:5050/api/orders/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: "SPRING20", discountPercent: 20 })
      });
      const data = await res.json();
      appendLog(`Response: ${JSON.stringify(data)}`);
    } catch (err) {
      appendLog(`Discount Error: ${err.message}`);
    }
  };

  // New Bug 2: Null dereference on user address zipcode
  const testUserProfileCrash = async () => {
    appendLog("Sending empty user payload to trigger address.zipcode crash (POST /api/users/profile)...");
    try {
      const res = await fetch('http://localhost:5050/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: {} })
      });
      const data = await res.json();
      appendLog(`Response: ${JSON.stringify(data)}`);
    } catch (err) {
      appendLog(`Profile Error: ${err.message}`);
    }
  };

  // New Bug 3: Cancel order unhandled rejection
  const testCancelOrderRejection = async () => {
    appendLog("Sending empty orderId to trigger unhandled cancel rejection (POST /api/orders/cancel)...");
    try {
      const res = await fetch('http://localhost:5050/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      appendLog(`Response: ${JSON.stringify(data)}`);
    } catch (err) {
      appendLog(`Cancel Error: ${err.message}`);
    }
  };

  // New Bug 4: Hanging request deadlock with client-side timeout abort
  const testHangingDeadlock = async () => {
    appendLog("Sending invalid gift card to trigger hanging socket deadlock (POST /api/orders/giftcard/verify)...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // Abort after 4s to demonstrate hanging socket

    try {
      await fetch('http://localhost:5050/api/orders/giftcard/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardCode: "INVALID_CODE" }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      appendLog("Request resolved (unexpected).");
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        appendLog("⚠️ Request timed out after 4000ms: Route deadlocked without returning a response!");
      } else {
        appendLog(`Deadlock Error: ${err.message}`);
      }
    }
  };

  return (
    <div style={{ maxWidth: 850, margin: '40px auto', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h2>🧪 Faulty MERN App Testbed</h2>
        <p style={{ color: '#94a3b8' }}>Generate live runtime bugs and deadlocks for the autonomous L2/L3 diagnostic agent.</p>
        
        {/* Core Baseline Bugs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '16px 0' }}>
          <button 
            onClick={testNullCrash} 
            style={{ padding: '10px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            💥 TypeError: Cart
          </button>
          <button 
            onClick={testCpuBurn} 
            style={{ padding: '10px 14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            🔥 CPU Saturation Burn
          </button>
          <button 
            onClick={testUnhandledRejection} 
            style={{ padding: '10px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            🛑 Unhandled Rejection (Create)
          </button>
        </div>

        {/* Newly Added Deliberate Defects */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          <button 
            onClick={testDiscountCrash} 
            style={{ padding: '10px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            💥 TypeError: Discount .trim()
          </button>
          <button 
            onClick={testUserProfileCrash} 
            style={{ padding: '10px 14px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            💥 TypeError: User Zipcode
          </button>
          <button 
            onClick={testCancelOrderRejection} 
            style={{ padding: '10px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            🛑 Unhandled Rejection (Cancel)
          </button>
          <button 
            onClick={testHangingDeadlock} 
            style={{ padding: '10px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            ⏳ Hanging Route Deadlock
          </button>
        </div>

        <h4>Application Event Telemetry</h4>
        <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '14px', minHeight: '180px', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto', maxHeight: '280px' }}>
          {logs.length === 0 ? (
            <span style={{ color: '#64748b' }}>No actions dispatched. Click a trigger button above.</span>
          ) : (
            logs.map((item, idx) => <div key={idx} style={{ padding: '2px 0' }}>{item}</div>)
          )}
        </div>
      </div>
    </div>
  );
}

export default App;