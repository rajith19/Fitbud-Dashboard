-- CREATE_GET_ALL_USER_BLOCKS_FUNCTION.sql
-- Run this in your Supabase SQL Editor to create the get_all_user_blocks function

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_all_user_blocks(text, integer, integer);

-- Create the get_all_user_blocks function
CREATE OR REPLACE FUNCTION get_all_user_blocks(
  search_term text DEFAULT NULL,
  limit_count integer DEFAULT NULL,
  offset_count integer DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  user_id uuid,
  blocked_user_id uuid,
  blocker json,
  blocked json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ub.id,
    ub.created_at,
    ub.user_id,
    ub.blocked_user_id,
    json_build_object(
      'id', blocker_profile.id,
      'full_name', blocker_profile.full_name,
      'email', blocker_profile.email,
      'profile_pic_url', blocker_profile.profile_pic_url,
      'notification_enabled', blocker_profile.notification_enabled
    ) as blocker,
    json_build_object(
      'id', blocked_profile.id,
      'full_name', blocked_profile.full_name,
      'email', blocked_profile.email,
      'profile_pic_url', blocked_profile.profile_pic_url,
      'notification_enabled', blocked_profile.notification_enabled
    ) as blocked
  FROM UserBlocks ub
  JOIN UserProfiles blocker_profile ON ub.user_id = blocker_profile.id
  JOIN UserProfiles blocked_profile ON ub.blocked_user_id = blocked_profile.id
  WHERE 
    CASE 
      WHEN search_term IS NOT NULL AND search_term != '' THEN
        (
          blocker_profile.full_name ILIKE '%' || search_term || '%' OR
          blocker_profile.email ILIKE '%' || search_term || '%' OR
          blocked_profile.full_name ILIKE '%' || search_term || '%' OR
          blocked_profile.email ILIKE '%' || search_term || '%'
        )
      ELSE TRUE
    END
  ORDER BY ub.created_at DESC
  LIMIT CASE WHEN limit_count IS NOT NULL THEN limit_count ELSE NULL END
  OFFSET CASE WHEN offset_count IS NOT NULL THEN offset_count ELSE 0 END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_user_blocks(text, integer, integer) TO authenticated;

-- Test the function
SELECT 'Function created successfully!' as status;

-- Example usage:
-- SELECT * FROM get_all_user_blocks(NULL, 10, 0); -- Get first 10 blocks
-- SELECT * FROM get_all_user_blocks('john', NULL, NULL); -- Search for 'john'
-- SELECT * FROM get_all_user_blocks('test@example.com', 5, 0); -- Search and limit
