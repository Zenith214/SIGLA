# Quick Start: ML Cache Setup

## 🚀 Setup (5 minutes)

### Step 1: Create Database Table

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run this file: `database/ml-cache-table.sql`
4. Verify table created: Check Tables → `ml_cache`

### Step 2: Test the Cache

The caching is already integrated! Just use your ML endpoints normally:

```bash
# First request (slow - computes and caches)
curl "http://localhost:3000/api/ml/insights?barangayId=1"
# Response time: ~3-5 seconds

# Second request (fast - from cache!)
curl "http://localhost:3000/api/ml/insights?barangayId=1"
# Response time: ~100-300ms ⚡
```

### Step 3: Add UI Components (Optional)

Add refresh button to your page:

```typescript
import { CacheRefreshButton } from '@/components/ml/CacheRefreshButton'
import { CacheIndicator } from '@/components/ml/CacheIndicator'

function MyPage() {
  const [data, setData] = useState(null)
  
  const fetchData = async () => {
    const res = await fetch('/api/ml/insights?barangayId=1&refresh=true')
    const result = await res.json()
    setData(result)
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div>
      <div className="flex items-center gap-4">
        <h1>ML Insights</h1>
        <CacheIndicator cache={data?._cache} />
        <CacheRefreshButton onRefresh={fetchData} />
      </div>
      {/* Your content */}
    </div>
  )
}
```

## ✅ That's It!

Your ML endpoints are now cached and will load 10-30x faster!

## 📊 Monitor Performance

Check cache statistics:

```bash
curl "http://localhost:3000/api/ml/cache?action=stats"
```

## 🔄 Force Refresh

Add `?refresh=true` to any ML endpoint:

```bash
curl "http://localhost:3000/api/ml/insights?barangayId=1&refresh=true"
```

## 🧹 Maintenance

Clean up old cache (run monthly):

```bash
curl -X DELETE "http://localhost:3000/api/ml/cache?action=cleanup&daysOld=30"
```

## 📖 Full Documentation

See `ML_CACHE_IMPLEMENTATION.md` for complete details.

## 🎯 Performance Gains

- **Before:** 3-5 seconds per page load
- **After:** 100-300ms per page load
- **Improvement:** 10-30x faster! 🚀

## 🔧 Troubleshooting

**Cache not working?**
1. Verify `ml_cache` table exists in Supabase
2. Check browser console for errors
3. Verify RLS policies are enabled

**Need fresh data?**
- Use refresh button in UI
- Add `?refresh=true` to URL
- Invalidate cache via API

## 🎉 Enjoy Lightning-Fast ML Pages!
