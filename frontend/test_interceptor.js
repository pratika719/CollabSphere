import api from './src/api/axios.js';
import { appEvents } from './src/utils/eventEmitter.js';

// Configure api baseURL to point directly to backend for testing in Node
api.defaults.baseURL = 'http://localhost:3000/api/v1';

async function runTest() {
    console.log("=== Testing Frontend Axios Interceptor ===");

    appEvents.on('auth:clear', () => {
        console.log("[EVENT] auth:clear emitted");
    });

    try {
        console.log("Making request to /workspaces without valid session...");
        await api.get("/workspaces");
        console.log("Success! (Unexpected if no cookies are set)");
    } catch (err) {
        console.log(`Request failed as expected: ${err.message}`);
        console.log(`Error Response Status: ${err.response?.status}`);
        console.log(`Error Response Data:`, err.response?.data);
    }
}

runTest().catch(err => console.error("Test execution error:", err));
