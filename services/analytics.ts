// Analytics placeholder. TODO: connect privacy-conscious dashboards or warehouse exports after deciding retention and consent policies.
export function track(event: string, payload: Record<string, unknown>) { console.log("analytics:mvp", event, payload); }
