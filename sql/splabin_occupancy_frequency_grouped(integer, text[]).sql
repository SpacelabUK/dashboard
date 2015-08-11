-- Function: splabin_occupancy_frequency_grouped(integer, text[])

-- DROP FUNCTION splabin_occupancy_frequency_grouped(integer, text[]);

CREATE OR REPLACE FUNCTION splabin_occupancy_frequency_grouped(
    IN observation_id integer,
    IN groups text[])
  RETURNS TABLE(occupancy_group text, range_start integer, range_end integer, no_of_desks integer) AS
$BODY$

DECLARE
  col text := 'occupancy';
  elm text;
  caseq text := 'CASE';
  params text [];
  split text [];
  rangestart integer;
  rangeend integer;
BEGIN
   FOREACH elm IN ARRAY groups
   LOOP
   IF POSITION('-' IN elm) > 1 THEN 
    split := regexp_split_to_array(elm, '-');
    IF array_length(split,1) = 2 AND split[1] ~ '^[0-9]+$' AND split[2] ~ '^[0-9]+$' THEN 
     params := array_append(params,split[1]);
     rangestart := array_length(params,1);
     caseq := concat(caseq,' WHEN $1[',rangestart,']::integer <= ',col);
     params := array_append(params,split[2]);
     rangeend := array_length(params,1);
     caseq := concat(caseq,' AND ',col,' <= $1[',rangeend,']::integer THEN');
     params := array_append(params,elm);
     caseq := concat(caseq,' ARRAY[$1[',array_length(params,1),'],$1[',rangestart,'],$1[',rangeend,']]');
    END IF;
   ELSEIF POSITION('+' IN elm::text)::integer != 0 THEN 
    split := regexp_split_to_array(elm, '\+');
    IF split[1] ~ '^[0-9]+$' THEN 
     params := array_append(params,split[1]);
     rangestart := array_length(params,1);
     caseq := concat(caseq,' WHEN $1[',rangestart,']::integer <= ',col);
     params := array_append(params,concat(split[1],'+'));
     caseq := concat(caseq,' THEN ARRAY[$1[',array_length(params,1),'],$1[',rangestart,'],NULL]');
    END IF;
   ELSEIF elm ~ '^[0-9]+$' THEN
    params := array_append(params,elm);
     rangestart := array_length(params,1);
     rangeend := array_length(params,1);
     caseq := concat(caseq,' WHEN $1[',array_length(params,1),']::integer = ',col,' THEN');
     caseq := concat(caseq,' ARRAY[$1[',array_length(params,1),'],$1[',rangestart,'],$1[',rangeend,']]');
   END IF;
   END LOOP;
   
    caseq := concat(caseq,' ELSE ARRAY[' || col || ',' || col || ',' || col || ']::text[] END');
   
   --  || rangestart || ' AS range_start,' 
   --  || rangestart || ' AS range_end' 
    RETURN QUERY execute
    'SELECT combo[1]::text AS occupancy_group,combo[2]::integer AS range_start,combo[3]::integer AS range_end,sum(no_of_desks)::integer FROM (' ||
     'SELECT ' || caseq ||
     ' AS combo,no_of_desks FROM (
       SELECT * FROM splabin_occupancy_frequency($2)
       ) AS x
       ) AS t
       GROUP BY combo
       ORDER BY range_start;'
    USING params,$1,$2;

-- SELECT * FROM splabin_occupancy_frequency_grouped(47,ARRAY['0-20','20-28','28+']);

END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION splabin_occupancy_frequency_grouped(integer, text[])
  OWNER TO petrox;

SELECT * FROM splabin_occupancy_frequency_grouped(47,ARRAY['0-20','20-28','28+']);