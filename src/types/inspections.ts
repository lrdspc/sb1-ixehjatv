export interface Inspection {
  id: string;
  created_at: string;
  client_id: string;
  status: string;
  // Add other inspection fields as needed
}

export interface InsertInspection {
  client_id: string;
  status: string;
  // Add other required fields for new inspections
}

export interface UpdateInspection {
  status?: string;
  // Add other updatable fields
}
