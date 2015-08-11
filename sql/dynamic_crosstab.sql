-- This is an extension of the crosstab function that generates the columns internally
-- Taken from: www.cureffi.org/2013/03/19/automatically-creating-pivot-table-column-names-in-postgresql/
DROP FUNCTION pivotcode(character varying,character varying,character varying,character varying,character varying);
create or replace function pivotcode (tablename varchar, rowc varchar, colc varchar, cellc varchar, celldatatype varchar) 
returns varchar language plpgsql as $$
declare
    dynsql1 varchar;
    dynsql2 varchar;
    columnlist varchar;
begin
    -- 1. retrieve list of column names.
    dynsql1 = 'select string_agg(distinct ''_''||'||colc||'||'' '||celldatatype||''','','' order by ''_''||'||colc||'||'' '||celldatatype||''') from '||tablename||';';
    execute dynsql1 into columnlist;
    -- 2. set up the crosstab query
    dynsql2 = 'select * from crosstab (
 ''select '||rowc||','||colc||','||cellc||' from '||tablename||' group by 1,2 order by 1,2'',
 ''select distinct '||colc||' from '||tablename||' order by 1''
 )
 as newtable (
 '||rowc||' varchar,'||columnlist||'
 )';
    return dynsql2;
end
$$;

/*
-- Usage: (outputs the crosstab dynamic string):
select 'to_json(array_agg(jj)) FROM ('||pivotcode||') AS jj' FROM pivotcode('(SELECT choice_id AS choice,question_id,COUNT(person_id) AS no_of_staff_replies 
FROM staff_survey_choices 
WHERE study_id=48 AND question_id= ANY(ARRAY[477,476]) 
GROUP BY choice_id,question_id ORDER BY choice,question_id) 
AS t','choice','question_id','max(no_of_staff_replies)','integer');
*/
-- Example:
DROP function splab_no_of_staff_replies_per_choice_multi_q (integer, integer []);
create or replace function splab_no_of_staff_replies_per_choice_multi_q (study_id integer, question_ids integer []) 
returns json
language plpgsql as $$
DECLARE
    sql varchar;
    result json;
BEGIN
select 'SELECT to_json(array_agg(jj)) FROM ('||pivotcode||') AS jj' FROM pivotcode('(SELECT choice_id AS choice,question_id,COUNT(person_id) AS no_of_staff_replies 
FROM staff_survey_choices 
WHERE study_id='||$1||' AND question_id= ANY(ARRAY['||array_to_string($2,',')||']) 
GROUP BY choice_id,question_id ORDER BY choice,question_id) 
AS t','choice','question_id','max(no_of_staff_replies)','integer')INTO sql;
EXECUTE sql INTO result;
    RETURN result;
END$$;
SELECT * FROM splab_no_of_staff_replies_per_choice_multi_q(48,ARRAY[477,476]);