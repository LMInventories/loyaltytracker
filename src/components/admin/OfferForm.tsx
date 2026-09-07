"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Offer = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

function toDateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

function toIsoOrEmpty(dateInput: string) {
  return dateInput ? new Date(`${dateInput}T00:00:00.000Z`).toISOString() : "";
}

export function OfferForm({ offer }: { offer?: Offer }) {
  const router = useRouter();
  const [title, setTitle] = useState(offer?.title ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [imageUrl, setImageUrl] = useState(offer?.imageUrl ?? "");
  const [startsAt, setStartsAt] = useState(toDateInput(offer?.startsAt ?? null));
  const [endsAt, setEndsAt] = useState(toDateInput(offer?.endsAt ?? null));
  const [isActive, setIsActive] = useState(offer?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const body = {
      title,
      description,
      imageUrl,
      startsAt: toIsoOrEmpty(startsAt),
      endsAt: toIsoOrEmpty(endsAt),
      ...(offer ? { isActive } : {}),
    };

    const res = await fetch(offer ? `/api/admin/offers/${offer.id}` : "/api/admin/offers", {
      method: offer ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("Couldn't save the offer. Check the fields and try again.");
      return;
    }

    router.push("/admin/offers");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-zinc-700">
          Title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 20% off pastries this week"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-zinc-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="imageUrl" className="text-sm font-medium text-zinc-700">
          Image URL (optional)
        </label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="startsAt" className="text-sm font-medium text-zinc-700">
            Starts
          </label>
          <input
            id="startsAt"
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="endsAt" className="text-sm font-medium text-zinc-700">
            Ends
          </label>
          <input
            id="endsAt"
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>
      </div>

      {offer && (
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active (visible to customers)
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : offer ? "Save changes" : "Create offer"}
      </button>
    </form>
  );
}
