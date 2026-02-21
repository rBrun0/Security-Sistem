export type InspectionStatus = "pending" | "completed" | "approved";

export type Inspection = {
  id: string;
  environment_id: string;
  environment_name?: string;

  inspection_date: string;
  observations?: string;

  status: InspectionStatus;

  total_items: number;
  conforming_items: number;
  non_conforming_items: number;
  conformity_percentage: number;

  created_at: Date;
  updated_at: Date;
};
