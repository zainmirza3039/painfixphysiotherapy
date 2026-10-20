import { useEffect, useState } from "react";
import { verifyCertificate } from "@/lib/internships.functions";
import type { VerificationResult } from "@/lib/internships.contract";

type Props = { initialReference?: string; initialResult?: VerificationResult | null };

export function CertificateVerification({ initialReference = "", initialResult = null }: Props) {
  const [reference, setReference] = useState(initialReference);
  const [result, setResult] = useState<VerificationResult | null>(initialResult);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReference(initialReference);
    setResult(initialResult);
    setError("");
  }, [initialReference, initialResult]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!reference.trim()) {
      setError("Enter a certificate reference number.");
      return;
    }
    setLoading(true);
    try {
      setResult(await verifyCertificate({ data: { reference: reference.trim() } }));
    } catch {
      setError("Verification is temporarily unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8"
      >
        <label htmlFor="certificate-reference" className="text-sm font-semibold text-foreground">
          Certificate reference
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="certificate-reference"
            autoComplete="off"
            maxLength={160}
            disabled={loading}
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              setResult(null);
              setError("");
            }}
            placeholder="Enter the reference from the certificate"
            className="min-h-12 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Verify certificate"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
      {result && (
        <div
          className={`mt-6 rounded-2xl border p-6 ${result.status === "valid" ? "border-secondary/30 bg-secondary/10" : "border-border bg-muted"}`}
          aria-live="polite"
        >
          <p className="text-xs font-bold uppercase tracking-[.14em] text-secondary">
            Verification result
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
            {result.status === "valid"
              ? "Valid certificate"
              : result.status === "revoked"
                ? "Certificate revoked"
                : result.status === "not_found"
                  ? "Certificate not found"
                  : "Verification unavailable"}
          </h2>
          {(result.status === "valid" || result.status === "revoked") && result.certificate ? (
            <dl className="mt-5 space-y-2 text-sm text-muted-foreground">
              {result.certificate && (
                <>
                  {result.status === "revoked" && (
                    <p className="font-semibold text-destructive">
                      This certificate has been revoked and is not currently valid. Contact PainFix
                      if you need clarification.
                    </p>
                  )}
                  <div>
                    <dt className="inline font-semibold text-foreground">Reference: </dt>
                    <dd className="inline break-all">{result.certificate.reference}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-foreground">Name: </dt>
                    <dd className="inline">{result.certificate.recipient_name}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-foreground">Type: </dt>
                    <dd className="inline">
                      {result.certificate.type === "internship"
                        ? "Internship completion"
                        : "Professional experience"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-foreground">Program or role: </dt>
                    <dd className="inline">{result.certificate.program_or_role}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-foreground">Issued: </dt>
                    <dd className="inline">
                      {new Date(result.certificate.issue_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-foreground">Issuer: </dt>
                    <dd className="inline">{result.certificate.issuing_organization}</dd>
                  </div>
                </>
              )}
            </dl>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Check the reference and try again. If you believe this result is incorrect, contact
              PainFix using the clinic contact details.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
