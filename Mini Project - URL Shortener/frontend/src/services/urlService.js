const API_BASE = '/api/url';
export const BACKEND_URL = 'http://localhost:3000/api/url';

// create short url
export async function createShortUrl(url) {
  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.trim() }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create short link');
  return json.data;
}

// fetch all saved urls
export async function getAllUrls() {
  const res = await fetch(`${API_BASE}/getUrls`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch links');
  return Array.isArray(json.data) ? json.data : [];
}

// fetch click count for a short link
export async function getClickCount(shortUrl) {
  const res = await fetch(`${API_BASE}/analytics/${encodeURIComponent(shortUrl)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch clicks');
  return json;
}

// delete a short link
export async function deleteUrl(shortUrl) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(shortUrl)}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete link');
  return json;
}
