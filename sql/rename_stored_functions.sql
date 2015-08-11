/* renames internal functions from starting with splab_ to starting with splabmf_*/
DO
$$
DECLARE
a text;
s text;
BEGIN

FOR a IN SELECT alias FROM metric_functions
    LOOP
    SELECT * FROM (
    SELECT format('ALTER FUNCTION %s(%s) RENAME TO splabmf_%s;'
             ,oid::regproc
             ,pg_get_function_identity_arguments(oid),a)
    FROM   pg_proc
    WHERE  'splab_' || a = proname
    AND    pg_function_is_visible(oid) 
       ) AS x INTO s;
        IF s IS NOT NULL THEN EXECUTE s; END IF;
    END LOOP;
    RETURN;

END
$$
LANGUAGE plpgsql;



   

