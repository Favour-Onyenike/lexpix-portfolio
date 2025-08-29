-- Remove orphaned SECURITY DEFINER functions that reference non-existent invite_tokens table
-- These functions are causing security linter warnings and are not functional

DROP FUNCTION IF EXISTS public.mark_invite_token_used(text, uuid);
DROP FUNCTION IF EXISTS public.validate_invite_token(text);