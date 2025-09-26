import type { ApplicationItem } from "../types";

export type ApplicationStatus = "New" | "Online" | "To be deleted";

export function computeApplicationStatus(app: ApplicationItem): ApplicationStatus {
  if (app.toBeDeleted) {
    return "To be deleted";
  }
  return app.infraReady ? "Online" : "New";
}
