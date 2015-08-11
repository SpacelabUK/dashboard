SELECT polygons.id,COUNT(entity_id) FROM (SELECT DISTINCT ON (occupancy.entity_id) occupancy.entity_id,
occupancy.position, snapshots.space_id FROM occupancy LEFT JOIN snapshots ON occupancy.snapshot_id=snapshots.id 
LEFT OUTER JOIN predefined ON occupancy.entity_id = predefined.id LEFT OUTER JOIN splab_removed_desks(32) 
ON occupancy.entity_id = splab_removed_desks WHERE occupancy.type=1 AND splab_removed_desks IS NULL 
AND snapshots.observation_id=32) AS desks JOIN polygons 
ON polygons.space_id=desks.space_id WHERE functeam='func' AND type_id=7 AND ST_Contains(polygons.polygon,desks.position) 
GROUP BY  polygons.id;