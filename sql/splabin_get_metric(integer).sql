-- Function: splabin_get_metric(integer)

-- DROP FUNCTION splabin_get_metric(integer);

CREATE OR REPLACE FUNCTION splabin_get_metric(metric_id integer)
  RETURNS json AS
$BODY$
WITH RECURSIVE metric_get AS (
    SELECT NULL AS parent_id, 0 AS input_order,*,0 AS depth 
      FROM metrics
     WHERE id = $1
   UNION ALL
     SELECT mi.metric_id,mi.input_order,m.*, 1 AS depth 
       FROM metrics AS m
       JOIN metrics_inputs AS mi ON m.id = mi.input_metric_id 
      WHERE mi.metric_id = $1
   UNION
     SELECT mi.metric_id,mi.input_order,m.*, mg.depth + 1 AS depth 
       FROM metrics AS m
       JOIN metrics_inputs AS mi ON m.id = mi.input_metric_id 
       JOIN metric_get AS mg ON mi.metric_id = mg.id
),
maxdepth AS (
  SELECT max(depth) maxdepth FROM metric_get
),
required_metrics AS (
  SELECT to_json(array_agg(DISTINCT rm)) AS required_metrics
    FROM (SELECT CASE WHEN mg.type='m' 
                      THEN (SELECT id FROM metrics WHERE alias=mg.value)
                       END AS rm 
                 FROM metric_get AS mg) AS x
   WHERE rm IS NOT NULL
),
required_metrics_aliases AS (
  SELECT to_json(array_agg(DISTINCT rm)) AS required_metrics
    FROM (SELECT CASE WHEN mg.type='m' 
                      THEN value
                       END AS rm 
                 FROM metric_get AS mg) AS x
   WHERE rm IS NOT NULL
),
required_functions_aliases AS (
  SELECT to_json(array_agg(DISTINCT rm)) AS required_functions
    FROM (SELECT CASE WHEN mg.type='f' 
                      THEN value
                       END AS rm 
                 FROM metric_get AS mg) AS x
   WHERE rm IS NOT NULL
),
metric_json AS (
    SELECT metric_get.*, json '[]' inputs 
      FROM metric_get, maxdepth
     WHERE depth = maxdepth
  UNION ALL
      SELECT (metric_get).*, to_json(array_agg(mj)) children
        FROM (SELECT metric_get, mj
                FROM metric_json AS mj
                JOIN metric_get
                  ON mj.parent_id = metric_get.id
             ) v
    GROUP BY v.metric_get
),
metric_json_simple AS (
     SELECT to_json(array_agg(metric_get.*)) AS data FROM metric_get
)
-- implementation does not return branches that don't have the same depth as the deepest
/*SELECT to_json(x) AS metric
  FROM (SELECT required_metrics,required_functions,
               row_to_json(metric_json) AS metric_description 
          FROM required_metrics,required_functions_aliases,metric_json
         WHERE depth = 0) AS x;*/
SELECT to_json(x) AS metric
  FROM (SELECT required_metrics,required_functions,
               metric_json_simple AS metric_description 
          FROM required_metrics,required_functions_aliases,metric_json_simple) AS x;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION splabin_get_metric(integer)
  OWNER TO petrox;

  
SELECT splabin_get_metric(3701);