export interface ApplicationField {
  key: string;
  label: string;
  value: string;
  aiHint?: string;
  review?: {
    status: "ok" | "fix";
    comment: string;
  };
}

export interface Application {
  id: string;
  type: string;
  status: "draft" | "submitted" | "needs_revision" | "approved";
  fields: ApplicationField[];
  rcicConclusion?: {
    result: string;
    comment: string;
  };
}
