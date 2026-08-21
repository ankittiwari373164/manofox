import {
  Palette, Code2, Share2, PenTool, Search, Users, Megaphone, Calculator,
} from "lucide-react";

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/portfolio", label: "Work" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export const SERVICES = [
  {
    slug: "website-designing",
    title: "Website Designing",
    icon: Palette,
    desc: "Craft visually appealing and user-friendly layouts that enhance user experience and brand identity.",
    points: ["UI/UX design systems", "Responsive layouts", "Brand-first visuals", "Conversion-focused pages"],
  },
  {
    slug: "website-development",
    title: "Website Development",
    icon: Code2,
    desc: "Create personalized, feature-rich websites tailored to your unique business requirements.",
    points: ["Custom web apps", "E-commerce builds", "CMS development", "Performance optimization"],
  },
  {
    slug: "social-media-handling",
    title: "Social Media Handling",
    icon: Share2,
    desc: "Engage and grow your audience through targeted social media strategies across multiple platforms.",
    points: ["Content calendars", "Community management", "Growth campaigns", "Analytics & reporting"],
  },
  {
    slug: "content-creation",
    title: "Content Creation",
    icon: PenTool,
    desc: "Develop compelling and creative content that resonates with your audience engagement.",
    points: ["Blogs & articles", "Video scripts", "Ad copywriting", "Brand storytelling"],
  },
  {
    slug: "seo-management",
    title: "SEO Management",
    icon: Search,
    desc: "Optimize your website to improve search engine rankings and drive organic traffic.",
    points: ["Technical SEO audits", "Keyword strategy", "On-page optimization", "Link building"],
  },
  {
    slug: "crm",
    title: "CRM Solutions",
    icon: Users,
    desc: "Streamline customer interactions with effective Customer Relationship Management systems.",
    points: ["CRM setup & migration", "Sales automation", "Pipeline design", "Team training"],
  },
  {
    slug: "meta-ads",
    title: "Meta Ads Solutions",
    icon: Megaphone,
    desc: "Leverage data-driven advertising to create effective campaigns on Meta platforms.",
    points: ["Campaign strategy", "Audience targeting", "Creative testing", "ROAS optimization"],
  },
  {
    slug: "tally",
    title: "Tally Solutions",
    icon: Calculator,
    desc: "Simplify business accounting with powerful Tally solutions for financial management and reporting.",
    points: ["Tally implementation", "GST compliance", "Custom reports", "Data migration"],
  },
];

export const TESTIMONIALS = [
  {
    quote: "The team at Manofox is truly gifted when it comes to combining creativity with technical skills. They designed my astrology website, created informative content, and promoted it effectively on social platforms. I now have a steady stream of consultation requests.",
    name: "Dr. Shalini Mehta",
    role: "Astrologer",
  },
  {
    quote: "We needed to promote our coaching institute and Manofox delivered beyond expectations. From managing our exam campaigns to optimizing our online visibility, they took care of it all. Very reliable and result-oriented team!",
    name: "Rajiv Thakur",
    role: "Owner, Agrim Classes",
  },
  {
    quote: "Manofox built our website and promoted our online fitness programs with laser-focused campaigns. The result? Increased enrollments and a stronger brand identity. Their creative and analytical approach is just brilliant!",
    name: "Mayank Sain",
    role: "Owner, Fit on Beat",
  },
  {
    quote: "We wanted to scale our smart security system brand digitally. Manofox took care of everything — from web design and SEO to paid campaigns and video content. We're impressed with the consistent results.",
    name: "Shubham Tyagi",
    role: "Owner, Akyoto Secure",
  },
];

export const PORTFOLIO = [
  {
    title: "Agrim Classes",
    category: "Education — Campaign & SEO",
    result: "+212% admissions enquiries",
    image: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYWdlbmN5JTIwb2ZmaWNlfGVufDB8fHx8MTc4NzMxMDc5OXww&ixlib=rb-4.1.0&q=85",
  },
  {
    title: "Fit on Beat",
    category: "Fitness — Web & Meta Ads",
    result: "3.4x enrollment growth",
    image: "https://images.pexels.com/photos/27594597/pexels-photo-27594597.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    title: "Akyoto Secure",
    category: "Security Tech — Full Funnel",
    result: "5x qualified leads",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYWdlbmN5JTIwb2ZmaWNlfGVufDB8fHx8MTc4NzMxMDc5OXww&ixlib=rb-4.1.0&q=85",
  },
  {
    title: "AstroVeda",
    category: "Wellness — Content & Social",
    result: "Steady consultation pipeline",
    image: "https://images.pexels.com/photos/36025195/pexels-photo-36025195.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

export const POSTS = [
  {
    slug: "meta-ads-2026",
    title: "Meta Ads in 2026: What's Actually Working Right Now",
    excerpt: "Advantage+ campaigns, creative testing velocity, and the targeting shifts every advertiser should know this year.",
    category: "Paid Media",
    date: "Jul 02, 2026",
    read: "6 min read",
  },
  {
    slug: "seo-core-web-vitals",
    title: "Core Web Vitals: The Silent Ranking Factor You Keep Ignoring",
    excerpt: "Speed is trust. A practical checklist to get your site into the green and keep it there.",
    category: "SEO",
    date: "Jun 18, 2026",
    read: "8 min read",
  },
  {
    slug: "content-that-converts",
    title: "Content That Converts: Beyond Likes and Shares",
    excerpt: "Vanity metrics don't pay bills. Here's how we build content engines that generate pipeline.",
    category: "Content",
    date: "Jun 05, 2026",
    read: "5 min read",
  },
  {
    slug: "crm-automation-playbook",
    title: "The CRM Automation Playbook for Growing Businesses",
    excerpt: "Stop losing leads in spreadsheets. Automations that save 10+ hours a week and close more deals.",
    category: "CRM",
    date: "May 22, 2026",
    read: "7 min read",
  },
  {
    slug: "brand-identity-digital",
    title: "Why Your Brand Identity Is Your Best SEO Asset",
    excerpt: "Search engines reward brands people remember. The intersection of identity and discoverability.",
    category: "Branding",
    date: "May 08, 2026",
    read: "4 min read",
  },
  {
    slug: "local-seo-delhi",
    title: "Local SEO for Delhi Businesses: A Field Guide",
    excerpt: "Google Business Profile, reviews strategy, and hyper-local keywords that bring footfall.",
    category: "SEO",
    date: "Apr 25, 2026",
    read: "6 min read",
  },
];

export const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/share/1AQjrk1SGu/" },
  { label: "Instagram", href: "https://www.instagram.com/manofoxpvt" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/manofox/" },
  { label: "YouTube", href: "https://youtube.com/@manofoxpvtltd" },
];
