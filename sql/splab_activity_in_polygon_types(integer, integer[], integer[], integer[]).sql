-- Function: splab_activity_in_polygon_types(integer, integer[], integer[], integer[])

 DROP FUNCTION splab_activity_in_polygon_types(integer, integer[], integer[], integer[]);

CREATE OR REPLACE FUNCTION splab_activity_in_polygon_types(
    observation_id integer,
    polygon_type_ids integer[],
    entity_states integer[],
    entity_types integer[],
    entity_flag_bits integer[])
  RETURNS bigint AS $$
  
SELECT count(entity_id) 
FROM splab_polygon_activity 
WHERE observation_id=$1 
AND polygon_type_id=ANY($2) 
AND entity_state = ANY($3)
AND entity_type=ANY($4)
AND entity_flag_bit=ANY($5);

 $$ LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION splab_activity_in_polygon_types(integer, integer[], integer[], integer[])
  OWNER TO petrox;
