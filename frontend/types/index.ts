export enum UserRole {
  ADMIN = 'admin',
  MENTOR = 'mentor',
  INTERN = 'intern',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  avatar_color?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string;
  mentor_id: string;
  due_date: string;
  created_at: string;
  completed_at?: string;
  assignee?: User;
}

export interface Report {
  id: string;
  intern_id: string;
  week_number: number;
  markdown_content: string;
  html_content?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  submitted_at?: string;
  updated_at?: string;
}

export interface Feedback {
  id: string;
  report_id: string;
  mentor_id: string;
  comment: string;
  rating: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminAnalytics {
  users: {
    total: number;
    active: number;
    admins: number;
    mentors: number;
    interns: number;
  };
  tasks: {
    total: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
  };
  reports: {
    total: number;
    submitted: number;
    reviewed: number;
  };
  feedback: {
    total: number;
  };
}

export interface MentorAnalytics {
  interns_count: number;
  tasks: {
    total: number;
    done: number;
    in_progress: number;
    todo: number;
    completion_rate: number;
  };
  reports: {
    pending_review: number;
    reviewed: number;
  };
  feedback_count: number;
}

export interface InternAnalytics {
  tasks: {
    total: number;
    done: number;
    in_progress: number;
    todo: number;
    completion_rate: number;
  };
  reports: {
    submitted: number;
    reviewed: number;
  };
  feedback: {
    count: number;
    average_rating: number;
  };
}

export interface ReadAllNotificationsResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
