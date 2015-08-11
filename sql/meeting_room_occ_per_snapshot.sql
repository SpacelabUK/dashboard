SELECT snapshot_id,COUNT(polygon_id) FROM 
(SELECT DISTINCT ON (polygon_id,snapshot_id) * FROM splab_polygon_occupancy 
WHERE functeam='func' AND observation_id=32) AS temp GROUP BY snapshot_id;

per day/round:

SELECT day_id,round_id,COUNT(polygon_id) FROM 
(SELECT DISTINCT ON (polygon_id,day_id,round_id) * FROM splab_polygon_occupancy 
WHERE functeam='func' AND observation_id=32) AS temp GROUP BY day_id,round_id;