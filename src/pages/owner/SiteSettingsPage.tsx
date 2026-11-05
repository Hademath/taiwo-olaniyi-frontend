import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Check, ImagePlus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { siteSettingsApi } from "../../api";
import { LoadingState } from "../../components/StateViews";
import { messageFor } from "../../lib/format";

export function SiteSettingsPage() {
  const query = useQuery({ queryKey: ["site-settings"], queryFn: siteSettingsApi.get });
  if (query.isLoading) return <LoadingState />;
  return <SettingsForm initialData={query.data} />;
}

function SettingsForm({ initialData }: { initialData?: Awaited<ReturnType<typeof siteSettingsApi.get>> }) {
  const client = useQueryClient();

  const [heroTitle, setHeroTitle] = useState(initialData?.hero_title ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(initialData?.hero_subtitle ?? "");
  const [heroCta, setHeroCta] = useState(initialData?.hero_cta ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialData?.hero_image_url ?? "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(initialData?.hero_image_url ?? null);

  useEffect(() => {
    if (!bannerFile) return;
    const url = URL.createObjectURL(bannerFile);
    setPreviewSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  const mutation = useMutation({
    mutationFn: () => {
      if (bannerFile) {
        const form = new FormData();
        form.append("hero_image", bannerFile);
        form.append("hero_title", heroTitle);
        form.append("hero_subtitle", heroSubtitle);
        form.append("hero_cta", heroCta);
        return siteSettingsApi.update(form);
      }
      return siteSettingsApi.update({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_cta: heroCta,
        hero_image_url: heroImageUrl || "",
      });
    },
    onSuccess: () => {
      toast.success("Site settings saved");
      client.invalidateQueries({ queryKey: ["site-settings"] });
      client.invalidateQueries({ queryKey: ["public-site-settings"] });
      setBannerFile(null);
    },
    onError: (error) => toast.error(messageFor(error)),
  });

  return (
    <div className="editor-page stack-lg">
      <div className="editor-topline">
        <span className="back-link">Site Settings</span>
        <div className="editor-actions">
          <Link to="/" target="_blank" className="button button-quiet">
            Preview site <ArrowUpRight size={14} />
          </Link>
          <button
            className="button button-primary"
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <Save size={15} /> {mutation.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <section className="editor-main">
          <p className="eyebrow" style={{ marginBottom: 18 }}>HERO SECTION</p>

          <label className="field-label">
            Headline
            <input
              className="title-input"
              style={{ fontSize: 18, minHeight: 48 }}
              placeholder="Language, Literature, and the power of ideas."
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              maxLength={255}
            />
          </label>

          <label className="field-label" style={{ marginTop: 16 }}>
            Subtitle
            <textarea
              className="excerpt-input"
              placeholder="Essays, scholarship, and writing from a career in English literature and language."
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={2}
              maxLength={1000}
            />
          </label>

          <label className="field-label" style={{ marginTop: 16 }}>
            Call-to-action text
            <input
              type="text"
              className="excerpt-input"
              style={{ padding: "10px 14px" }}
              placeholder="Explore the portfolio"
              value={heroCta}
              onChange={(e) => setHeroCta(e.target.value)}
              maxLength={120}
            />
          </label>

          {/* Live banner preview */}
          {previewSrc && (
            <div className="settings-hero-preview" style={{ marginTop: 28 }}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>BANNER PREVIEW</p>
              <div
                className="settings-hero-mockup"
                style={{ backgroundImage: `linear-gradient(90deg, rgb(15 25 60 / .88), rgb(15 25 60 / .44) 55%, rgb(15 25 60 / .1)), url("${previewSrc}")` }}
              >
                <div className="settings-hero-mockup-copy">
                  <p className="public-kicker" style={{ color: "#c9b97a" }}><span style={{ background: "#c9b97a" }} /> AN ACADEMIC PORTFOLIO</p>
                  <h2 style={{ margin: "10px 0 8px", fontSize: 28, lineHeight: 1.15 }}>{heroTitle || "Headline"}</h2>
                  <p style={{ margin: 0, fontSize: 13, opacity: .85 }}>{heroSubtitle || "Subtitle"}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 18, fontSize: 11, fontWeight: 700, color: "#c8d6ff" }}>{heroCta || "CTA text"}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="editor-aside">
          <div className="aside-card">
            <h3>Banner image</h3>
            <p>Upload a custom image for your landing page hero. For best results use a wide landscape photo (1800 × 600 px or larger).</p>
            <label className="upload-zone" style={{ minHeight: 120 }}>
              {bannerFile
                ? <div className="file-selected"><Check size={17} /><span>{bannerFile.name}</span></div>
                : previewSrc
                  ? <div className="image-preview" style={{ backgroundImage: `url(${previewSrc})` }}><span>Change banner</span></div>
                  : <><ImagePlus size={22} /><span>Choose an image</span><small>JPEG, PNG or WebP, up to 100 MB</small></>
              }
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setBannerFile(f);
                  if (!f) setHeroImageUrl("");
                }}
              />
            </label>
            <label className="field-label compact-label" style={{ marginTop: 10 }}>
              Or paste an image URL
              <input
                type="url"
                placeholder="https://…"
                value={bannerFile ? "" : heroImageUrl}
                disabled={Boolean(bannerFile)}
                onChange={(e) => {
                  setHeroImageUrl(e.target.value);
                  setPreviewSrc(e.target.value || null);
                  setBannerFile(null);
                }}
              />
            </label>
            {(previewSrc || bannerFile) && (
              <button
                type="button"
                className="button button-quiet button-small"
                style={{ marginTop: 8, width: "100%" }}
                onClick={() => { setBannerFile(null); setHeroImageUrl(""); setPreviewSrc(null); }}
              >
                Remove banner image
              </button>
            )}
          </div>

          <div className="aside-card" style={{ marginTop: 0 }}>
            <h3>How it works</h3>
            <p>The banner you upload here appears on your public landing page hero. If no banner is set, the hero shows as a solid navy gradient. The headline, subtitle, and call-to-action text are always displayed on top of the image.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
