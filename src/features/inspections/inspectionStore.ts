export type Inspection = {
  jobId: string;
  /** True when the inspection is part of an insurance claim. */
  isCarrierClaim: boolean;
  adjusterName: string;
  policyholderName: string;
  propertyAddress: string;
};

const inspections = new Map<string, Inspection>();

export function saveInspection(inspection: Inspection) {
  inspections.set(inspection.jobId, inspection);
}

export function getInspection(jobId: string): Inspection | undefined {
  return inspections.get(jobId);
}
