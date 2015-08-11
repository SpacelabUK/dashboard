-- Number of directional ties that are not between people of the same team
--SELECT to_json(array_agg(x)) FROM (SELECT team_to,to_json(array_agg((SELECT r FROM (SELECT t.team_from, t.ties) AS r))) AS data FROM (
SELECT staff_from.team_id AS team_from,staff_to.team_id AS team_to,COUNT(staff_to.id) AS ties FROM staff_survey_ties 
JOIN staff AS staff_from ON staff_from.id=staff_survey_ties.from_staff_id JOIN staff AS staff_to
ON staff_to.id=staff_survey_ties.to_staff_id WHERE staff_survey_ties.question_id=488 
AND staff_survey_ties.study_id=48 AND staff_from.team_id != staff_to.team_id AND staff_survey_ties.score>=4
GROUP BY staff_from.team_id,staff_to.team_id ORDER BY staff_from.team_id
--) AS t GROUP BY team_to) AS x;
;
/*
CREATE OR REPLACE FUNCTION splab_no_of_ties_directional_team_to_team_scored(
    study_id integer,
    question_id integer,
    score_over real,
    score_under real)
  RETURNS json AS
$BODY$-- Number of directional ties that are not between people of the same team
SELECT to_json(array_agg(x)) FROM (SELECT team_to,to_json(array_agg((SELECT r FROM (SELECT t.team_from, t.ties) AS r))) AS data
FROM (SELECT staff_from.team_id AS team_from,staff_to.team_id AS team_to,COUNT(staff_to.id) AS ties FROM staff_survey_ties 
JOIN staff AS staff_from ON staff_from.id=staff_survey_ties.from_staff_id JOIN staff AS staff_to
ON staff_to.id=staff_survey_ties.to_staff_id WHERE staff_survey_ties.question_id=$2 
AND staff_survey_ties.study_id=$1 AND staff_from.team_id != staff_to.team_id 
AND staff_survey_ties.score > score_over AND staff_survey_ties.score < score_under
GROUP BY staff_from.team_id,staff_to.team_id ORDER BY staff_from.team_id) AS t GROUP BY team_to ORDER BY team_to) AS x;$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION splab_no_of_ties_directional_team_to_team_scored(integer, integer, real, real)
  OWNER TO petrox;
*/