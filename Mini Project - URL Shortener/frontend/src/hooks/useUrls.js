import { useState, useEffect, useCallback, useMemo } from 'react';
import { createShortUrl, getAllUrls, getClickCount, deleteUrl } from '../services/urlService';

export function useUrls() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingCode, setRefreshingCode] = useState(null);
  const [toast, setToast] = useState(null);
  const [newlyCreated, setNewlyCreated] = useState(null);
  const [search, setSearch] = useState('');

  // show notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // load all links from server
  const loadLinks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getAllUrls();
      setUrls([...data].reverse());
    } catch {
      if (!silent) showToast('Could not load links. Check backend server.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // shorten link
  const shortenLink = async (url) => {
    setSubmitting(true);
    try {
      let target = url.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = `https://${target}`;
      }

      const created = await createShortUrl(target);
      setNewlyCreated(created);
      showToast(
        created.alreadyExisted ? 'Already shortened — returned existing link.' : 'Short link ready! 🚀',
        'success'
      );
      await loadLinks(true);
      return created;
    } catch (err) {
      showToast(err.message || 'Failed to shorten link', 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // delete a short link
  const deleteLink = async (shortCode) => {
    try {
      await deleteUrl(shortCode);
      setUrls((prev) => prev.filter((item) => item.shortUrl !== shortCode));
      showToast('Link deleted', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to delete link', 'error');
    }
  };

  // refresh click count for a single item
  const updateClickCount = async (shortCode) => {
    setRefreshingCode(shortCode);
    try {
      const data = await getClickCount(shortCode);
      setUrls((prev) =>
        prev.map((item) =>
          item.shortUrl === shortCode
            ? { ...item, clickedCount: data.clickedCount }
            : item
        )
      );
      showToast(`${data.clickedCount} total clicks`, 'info');
    } catch {
      showToast('Could not refresh clicks', 'error');
    } finally {
      setRefreshingCode(null);
    }
  };

  // search filter
  const filteredUrls = useMemo(() => {
    if (!search.trim()) return urls;
    const term = search.toLowerCase();
    return urls.filter(
      (u) =>
        (u.shortUrl && u.shortUrl.toLowerCase().includes(term)) ||
        (u.orignalUrl && u.orignalUrl.toLowerCase().includes(term))
    );
  }, [urls, search]);

  // dashboard stats
  const stats = useMemo(() => {
    const totalLinks = urls.length;
    const totalClicks = urls.reduce((sum, item) => sum + (item.clickedCount || 0), 0);
    const topLink = urls.reduce(
      (best, item) => ((item.clickedCount || 0) > (best.clickedCount || 0) ? item : best),
      { clickedCount: 0 }
    );
    return { totalLinks, totalClicks, topLink };
  }, [urls]);

  return {
    urls: filteredUrls,
    totalCount: urls.length,
    loading,
    submitting,
    refreshingCode,
    toast,
    newlyCreated,
    search,
    setSearch,
    stats,
    shortenLink,
    updateClickCount,
    deleteLink,
    loadLinks,
    showToast,
    hideToast,
    setNewlyCreated,
  };
}
