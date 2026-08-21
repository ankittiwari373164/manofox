import { useState } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { MaskedLines, FadeIn, Overline } from "@/components/marketing/Reveal";
import { SERVICES, SOCIALS } from "@/data/site";
import { useSiteContent } from "@/lib/content";

const EMPTY = { name: "", email: "", phone: "", service: "General Inquiry", message: "" };

export default function Contact() {
  const content = useSiteContent();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/leads", form);
      toast.success(data.message);
      setForm(EMPTY);
      setSent(true);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border-b-2 border-neutral-200 bg-transparent px-0 py-3 text-base text-obsidian placeholder:text-neutral-400 focus:border-fox focus:outline-none transition-colors duration-200";

  return (
    <div data-testid="contact-page">
      <section className="relative overflow-hidden bg-noise px-4 pt-40 pb-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-16 right-0 select-none font-display text-[14vw] font-extrabold leading-none text-stroke opacity-50">
          HELLO
        </div>
        <div className="relative mx-auto max-w-7xl">
          <Overline>Contact</Overline>
          <MaskedLines
            lines={["Let's build something", "worth talking about."]}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tighter text-obsidian sm:text-6xl lg:text-7xl"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-4 pb-24 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-32">
        <FadeIn className="lg:col-span-7">
          {sent ? (
            <div className="flex h-full flex-col items-start justify-center rounded-3xl border border-fox/20 bg-fox-light p-12" data-testid="contact-success">
              <CheckCircle2 className="h-14 w-14 text-fox" />
              <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-obsidian">Message received!</h2>
              <p className="mt-3 max-w-md text-neutral-600">
                Thank you for reaching out. Our team will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSent(false)}
                data-testid="contact-send-another"
                className="mt-8 rounded-full border-2 border-fox px-6 py-3 font-semibold text-fox transition-colors duration-200 hover:bg-fox hover:text-white"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm md:p-12" data-testid="contact-form">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Your Name *</label>
                  <input required minLength={2} value={form.name} onChange={set("name")} placeholder="Rahul Sharma" data-testid="contact-name-input" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Email *</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" data-testid="contact-email-input" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Phone</label>
                  <input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" data-testid="contact-phone-input" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Service Needed</label>
                  <select value={form.service} onChange={set("service")} data-testid="contact-service-select" className={`${inputCls} cursor-pointer`}>
                    <option>General Inquiry</option>
                    {SERVICES.map((s) => (
                      <option key={s.slug}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-8">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Tell us about your project *</label>
                <textarea
                  required
                  minLength={5}
                  rows={4}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Goals, timeline, budget — anything that helps us prepare."
                  data-testid="contact-message-input"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid="contact-submit-button"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-fox px-8 py-4 font-display font-bold text-white shadow-lg shadow-fox/25 transition-transform duration-200 hover:scale-105 hover:bg-fox-dark disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Message"} <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </FadeIn>

        <FadeIn delay={0.15} className="lg:col-span-5">
          <div className="rounded-3xl bg-obsidian p-10 text-white md:p-12" data-testid="contact-info-card">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Talk to a human, not a bot</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Call, write or drop by — we reply fast and we speak plain language.
            </p>
            <ul className="mt-10 space-y-7">
              <li className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fox/15 text-fox"><Phone className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Phone</p>
                  <a href={`tel:${content.contact_phone.replace(/\s/g, "")}`} data-testid="contact-phone-link" className="mt-1 block font-semibold hover:text-fox">{content.contact_phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fox/15 text-fox"><Mail className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Email</p>
                  <a href={`mailto:${content.contact_email}`} data-testid="contact-email-link" className="mt-1 block break-all font-semibold hover:text-fox">{content.contact_email}</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fox/15 text-fox"><MapPin className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Studio</p>
                  <p className="mt-1 font-semibold leading-relaxed">{content.contact_address}</p>
                </div>
              </li>
            </ul>
            <div className="mt-10 flex gap-5 border-t border-white/10 pt-8">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" data-testid={`contact-social-${s.label.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-white/50 transition-colors duration-200 hover:text-fox">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
