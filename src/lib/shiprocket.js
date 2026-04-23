let cachedToken = null;
let tokenExpiry = null;

export async function getShiprocketToken() {
  if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials are not configured.');
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to authenticate with Shiprocket');
  }

  const data = await response.json();
  cachedToken = data.token;
  // Expire in 24 hours
  tokenExpiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

  return cachedToken;
}
