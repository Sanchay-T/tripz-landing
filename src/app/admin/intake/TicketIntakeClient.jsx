"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { AdminBadge, AdminButton, AdminCard } from "../components";

const blankExtraction = {
  documentType: "unknown",
  customerName: "",
  mobileNumber: "",
  email: "",
  bookingType: "flight",
  market: "unknown",
  journeyType: "unknown",
  departure: "",
  arrival: "",
  travelDate: "",
  returnDate: "",
  provider: "",
  pnrOrConfirmation: "",
  baseCost: "",
  sellingPrice: "",
  currency: "INR",
  confidence: 0,
  missingFields: [],
  rawNotes: ""
};

function normalizeExtraction(extraction) {
  return {
    ...blankExtraction,
    ...extraction,
    customerName: extraction?.customerName ?? "",
    mobileNumber: extraction?.mobileNumber ?? "",
    email: extraction?.email ?? "",
    departure: extraction?.departure ?? "",
    arrival: extraction?.arrival ?? "",
    travelDate: extraction?.travelDate ?? "",
    returnDate: extraction?.returnDate ?? "",
    provider: extraction?.provider ?? "",
    pnrOrConfirmation: extraction?.pnrOrConfirmation ?? "",
    baseCost: extraction?.baseCost ?? "",
    sellingPrice: extraction?.sellingPrice ?? "",
    currency: extraction?.currency ?? "INR",
    confidence: extraction?.confidence ?? 0,
    missingFields: Array.isArray(extraction?.missingFields) ? extraction.missingFields : [],
    rawNotes: extraction?.rawNotes ?? ""
  };
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildExtractionPayload(reviewData) {
  return {
    ...normalizeExtraction(reviewData),
    customerName: reviewData.customerName || null,
    mobileNumber: reviewData.mobileNumber || null,
    email: reviewData.email || null,
    departure: reviewData.departure || null,
    arrival: reviewData.arrival || null,
    travelDate: reviewData.travelDate || null,
    returnDate: reviewData.returnDate || null,
    provider: reviewData.provider || null,
    pnrOrConfirmation: reviewData.pnrOrConfirmation || null,
    baseCost: toNullableNumber(reviewData.baseCost),
    sellingPrice: toNullableNumber(reviewData.sellingPrice),
    confidence: Number(reviewData.confidence || 0),
    rawNotes: reviewData.rawNotes || null
  };
}

function formatRoute(extraction) {
  return [extraction.departure, extraction.arrival].filter(Boolean).join(" -> ") || "Needs review";
}

export default function TicketIntakeClient() {
  const [rows, setRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [reviewData, setReviewData] = useState(blankExtraction);
  const [isLoadingRows, setIsLoadingRows] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedRowId) ?? rows[0] ?? null,
    [rows, selectedRowId]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadRows() {
      setIsLoadingRows(true);

      try {
        const response = await fetch("/api/admin/intake", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.detail || payload.error || "Could not load intake queue");
        }

        if (!isMounted) {
          return;
        }

        const nextRows = payload.rows ?? [];
        setRows(nextRows);
        setSelectedRowId(nextRows[0]?.id ?? null);
        setReviewData(normalizeExtraction(nextRows[0]?.extraction));
        setNotice(null);
      } catch (error) {
        if (isMounted) {
          setNotice({
            tone: "danger",
            message: error instanceof Error ? error.message : "Could not load intake queue"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingRows(false);
        }
      }
    }

    loadRows();

    return () => {
      isMounted = false;
    };
  }, []);

  function selectRow(row) {
    setSelectedRowId(row.id);
    setReviewData(normalizeExtraction(row.extraction));
    setNotice(null);
  }

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setIsUploading(true);
    setNotice(null);

    for (const file of files) {
      const pendingId = `${file.name}-${Date.now()}`;
      const pendingRow = {
        id: pendingId,
        fileName: file.name,
        documentType: "unknown",
        customerName: "Extracting...",
        route: "Pending",
        status: "extracting",
        confidence: 0,
        extraction: blankExtraction
      };

      setRows((current) => [pendingRow, ...current]);
      setSelectedRowId(pendingId);
      setReviewData(blankExtraction);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/admin/extract-ticket", {
          method: "POST",
          body: formData
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.detail || payload.error || "Extraction failed");
        }

        const extraction = normalizeExtraction(payload.extraction);
        const completedRow = {
          ...pendingRow,
          id: payload.extractionId,
          extractionId: payload.extractionId,
          documentId: payload.documentId,
          storagePath: payload.storagePath,
          documentType: extraction.documentType,
          customerName: extraction.customerName || "Needs review",
          route: formatRoute(extraction),
          status: payload.status,
          confidence: extraction.confidence,
          extraction
        };

        setReviewData(extraction);
        setSelectedRowId(completedRow.id);
        setRows((current) => current.map((row) => (row.id === pendingId ? completedRow : row)));
      } catch (error) {
        const failedRow = {
          ...pendingRow,
          customerName: "Failed",
          route: error instanceof Error ? error.message : "Extraction failed",
          status: "failed",
          confidence: 0
        };

        setRows((current) => current.map((row) => (row.id === pendingId ? failedRow : row)));
        setNotice({
          tone: "danger",
          message: failedRow.route
        });
      }
    }

    setIsUploading(false);
    event.target.value = "";
  }

  function updateField(field, value) {
    setReviewData((current) => ({
      ...current,
      [field]: value
    }));
  }

  function patchSelectedRow(updates) {
    setRows((current) =>
      current.map((row) =>
        row.id === selectedRow?.id
          ? {
              ...row,
              ...updates
            }
          : row
      )
    );
  }

  async function confirmBooking() {
    if (!selectedRow?.extractionId || !selectedRow?.documentId) {
      setNotice({ tone: "danger", message: "Upload and extract a real document before confirming." });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      const extraction = buildExtractionPayload(reviewData);
      const response = await fetch("/api/admin/confirm-extraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractionId: selectedRow.extractionId,
          documentId: selectedRow.documentId,
          extraction
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Could not confirm booking");
      }

      patchSelectedRow({
        status: "saved",
        customerName: extraction.customerName || "Saved",
        route: formatRoute(extraction),
        extraction
      });
      setNotice({
        tone: "success",
        message: `Booking ${payload.booking.booking_code} created with ${payload.tasksCreated} tasks.`
      });
    } catch (error) {
      setNotice({
        tone: "danger",
        message: error instanceof Error ? error.message : "Could not confirm booking"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function saveDocumentOnly() {
    if (!selectedRow?.extractionId || !selectedRow?.documentId) {
      setNotice({ tone: "danger", message: "Upload and extract a real document before saving." });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      const extraction = buildExtractionPayload(reviewData);
      const response = await fetch("/api/admin/intake", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_document",
          extractionId: selectedRow.extractionId,
          documentId: selectedRow.documentId,
          extraction
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Could not save document");
      }

      patchSelectedRow({
        status: payload.status,
        customerName: extraction.customerName || "Needs review",
        route: formatRoute(extraction),
        extraction
      });
      setNotice({ tone: "success", message: "Document saved without creating a booking." });
    } catch (error) {
      setNotice({
        tone: "danger",
        message: error instanceof Error ? error.message : "Could not save document"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function markFailed() {
    if (!selectedRow?.extractionId || !selectedRow?.documentId) {
      setNotice({ tone: "danger", message: "Upload and extract a real document before marking failed." });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/intake", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_failed",
          extractionId: selectedRow.extractionId,
          documentId: selectedRow.documentId,
          reason: reviewData.rawNotes || "Marked failed during manual review."
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Could not mark failed");
      }

      patchSelectedRow({ status: "failed", route: payload.reason });
      setNotice({ tone: "success", message: "Document marked failed." });
    } catch (error) {
      setNotice({
        tone: "danger",
        message: error instanceof Error ? error.message : "Could not mark failed"
      });
    } finally {
      setIsSaving(false);
    }
  }

  const statusTone =
    selectedRow?.status === "ready_to_review" || selectedRow?.status === "saved"
      ? "success"
      : selectedRow?.status === "failed"
        ? "danger"
        : "warn";

  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-6">
      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <AdminCard className="p-3 sm:p-5">
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-accent/35 bg-[radial-gradient(circle_at_top,#eff7f3,transparent_55%),linear-gradient(135deg,#fbfdfc,#eef5f1)] p-4 text-center sm:min-h-56 sm:p-6">
            <UploadCloud size={38} className="text-accent" />
            <h2 className="mt-4 text-xl font-semibold">Upload ticket files</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
              PDF, PNG, JPG, and WEBP uploads are stored in Supabase, extracted through Claude Haiku, and held for human review before booking creation.
            </p>
            <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-deep">
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {isUploading ? "Extracting..." : "Choose files"}
              <input
                type="file"
                className="sr-only"
                multiple
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={handleFiles}
              />
            </label>
          </div>
        </AdminCard>
        <AdminCard className="p-4 sm:p-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/45">
            Batch status
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Files", rows.length],
              ["Need review", rows.filter((row) => row.status === "needs_review").length],
              ["Ready", rows.filter((row) => row.status === "ready_to_review").length],
              ["Failed", rows.filter((row) => row.status === "failed").length]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-accent-soft p-3">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-ink/55">{label}</p>
              </div>
            ))}
          </div>
        </AdminCard>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
        <AdminCard>
          <div className="border-b border-ink/10 p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Upload queue</h2>
            <p className="text-sm text-ink/55">Live Supabase rows. Select a file to review or edit extracted fields.</p>
          </div>
          <div className="divide-y divide-ink/10">
            {isLoadingRows && (
              <div className="flex items-center gap-2 p-4 text-sm text-ink/55">
                <Loader2 size={16} className="animate-spin" />
                Loading intake queue...
              </div>
            )}
            {!isLoadingRows && rows.length === 0 && (
              <div className="p-5 text-sm text-ink/55">
                No uploaded documents yet. Add the first ticket from the upload area above.
              </div>
            )}
            {rows.map((row) => (
              <button
                key={row.id}
                className={`flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-accent-soft/45 ${
                  row.id === selectedRow?.id ? "bg-accent-soft/70" : ""
                }`}
                onClick={() => selectRow(row)}
                type="button"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText size={18} className="shrink-0 text-accent" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.fileName}</p>
                    <p className="truncate text-sm text-ink/55">
                      {row.customerName} · {row.route}
                    </p>
                  </div>
                </div>
                <AdminBadge tone={row.status === "ready_to_review" || row.status === "saved" ? "success" : row.status === "failed" ? "danger" : "warn"}>
                  {row.status}
                </AdminBadge>
              </button>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Review extraction</h2>
              <p className="text-sm text-ink/55">{selectedRow?.fileName ?? "No document selected"}</p>
            </div>
            <AdminBadge tone={statusTone}>{selectedRow?.status ?? "waiting"}</AdminBadge>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["customerName", "Customer name"],
              ["mobileNumber", "Mobile number"],
              ["email", "Email"],
              ["bookingType", "Booking type"],
              ["market", "Market"],
              ["journeyType", "Journey type"],
              ["departure", "Departure"],
              ["arrival", "Arrival"],
              ["travelDate", "Travel date"],
              ["returnDate", "Return date"],
              ["provider", "Provider"],
              ["pnrOrConfirmation", "PNR / confirmation"],
              ["baseCost", "Base cost"],
              ["sellingPrice", "Selling price"],
              ["currency", "Currency"],
              ["confidence", "Confidence"]
            ].map(([field, label]) => (
              <label key={field} className="grid gap-1.5 text-sm font-medium text-ink/70">
                {label}
                <input
                  className="min-h-10 rounded-lg border border-ink/10 bg-white px-3 text-sm text-ink outline-none transition focus:border-accent"
                  value={reviewData[field] ?? ""}
                  onChange={(event) => updateField(field, event.target.value)}
                  disabled={!selectedRow || isSaving}
                />
              </label>
            ))}
          </div>

          <label className="mt-4 grid gap-1.5 text-sm font-medium text-ink/70">
            Notes
            <textarea
              className="min-h-24 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-accent"
              value={reviewData.rawNotes ?? ""}
              onChange={(event) => updateField("rawNotes", event.target.value)}
              disabled={!selectedRow || isSaving}
            />
          </label>

          <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
            <AdminButton type="button" className="w-full sm:w-auto" onClick={confirmBooking} disabled={!selectedRow || isSaving}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Confirm booking
            </AdminButton>
            <AdminButton type="button" tone="light" className="w-full sm:w-auto" onClick={saveDocumentOnly} disabled={!selectedRow || isSaving}>
              Save document only
            </AdminButton>
            <AdminButton type="button" tone="ghost" className="w-full sm:w-auto" onClick={markFailed} disabled={!selectedRow || isSaving}>
              <AlertCircle size={16} />
              Mark failed
            </AdminButton>
          </div>
        </AdminCard>
      </section>
    </div>
  );
}
