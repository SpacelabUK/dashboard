SELECT occupancy, count(entity_id) AS no_of_desks FROM (
SELECT splab_actual_desks.entity_id,COALESCE(count,0) AS occupancy FROM (
SELECT occupancy.entity_id,count(CASE state WHEN 1 THEN 1 ELSE 0 END) 
FROM occupancy 
JOIN observation_snapshots ON occupancy.snapshot_id=observation_snapshots.id
JOIN observation_rounds ON observation_snapshots.round_id=observation_rounds.id
WHERE (occupancy.type = 1 OR occupancy.type IS NULL) AND observation_rounds.observation_id=47
GROUP BY occupancy.entity_id) AS x
RIGHT JOIN splab_actual_desks ON splab_actual_desks.entity_id=x.entity_id
WHERE splab_actual_desks.observation_id=47) AS t 
GROUP BY occupancy
ORDER BY occupancy;