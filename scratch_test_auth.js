// Use native fetch (Node 18+)
async function runFullLifecycleTest() {
    console.log("=== Running Full Auth Lifecycle Test ===");

    // 1. Register or Login
    console.log("\n1. Logging in...");
    let res = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
        })
    });

    let cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
    
    if (res.status !== 200) {
        console.log("Login failed. Registering new user...");
        res = await fetch('http://localhost:3000/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Lifecycle User',
                email: `test_lifecycle_${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
        console.log(`Register Status: ${res.status}`);
    } else {
        console.log(`Login Status: ${res.status}`);
    }

    if (!cookies || cookies.length === 0) {
        console.error("Failed to obtain cookies!");
        return;
    }

    let cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    console.log(`Initial Cookies: ${cookieHeader}`);

    // 2. Make authenticated request
    console.log("\n2. Fetching workspaces...");
    res = await fetch('http://localhost:3000/api/v1/workspaces', {
        headers: { 'Cookie': cookieHeader }
    });
    console.log(`Fetch workspaces status: ${res.status}`);

    // 3. First Refresh
    console.log("\n3. Refreshing token (1st time)...");
    res = await fetch('http://localhost:3000/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Cookie': cookieHeader }
    });
    console.log(`Refresh 1 status: ${res.status}`);
    let refresh1Cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
    
    if (res.status !== 200) {
        const body = await res.json();
        console.error("Refresh 1 failed:", body);
        return;
    }

    cookieHeader = refresh1Cookies.map(c => c.split(';')[0]).join('; ');
    console.log(`Cookies after Refresh 1: ${cookieHeader}`);

    // 4. Second Refresh (simulating rotation)
    console.log("\n4. Refreshing token (2nd time)...");
    res = await fetch('http://localhost:3000/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Cookie': cookieHeader }
    });
    console.log(`Refresh 2 status: ${res.status}`);
    let refresh2Cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
    
    if (res.status !== 200) {
        const body = await res.json();
        console.error("Refresh 2 failed:", body);
        return;
    }

    cookieHeader = refresh2Cookies.map(c => c.split(';')[0]).join('; ');
    console.log(`Cookies after Refresh 2: ${cookieHeader}`);

    // 5. Fetch workspaces again
    console.log("\n5. Fetching workspaces with rotated token...");
    res = await fetch('http://localhost:3000/api/v1/workspaces', {
        headers: { 'Cookie': cookieHeader }
    });
    console.log(`Fetch workspaces status: ${res.status}`);

    // 6. Logout (Commented out to keep session active for DB inspection)
    /*
    console.log("\n6. Logging out...");
    res = await fetch('http://localhost:3000/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Cookie': cookieHeader }
    });
    console.log(`Logout status: ${res.status}`);
    let logoutCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
    console.log('Logout cookies received:', logoutCookies);
    */
}

runFullLifecycleTest().catch(err => console.error("Lifecycle test error:", err));
