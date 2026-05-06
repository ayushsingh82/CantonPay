"use client";

import { useState } from "react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (partyHintOrId: string, salary: string) => void;
  /** Reserved for live-ledger callers (currently informational only). */
  isLive?: boolean;
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onAdd,
}: AddEmployeeModalProps) {
  const [partyHint, setPartyHint] = useState("");
  const [salary, setSalary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!partyHint.trim() || !salary) return;
    setIsSubmitting(true);
    try {
      await onAdd(partyHint.trim(), salary);
      setPartyHint("");
      setSalary("");
      onClose();
    } catch (err) {
      console.error("Failed to add employee:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = partyHint.trim().length > 0 && salary.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add employee</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Employee name or party id</label>
            <input
              className="form-input"
              type="text"
              value={partyHint}
              onChange={(e) => setPartyHint(e.target.value)}
              placeholder="e.g. Sasha Ivanova"
              spellCheck={false}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Salary (numeric)</label>
            <input
              className="form-input"
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="5000"
              spellCheck={false}
              disabled={isSubmitting}
            />
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-tertiary)",
              lineHeight: 1.5,
            }}
          >
            Canton allocates a party if you pass a short hint (sandbox). Salary is
            stored on the EmploymentContract as Decimal; visibility is whatever your
            Daml observers allow.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Add employee"}
          </button>
        </div>
      </div>
    </div>
  );
}
