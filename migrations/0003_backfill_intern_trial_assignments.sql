-- Migration number: 0003    2026-05-07T00:00:00.000Z
UPDATE intern_candidates
SET trial_assignment = CASE
    WHEN desired_role LIKE '%Marketing%' THEN 'Create 3 promo ideas for 1 Soundvibe Studios.'
    WHEN desired_role LIKE '%Graphic Design%' THEN 'Create 1 sample flyer or social media post.'
    WHEN desired_role LIKE '%Photography%' THEN 'Submit 5 best photos or a portfolio link.'
    WHEN desired_role LIKE '%Studio Staff%' THEN 'Explain how you would help set up a vocal session.'
    WHEN desired_role LIKE '%A&R%' THEN 'Submit 3 Houston artists you think 1SV should watch.'
    WHEN desired_role LIKE '%Producer%' THEN 'Submit 3 beats or production samples.'
    WHEN desired_role LIKE '%Content%' THEN 'Submit 2 short-form video ideas for the studio.'
    ELSE 'Bring examples of your work and explain how you would support 1 Soundvibe Studios.'
END,
updated_at = CURRENT_TIMESTAMP
WHERE trial_assignment = '' OR trial_assignment IS NULL;
