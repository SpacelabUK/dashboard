SELECT polygon_id,day_id,round_id, COUNT(entity_id) FROM splab_polygon_occupancy 
WHERE functeam='func' AND type_id=2 AND observation_id=32 GROUP BY polygon_id,day_id,round_id;