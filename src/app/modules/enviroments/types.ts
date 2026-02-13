export type EnvironmentStatus = "active" | "concluded" | "paused";

export type Environment = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  client?: string;
  phoneNumber?: string;
  status: EnvironmentStatus;
  start_date?: string;
  created_at: Date;
  updated_at?: Date;
};
