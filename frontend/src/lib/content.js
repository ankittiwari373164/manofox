import { useEffect, useState } from "react";
import api from "@/lib/api";

export const DEFAULT_CONTENT = {
  hero_overline: "Digital Marketing Agency — New Delhi",
  hero_title: "We Make Brands Impossible To Ignore",
  hero_subtitle: "Empower your brand with data-driven insights, creative solutions, and cutting-edge technology.",
  about_heading: "Your Trusted Partner for Digital Success",
  about_text: "At Manofox, we help you reach your business objectives by providing customized solutions powered by the latest technology. From web development to Meta ads, our team blends creativity with analytics to deliver measurable growth.",
  cta_heading: "Have a Project in Mind? Let's Bring It to Life!",
  contact_email: "manfoxpvt2023@gmail.com",
  contact_phone: "+91 7217875119",
  contact_address: "532/1, Bank Colony, Durga Vihar, Devli, Delhi 110080",
};

export function useSiteContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  useEffect(() => {
    api.get("/content").then(({ data }) => setContent({ ...DEFAULT_CONTENT, ...data })).catch(() => {});
  }, []);
  return content;
}
