-- ============================================================================
-- Safe2Odds Nigeria — Supabase Row Level Security (RLS) & Atomic RPC Functions
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth user is admin/staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('moderator', 'admin', 'super_admin')
    AND account_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own bio, avatar, and display_name" 
ON profiles FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Protect system fields from being altered by client
  points = (SELECT points FROM profiles WHERE user_id = auth.uid()) AND
  win_rate = (SELECT win_rate FROM profiles WHERE user_id = auth.uid()) AND
  total_wins = (SELECT total_wins FROM profiles WHERE user_id = auth.uid()) AND
  total_losses = (SELECT total_losses FROM profiles WHERE user_id = auth.uid())
);

-- 2. PREDICTIONS POLICIES
CREATE POLICY "Public predictions are viewable by everyone" 
ON predictions FOR SELECT 
USING (
  is_hidden = false OR is_staff() OR auth.uid() = author_id
);

CREATE POLICY "Authenticated users can create predictions" 
ON predictions FOR INSERT 
WITH CHECK (
  auth.uid() = author_id AND
  status = 'PENDING'
);

CREATE POLICY "Only staff can update prediction status" 
ON predictions FOR UPDATE 
USING (is_staff());

-- 3. POINTS TRANSACTIONS (NO DIRECT CLIENT INSERTS/UPDATES)
CREATE POLICY "Users can view their own points transactions" 
ON points_transactions FOR SELECT 
USING (auth.uid() = user_id OR is_staff());

-- 4. ATOMIC PREDICTION VERIFICATION & POINTS AWARDING RPC
CREATE OR REPLACE FUNCTION verify_prediction_atomic(
  p_prediction_id UUID,
  p_status prediction_status,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_author_id UUID;
  v_current_status prediction_status;
  v_match_title VARCHAR;
  v_wins INT;
  v_losses INT;
  v_win_rate NUMERIC(5,2);
  v_txn_exists BOOLEAN;
BEGIN
  -- Verify caller is staff
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Unauthorized: Only staff members can verify predictions';
  END IF;

  -- Lock prediction row for update
  SELECT author_id, status, match_title 
  INTO v_author_id, v_current_status, v_match_title
  FROM predictions 
  WHERE id = p_prediction_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prediction not found';
  END IF;

  -- Update prediction status
  UPDATE predictions 
  SET status = p_status, 
      verified_at = NOW(), 
      verified_by = p_admin_id,
      updated_at = NOW()
  WHERE id = p_prediction_id;

  -- If status is WON, idempotently award +10 points
  IF p_status = 'WON' THEN
    SELECT EXISTS (
      SELECT 1 FROM points_transactions 
      WHERE prediction_id = p_prediction_id AND type = 'PREDICTION_WON'
    ) INTO v_txn_exists;

    IF NOT v_txn_exists THEN
      -- Create immutable transaction
      INSERT INTO points_transactions (user_id, amount, type, prediction_id, created_by)
      VALUES (v_author_id, 10, 'PREDICTION_WON', p_prediction_id, p_admin_id);

      -- Update author profile points & wins
      UPDATE profiles 
      SET points = points + 10,
          total_wins = total_wins + 1
      WHERE user_id = v_author_id;

      -- Send notification
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (
        v_author_id,
        'Prediction Won! 🎉',
        'Your prediction for ' || v_match_title || ' won! +10 points added to your balance.',
        'PREDICTION_WON',
        jsonb_build_object('prediction_id', p_prediction_id, 'points', 10)
      );
    END IF;
  ELSIF p_status = 'LOST' THEN
    UPDATE profiles 
    SET total_losses = total_losses + 1
    WHERE user_id = v_author_id;

    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      v_author_id,
      'Prediction Settled',
      'Your prediction for ' || v_match_title || ' was settled as Lost.',
      'PREDICTION_LOST'
    );
  END IF;

  -- Recompute win rate = wins / (wins + losses) * 100
  SELECT total_wins, total_losses INTO v_wins, v_losses 
  FROM profiles WHERE user_id = v_author_id;

  IF (v_wins + v_losses) > 0 THEN
    v_win_rate := ROUND((v_wins::numeric / (v_wins + v_losses)::numeric) * 100.0, 2);
  ELSE
    v_win_rate := 0.00;
  END IF;

  UPDATE profiles SET win_rate = v_win_rate WHERE user_id = v_author_id;

  RETURN jsonb_build_object(
    'success', true,
    'prediction_id', p_prediction_id,
    'status', p_status,
    'author_id', v_author_id,
    'new_win_rate', v_win_rate
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
