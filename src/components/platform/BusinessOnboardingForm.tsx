"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BusinessOnboardingForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [schemeName, setSchemeName] = useState("");
  const [schemeType, setSchemeType] = useState<"POINTS" | "STAMPS">("POINTS");
  const [pointsPerScan, setPointsPerScan] = useState("10");
  const [stampsRequired, setStampsRequired] = useState("10");
  const [stampRewardText, setStampRewardText] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const scheme =
      schemeType === "POINTS"
        ? { name: schemeName, type: schemeType, pointsPerScan }
        : { name: schemeName, type: schemeType, stampsRequired, stampRewardText };

    const res = await fetch("/api/platform/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        category,
        address,
        postcode,
        adminEmail,
        adminPassword,
        scheme,
      }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Couldn't create the business. Check the fields and try again.");
      return;
    }

    router.push("/platform/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium text-zinc-900">Business</legend>
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700">
            Business name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="slug" className="text-sm font-medium text-zinc-700">
            Page URL
          </label>
          <div className="flex items-center gap-1 text-sm text-zinc-500">
            <span>/businesses/</span>
            <input
              id="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium text-zinc-700">
            Category
          </label>
          <input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Cafe"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm font-medium text-zinc-700">
            Address
          </label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="postcode" className="text-sm font-medium text-zinc-700">
            Postcode
          </label>
          <input
            id="postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="e.g. SW1A 1AA"
            className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
          <p className="text-xs text-zinc-500">
            Optional, but needed for the business to show up in “closest to me” sorting.
          </p>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium text-zinc-900">Admin login</legend>
        <div className="flex flex-col gap-1">
          <label htmlFor="adminEmail" className="text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="adminEmail"
            type="email"
            required
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="adminPassword" className="text-sm font-medium text-zinc-700">
            Password
          </label>
          <input
            id="adminPassword"
            type="text"
            required
            minLength={8}
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
          <p className="text-xs text-zinc-500">
            At least 8 characters. Shown in plain text so you can relay it to the business.
          </p>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium text-zinc-900">First loyalty scheme</legend>
        <div className="flex flex-col gap-1">
          <label htmlFor="schemeName" className="text-sm font-medium text-zinc-700">
            Name
          </label>
          <input
            id="schemeName"
            required
            value={schemeName}
            onChange={(e) => setSchemeName(e.target.value)}
            placeholder="e.g. Coffee Stamps"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Type</span>
          <div className="flex gap-4 text-sm text-zinc-700">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={schemeType === "POINTS"}
                onChange={() => setSchemeType("POINTS")}
              />
              Points
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={schemeType === "STAMPS"}
                onChange={() => setSchemeType("STAMPS")}
              />
              Stamp card
            </label>
          </div>
        </div>

        {schemeType === "POINTS" ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="pointsPerScan" className="text-sm font-medium text-zinc-700">
              Points per scan
            </label>
            <input
              id="pointsPerScan"
              type="number"
              min={1}
              required
              value={pointsPerScan}
              onChange={(e) => setPointsPerScan(e.target.value)}
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="stampsRequired" className="text-sm font-medium text-zinc-700">
                Stamps required
              </label>
              <input
                id="stampsRequired"
                type="number"
                min={1}
                required
                value={stampsRequired}
                onChange={(e) => setStampsRequired(e.target.value)}
                className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="stampRewardText" className="text-sm font-medium text-zinc-700">
                Reward
              </label>
              <input
                id="stampRewardText"
                required
                value={stampRewardText}
                onChange={(e) => setStampRewardText(e.target.value)}
                placeholder="e.g. One free coffee"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
              />
            </div>
          </>
        )}
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isSubmitting ? "Creating…" : "Create business"}
      </button>
    </form>
  );
}
