export interface ApplicationField {
  key: string;
  label: string;
  value: string;
  aiHint?: string;
  section?: number;
  type?: "text" | "select" | "date" | "textarea";
  options?: string[];
  required?: boolean;
  review?: {
    status: "ok" | "fix";
    comment: string;
  };
}

export interface Application {
  id: string;
  type: string;
  status: "draft" | "submitted" | "needs_revision" | "approved";
  fields?: ApplicationField[];
  formData?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  rcicConclusion?: {
    result: string;
    comment: string;
  };
}
