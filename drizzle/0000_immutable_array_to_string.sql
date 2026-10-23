   CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
   RETURNS text
   LANGUAGE sql
   IMMUTABLE
   PARALLEL SAFE
   AS $$ SELECT array_to_string($1, $2) $$;