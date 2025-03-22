
-- Function to insert a new invite token
CREATE OR REPLACE FUNCTION public.insert_invite_token(
  p_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_created_by UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.invite_tokens (token, expires_at, created_by)
  VALUES (p_token, p_expires_at, p_created_by);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate an invite token
CREATE OR REPLACE FUNCTION public.validate_invite_token(
  p_token TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.invite_tokens
    WHERE token = p_token
    AND expires_at > NOW()
    AND used = false
  ) INTO valid;
  
  RETURN valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark an invite token as used
CREATE OR REPLACE FUNCTION public.mark_invite_token_used(
  p_token TEXT,
  p_used_by UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.invite_tokens
  SET used = true, used_by = p_used_by
  WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
