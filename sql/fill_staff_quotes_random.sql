DO $$
DECLARE
    mviews RECORD;
    ff RECORD;
BEGIN
FOR mviews IN SELECT id FROM staff_survey_quotes LOOP
FOR ff IN SELECT unnest FROM (SELECT random(), unnest(ARRAY['AccessibilityOfMeetingFacilities',
'AccessibilityOfOtherTeams',
'AllBeingInSameBuilding',
'AlternativeWorkingSpaces',
'AVEquipment',
'BreakoutAreas',
'Canteen',
'CarPark',
'CellularOffice',
'CollaborativeWorkingEnvironment',
'DeskSpace',
'Facilities',
'FlexibleWorking',
'ITEquipmentAndSupport',
'KitchenFacilities',
'LayoutEnablesInteraction',
'LegibilityAndWayfinding',
'Location',
'MultipleScreens',
'NaturalLight',
'OpenPlan',
'People',
'PhotographicStudioAndArchive',
'PinUpWallsAndScreens',
'ProximityToKeyColleagues',
'ProximityToTeam',
'RiversideLocationAndView',
'SenseOfCommunity',
'ShowerFacilities',
'Spaciousness',
'TheAnglersPub',
'WorkingEnvironment',
'WorkingFromHome',
'WorkLaptop'])) AS t WHERE random < 0.1  LOOP
INSERT INTO staff_survey_quote_tags(quote_id,tag) VALUES (mviews.id, ff.unnest);
END LOOP;
END LOOP;
END;$$ 
LANGUAGE plpgsql