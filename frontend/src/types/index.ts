export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  profile?: {
    student_id_number?: string;
    department?: string;
    year_of_study?: number;
    preferred_noise_level?: string;
    admin_role?: string;
  };
}

export interface Seat {
  id: number;
  section_id: number;
  floor_id: number;
  seat_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  has_power_outlet: boolean;
  has_monitor: boolean;
  near_window: boolean;
  x_pos: number;
  y_pos: number;
  z_pos: number;
  section_name?: string;
  floor_name?: string;
}

export interface LibrarySection {
  id: number;
  floor_id: number;
  name: string;
  code: string;
  section_type: string;
  capacity: number;
  current_occupancy: number;
  noise_level: string;
  coordinates_3d_x: number;
  coordinates_3d_y: number;
  coordinates_3d_z: number;
}

export interface LibraryFloor {
  id: number;
  floor_number: number;
  name: string;
  description: string;
  total_capacity: number;
  current_occupancy: number;
  noise_level_tag: string;
  map_layer_3d_z: number;
  sections?: LibrarySection[];
}

export interface OccupancyFloorSummary {
  floor_id: number;
  floor_number: number;
  name: string;
  capacity: number;
  occupied: number;
  reserved: number;
  available: number;
  occupancy_rate: number;
  occupancy_percentage: number;
  noise_level_tag: string;
}

export interface OccupancySummary {
  total_capacity: number;
  current_occupancy: number;
  occupancy_percentage: number;
  available_seats: number;
  occupied_seats: number;
  reserved_seats: number;
  maintenance_seats: number;
  floors: OccupancyFloorSummary[];
  peak_hour_today: string;
  current_status: string;
}

export interface Reservation {
  id: number;
  seat_id: number;
  user_id: number;
  seat_number: string;
  floor_number: number;
  section_name: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  reservation_code: string;
  check_in_time?: string;
  created_at: string;
}

export interface PredictionItem {
  horizon: string;
  target_time: string;
  predicted_occupancy: number;
  predicted_percentage: number;
  confidence_interval: [number, number];
  status_category: string;
}

export interface OccupancyForecast {
  champion_model: string;
  forecast_generated_at: string;
  predictions: PredictionItem[];
  hourly_24h_curve: {
    hour: string;
    predicted_occupancy: number;
    predicted_percentage: number;
    confidence_lower: number;
    confidence_upper: number;
  }[];
}

export interface MLTreeNode3D {
  id: number;
  parent_id?: number | null;
  depth: number;
  x: number;
  y: number;
  z: number;
  is_leaf: boolean;
  feature: string;
  threshold: number;
  samples: number;
  impurity: number;
}

export interface MLTree3D {
  tree_index: number;
  root_x: number;
  nodes: MLTreeNode3D[];
}

export interface MLTelemetry {
  trained_at: string;
  training_duration_seconds: number;
  dataset_rows: number;
  features: string[];
  champion_model: string;
  models: {
    [key: string]: {
      name: string;
      mae: number;
      rmse: number;
      r2: number;
      val_mae?: number;
      feature_importances?: { [key: string]: number };
      coefficients?: { [key: string]: number };
      intercept?: number;
    };
  };
  actual_vs_predicted: {
    timestamp: string;
    actual: number;
    linear_regression: number;
    random_forest: number;
    xgboost: number;
    residual_xgb: number;
  }[];
  trees_3d: MLTree3D[];
  regression_surface_3d: {
    x_label: string;
    y_label: string;
    z_label: string;
    plane_points: { x: number; y: number; z: number }[];
  };
  data_points_3d: {
    x: number;
    y: number;
    z: number;
    actual_occupancy: number;
    hour: number;
    exam_flag: number;
  }[];
  xgboost_stages: {
    stage: number;
    weight_scale: number;
    tree_summary: string;
  }[];
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  category_code: string;
  call_number: string;
  total_copies: number;
  available_copies: number;
  borrow_count_lifetime: number;
  demand_score: number;
  cover_url?: string;
}

export interface ZoneRecommendation {
  section_id: number;
  section_name: string;
  floor_name: string;
  floor_number: number;
  noise_level: string;
  available_seats: number;
  occupancy_rate: number;
  match_score: number;
  reasons: string[];
}

export interface BookRecommendation {
  book_id: number;
  title: string;
  author: string;
  category: string;
  available_copies: number;
  match_score: number;
  reasons: string[];
}

export interface SensorDevice {
  id: number;
  device_code: string;
  sensor_type: string;
  floor_id?: number;
  floor_number?: number;
  section_id?: number;
  section_name?: string;
  status: 'online' | 'offline' | 'warning';
  battery_level: number;
  ip_address: string;
  last_heartbeat: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface DigitalDiscoveryBook {
  id: string;
  source: 'Google Books' | 'Open Library' | 'Project Gutenberg';
  access_type: 'public_domain_full' | 'google_preview' | 'controlled_lending' | 'official_catalog';
  title: string;
  authors: string[];
  publisher?: string;
  published_year?: string;
  isbn?: string;
  cover_url?: string;
  description: string;
  page_count?: number;
  categories?: string[];
  subjects?: string[];
  download_count?: number;
  full_text_url?: string | null;
  epub_url?: string | null;
  has_full_text?: boolean;
  preview_url?: string | null;
  borrow_url?: string | null;
  info_link?: string;
  buy_link?: string;
  google_book_id?: string;
  is_embeddable?: boolean;
}

