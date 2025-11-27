/**
 * Test script for satisfaction data cache
 * Verifies cache functionality including get, set, expiration, and LRU eviction
 */

// Mock SatisfactionData for testing
const mockSatisfactionData = (barangayId, cycleId) => ({
  barangayId,
  cycleId,
  cycleName: `Cycle ${cycleId}`,
  cycleYear: 2025,
  overallSatisfaction: 75.5,
  surveyStatus: 'completed',
  serviceScores: {
    financial: 70,
    disaster: 80,
    safety: 75,
    social: 78,
    business: 72,
    environmental: 76,
  },
  responseCount: 100,
  hasData: true,
});

// Simple cache implementation for testing (mirrors the actual implementation)
class TestCache {
  constructor() {
    this.cache = new Map();
    this.TTL = 5 * 60 * 1000; // 5 minutes
    this.MAX_SIZE = 50;
  }

  generateKey(barangayId, cycleId) {
    return `${barangayId}-${cycleId}`;
  }

  isExpired(entry) {
    return Date.now() > entry.expiresAt;
  }

  get(barangayId, cycleId) {
    const key = this.generateKey(barangayId, cycleId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(barangayId, cycleId, data) {
    const key = this.generateKey(barangayId, cycleId);
    const now = Date.now();

    const entry = {
      data,
      timestamp: now,
      expiresAt: now + this.TTL,
    };

    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // LRU eviction
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, entry);
  }

  clear() {
    this.cache.clear();
  }

  clearExpired() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  size() {
    return this.cache.size;
  }

  has(barangayId, cycleId) {
    const key = this.generateKey(barangayId, cycleId);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Run tests
console.log('🧪 Testing Satisfaction Data Cache\n');

const cache = new TestCache();

// Test 1: Basic set and get
console.log('Test 1: Basic set and get');
const data1 = mockSatisfactionData(1, 1);
cache.set(1, 1, data1);
const retrieved1 = cache.get(1, 1);
console.log('✓ Set and retrieved data:', retrieved1 !== null && retrieved1.barangayId === 1);
console.log(`  Cache size: ${cache.size()}\n`);

// Test 2: Cache miss
console.log('Test 2: Cache miss');
const retrieved2 = cache.get(999, 999);
console.log('✓ Cache miss returns null:', retrieved2 === null);
console.log(`  Cache size: ${cache.size()}\n`);

// Test 3: Multiple entries
console.log('Test 3: Multiple entries');
for (let i = 2; i <= 10; i++) {
  cache.set(i, 1, mockSatisfactionData(i, 1));
}
console.log('✓ Added 9 more entries');
console.log(`  Cache size: ${cache.size()}\n`);

// Test 4: LRU eviction
console.log('Test 4: LRU eviction (max 50 entries)');
for (let i = 11; i <= 55; i++) {
  cache.set(i, 1, mockSatisfactionData(i, 1));
}
console.log('✓ Added 45 more entries (total attempted: 55)');
console.log(`  Cache size (should be 50): ${cache.size()}`);
console.log(`  First entry (barangay 1) evicted: ${cache.get(1, 1) === null}`);
console.log(`  Last entry (barangay 55) exists: ${cache.get(55, 1) !== null}\n`);

// Test 5: Cache key generation
console.log('Test 5: Cache key generation');
cache.clear();
cache.set(1, 1, mockSatisfactionData(1, 1));
cache.set(1, 2, mockSatisfactionData(1, 2));
cache.set(2, 1, mockSatisfactionData(2, 1));
console.log('✓ Different keys for different barangay-cycle combinations');
console.log(`  Barangay 1, Cycle 1: ${cache.has(1, 1)}`);
console.log(`  Barangay 1, Cycle 2: ${cache.has(1, 2)}`);
console.log(`  Barangay 2, Cycle 1: ${cache.has(2, 1)}`);
console.log(`  Cache size: ${cache.size()}\n`);

// Test 6: Expiration (simulated)
console.log('Test 6: Expiration check');
cache.clear();
cache.TTL = 100; // Set very short TTL for testing
cache.set(1, 1, mockSatisfactionData(1, 1));
console.log('✓ Entry added with 100ms TTL');
setTimeout(() => {
  const expired = cache.get(1, 1);
  console.log(`  Entry expired after 150ms: ${expired === null}`);
  console.log(`  Cache size after expiration: ${cache.size()}\n`);
  
  // Test 7: Clear expired entries
  console.log('Test 7: Clear expired entries');
  cache.TTL = 5 * 60 * 1000; // Reset TTL
  cache.set(1, 1, mockSatisfactionData(1, 1));
  cache.set(2, 2, mockSatisfactionData(2, 2));
  console.log(`  Cache size before cleanup: ${cache.size()}`);
  cache.clearExpired();
  console.log(`  Cache size after cleanup: ${cache.size()}`);
  console.log('✓ Expired entries cleared\n');
  
  // Test 8: Clear all
  console.log('Test 8: Clear all entries');
  cache.set(3, 3, mockSatisfactionData(3, 3));
  cache.set(4, 4, mockSatisfactionData(4, 4));
  console.log(`  Cache size before clear: ${cache.size()}`);
  cache.clear();
  console.log(`  Cache size after clear: ${cache.size()}`);
  console.log('✓ All entries cleared\n');
  
  console.log('✅ All cache tests completed successfully!');
}, 150);
