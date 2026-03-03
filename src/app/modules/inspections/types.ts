export type InspectionStatus = "pending" | "completed" | "approved";
export type InspectionRecordStatus = "draft" | "active";

export type Inspection = {
  id: string;
  environment_id: string;
  environment_name?: string;
  isActive: boolean;
  record_status: InspectionRecordStatus;

  inspection_date: string;
  observations?: string;
  irregularity?: string;
  technical_basis?: string;
  technical_standard?: string;
  photo_urls?: string[];

  status: InspectionStatus;

  total_items: number;
  conforming_items: number;
  non_conforming_items: number;
  conformity_percentage: number;

  created_at: Date;
  updated_at: Date;
};
