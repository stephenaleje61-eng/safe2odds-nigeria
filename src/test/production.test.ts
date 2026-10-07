/**
 * Safe2Odds Nigeria — Production Automated Test Suite
 * Self-contained assertion runner for build verification & CI.
 * Covers:
 * 1. Win-Rate Mathematical Accuracy (Excludes PENDING, VOID, REMOVED)
 * 2. Idempotent Points Awarding (+10 points exactly once upon WON)
 * 3. Role-Based Access Control (RBAC) & Security Invariants
 * 4. User Blocking & Feed Integrity
 * 5. Report Deduplication
 */

import { db } from '../server/database';

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Assertion failed: Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Assertion failed: Expected value to be defined, received ${actual}`);
      }
    },
    toContain(item: any) {
      if (!Array.isArray(actual) && typeof actual !== 'string') {
        throw new Error(`Assertion failed: Target is not array or string`);
      }
      if (Array.isArray(actual) && !actual.includes(item)) {
        throw new Error(`Assertion failed: Array does not contain ${JSON.stringify(item)}`);
      }
      if (typeof actual === 'string' && !actual.includes(item)) {
        throw new Error(`Assertion failed: String does not contain ${JSON.stringify(item)}`);
      }
    }
  };
}

export function runProductionTests(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = [];
  let passed = 0;

  function runTest(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      console.log(`[PASS] ${name}`);
    } catch (err: any) {
      errors.push(`${name}: ${err.message}`);
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  // TEST 1
  runTest('Win-Rate calculation accurately divides WON by (WON + LOST) and ignores PENDING/VOID', () => {
    const admin = { id: 'test-admin', username: 'ChiefTester' };
    const testUser = {
      id: 'test-punter-99',
      username: 'TestPunter',
      displayName: 'Test Punter',
      avatar: '',
      role: 'user' as const,
      winRate: 0,
    };

    const p1 = db.createPrediction(testUser, { match: 'A vs B', league: 'PL', prediction: 'Over 1.5', odds: 1.30, comment: 'P1' });
    const p2 = db.createPrediction(testUser, { match: 'C vs D', league: 'PL', prediction: 'Over 1.5', odds: 1.40, comment: 'P2' });
    const p3 = db.createPrediction(testUser, { match: 'E vs F', league: 'PL', prediction: 'Over 1.5', odds: 1.50, comment: 'P3' });
    const p4 = db.createPrediction(testUser, { match: 'G vs H', league: 'PL', prediction: 'Over 1.5', odds: 1.60, comment: 'P4' });

    db.verifyPrediction(p1.id, 'WON', admin);
    db.verifyPrediction(p2.id, 'WON', admin);
    db.verifyPrediction(p3.id, 'LOST', admin);
    db.verifyPrediction(p4.id, 'VOID', admin);

    const profile = db.profiles.get(testUser.id);
    expect(profile).toBeDefined();

    expect(profile!.totalWins).toBe(2);
    expect(profile!.totalLosses).toBe(1);
    expect(profile!.winRate).toBe(66.67);
  });

  // TEST 2
  runTest('Idempotency: A WON prediction receives exactly +10 points ONCE even if verified repeatedly', () => {
    const admin = { id: 'test-admin', username: 'ChiefTester' };
    const testUser = {
      id: 'test-punter-points',
      username: 'PointsTester',
      displayName: 'Points Tester',
      avatar: '',
      role: 'user' as const,
      winRate: 0,
    };

    const pred = db.createPrediction(testUser, {
      match: 'Arsenal vs Chelsea',
      league: 'PL',
      prediction: 'Over 1.5',
      odds: 1.30,
      comment: 'Safe banker',
    });

    const initialPoints = db.profiles.get(testUser.id)?.points || 0;

    // First verification WON -> +10 points
    db.verifyPrediction(pred.id, 'WON', admin);
    const pointsAfterFirst = db.profiles.get(testUser.id)!.points;
    expect(pointsAfterFirst).toBe(initialPoints + 10);

    // Replay verification -> MUST NOT award duplicate points
    db.verifyPrediction(pred.id, 'WON', admin);
    const pointsAfterSecond = db.profiles.get(testUser.id)!.points;
    expect(pointsAfterSecond).toBe(initialPoints + 10);

    const txns = db.pointsTransactions.filter(t => t.predictionId === pred.id);
    expect(txns.length).toBe(1);
  });

  // TEST 3
  runTest('Security Invariant: Client cannot manipulate roles, points, or win counts via profile update', () => {
    const testUser = db.profiles.get('usr-punter-01');
    expect(testUser).toBeDefined();
    const originalPoints = testUser!.points;
    const originalRole = testUser!.role;

    db.updateUserProfile('usr-punter-01', {
      displayName: 'Tampered Name',
      bio: 'New Bio',
      ...({ points: 999999, role: 'super_admin', winRate: 100 } as any)
    });

    const refreshed = db.profiles.get('usr-punter-01');
    expect(refreshed!.points).toBe(originalPoints);
    expect(refreshed!.role).toBe(originalRole);
    expect(refreshed!.displayName).toBe('Tampered Name');
  });

  // TEST 4
  runTest('User blocking hides content from blocker feed', () => {
    const blockerId = 'user-blocker-01';
    const authorId = 'user-spammer-02';

    db.blockUser(blockerId, authorId);
    expect(db.getBlockedUserIds(blockerId)).toContain(authorId);

    const pred = db.createPrediction({
      id: authorId,
      username: 'SpammerUser',
      displayName: 'Spammer',
      avatar: '',
      role: 'user',
      winRate: 0,
    }, {
      match: 'Team A vs Team B',
      league: 'League',
      prediction: 'Draw',
      odds: 3.0,
      comment: 'Blocked content',
    });

    const feed = db.getCommunityFeed({ viewerId: blockerId });
    const containsBlockedPost = feed.items.some(p => p.id === pred.id);
    expect(containsBlockedPost).toBe(false);
  });

  // TEST 5
  runTest('Report deduplication prevents spamming reports on the same target', () => {
    const reporter = { id: 'user-reporter-01', username: 'GoodCitizen' };
    const targetId = 'pred-101';

    const rep1 = db.submitReport(reporter, {
      targetType: 'prediction',
      targetId,
      targetSummary: 'Man City vs Arsenal',
      reason: 'Spam',
      description: 'First report',
    });
    expect(rep1.success).toBe(true);

    const rep2 = db.submitReport(reporter, {
      targetType: 'prediction',
      targetId,
      targetSummary: 'Man City vs Arsenal',
      reason: 'Spam',
      description: 'Duplicate attempt',
    });
    expect(rep2.success).toBe(false);
    expect(rep2.error).toContain('already submitted a report');
  });

  return { passed, failed: errors.length, errors };
}

// Auto-run when executed directly via tsx
if (process.argv[1] && process.argv[1].includes('production.test')) {
  const result = runProductionTests();
  if (result.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
