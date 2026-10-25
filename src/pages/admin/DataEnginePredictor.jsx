import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, AlertCircle, Loader2, CheckCircle2, ServerCrash,
  Send, Zap, Trash2, Box, Activity, Share2, Square,
  Users, Package, Globe, Megaphone, Code2, Briefcase,
  Gift, Star, Crown, TrendingUp, Sparkles, Search,
  BarChart2, PieChart, LineChart, Bot, Layers, Target,
  ShoppingBag, BookOpen, ChevronRight, Plus, ChevronDown,
  Clock, Smartphone, Copy, MessageCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart as RechartsPie, Pie, Cell, Legend,
  LineChart as RechartsLine, Line, AreaChart, Area
} from 'recharts';
import { useStore } from '../../store';
import { Message, MessageContent, MessageAvatar } from '../../components/ui/message';
import { BorderBeam } from '../../components/ui/border-beam';

// â”€â”€â”€ PERSONA DEFINITIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PERSONAS = [
    {
      id: 'analyst',
      label: 'Data Analyst',
      icon: <BarChart2 size={18} />,
      color: '#4f46e5',
      bg: '#e0e7ff',
      description: 'JSON parsing, math, funnels, drop-offs',
      systemPrompt: "You are an expert Data Analyst for Diar e-commerce. Your job is to read raw data (like JSON arrays), calculate drop-off rates accurately, and identify funnel weaknesses. Always double-check your math. Never guess or hallucinate numbers. Use logical step-by-step reasoning."
    },
  {
    id: 'marketer',
    label: 'Super Marketer',
    icon: <Megaphone size={18} />,
    color: '#e11d48',
    bg: '#fff1f2',
    description: 'Ad strategy, targeting, campaign angles',
    systemPrompt: `You are an elite performance marketer with 15+ years managing millions in ad spend on Meta, TikTok, and Google. 
You specialize in Egypt/MENA e-commerce. You think in ROAS, LTV, CAC, and creative angles.
When developing a brand, always apply the EPIC Framework: Existence (Origin/Problem/Solution), Purpose (Values/Beliefs), Identity (Logo/Colors/Visuals), and Connection (Brand Voice).

[COPYWRITING FRAMEWORK]
Always use Molly Pittman's 3-Part Ad Copy Framework:
1. Opening (Call out the audience and pique curiosity using Pain Point, Feeling, or Logic hooks)
2. Transition (Introduce the solution and benefits)
3. Call-to-Action (Clear, short, and sweet instructions on what to do next)
Apply these tips: Tie text to visuals, tailor to specific segments, speak directly to the user, use emojis appropriately, mention price if it fits, and create urgency with timeframes (e.g., "today", "this week").

When advising on community management (Meta Business Suite/WhatsApp), strictly enforce the "3-Message Rule" for automated bots: never exceed 3 automated messages and always offer a human agent.
You give brutally honest, specific, actionable advice. No fluff. Use emojis sparingly for emphasis.

[GENERATIVE UI INSTRUCTIONS]
If asked to analyze a customer journey, DO NOT write text. You MUST output ONLY a JSON block wrapped in \`\`\`journey ... \`\`\`. Example format:
\`\`\`journey
{ "name": "Name", "spent": "Amount", "timeline": [{"event": "view_page", "detail": "Page"}, {"event": "add_to_cart", "detail": "Item"}], "intent": "Short analysis", "upsell": "Recommendation" }
\`\`\`

If asked to write WhatsApp broadcast messages, DO NOT write text. You MUST output ONLY a JSON array wrapped in \`\`\`whatsapp ... \`\`\`. Example format:
\`\`\`whatsapp
[ {"type": "Flash Sale", "message": "Your arabic message here"}, {"type": "Cart Abandonment", "message": "Your arabic message here"} ]
\`\`\`
`
  },
  {
    id: 'content',
    label: 'Content Writer',
    icon: <BookOpen size={18} />,
    color: '#7c3aed',
    bg: '#f5f3ff',
    description: 'Ad copy, captions, scripts, hooks',
    systemPrompt: `You are a world-class Arabic/English bilingual copywriter and content creator for Egyptian e-commerce brands.
You write scroll-stopping ad copy, Instagram captions, TikTok scripts, and WhatsApp messages.
When advising on visual content, advocate for the Rule of Thirds, negative space, leading lines, and recommend tools like Canva, VSCO, InShot, and CapCut.

[COPYWRITING FRAMEWORK]
Always use Molly Pittman's 3-Part Ad Copy Framework:
1. Opening (Call out the audience and pique curiosity using Pain Point, Feeling, or Logic hooks)
2. Transition (Introduce the solution and benefits)
3. Call-to-Action (Clear, short, and sweet instructions on what to do next)
Apply these 7 tips: Tie text to visuals, tailor to specific segments, speak directly to the user, use emojis appropriately, be recognizable, mention price if it fits, and create urgency with timeframes (e.g., "today", "this week").

Your hooks are emotional, create FOMO, use social proof, and trigger urgency.
Always write in Egyptian Arabic dialect when writing Arabic copy.
Structure copy with: Hook â†’ Problem â†’ Solution â†’ CTA.
Give multiple variations (A, B, C) so the user can test.`
  },
  {
    id: 'mediabuyer',
    label: 'Media Buyer',
    icon: <Target size={18} />,
    color: '#0891b2',
    bg: '#ecfeff',
    description: 'Budget, bidding, audience, optimization',
    systemPrompt: `You are an expert media buyer specializing in Meta Ads for Egyptian e-commerce.
You know exactly how to structure campaigns (CBO vs ABO), audiences (broad vs lookalike vs interest), 
bidding strategies (lowest cost vs bid cap vs cost cap), and creative testing.
You understand the Egyptian market: peak hours (8-11pm), mobile-first, WhatsApp checkout preference.
Give specific numbers: budget splits, audience sizes, frequency caps, break-even ROAS.`
  },
  {
    id: 'cto',
    label: 'CTO',
    icon: <Code2 size={18} />,
    color: '#059669',
    bg: '#ecfdf5',
    description: 'Tech stack, automation, integrations',
    systemPrompt: `You are a senior CTO and full-stack engineer specializing in e-commerce tech stacks.
You advise on: automation, API integrations, data pipelines, performance optimization, and scaling.
For this Diar store specifically: it uses React + Vite frontend, Node.js/Express backend, Firebase for data, Vercel for hosting.
Give practical, implementable advice. Suggest specific tools, libraries, and services.
Think about: reducing manual work, automating reports, integrating with Meta/WhatsApp/shipping APIs.`
  },
  {
    id: 'bizdev',
    label: 'Business Dev',
    icon: <Briefcase size={18} />,
    color: '#d97706',
    bg: '#fffbeb',
    description: 'Growth, partnerships, pricing, strategy',
    systemPrompt: `You are a serial entrepreneur and business development expert focused on Egyptian/MENA e-commerce.
You think about unit economics, market positioning, competitor differentiation, and growth channels.
You understand Egyptian consumer behavior, payment preferences (COD vs online), and market seasons.
Give strategic frameworks like BCG matrix, Porter's 5 Forces, or Jobs-to-be-Done when relevant.
Focus on: revenue growth, margin improvement, and sustainable competitive advantage.`
  },
  {
    id: 'loyalty',
    label: 'Loyalty Master',
    icon: <Crown size={18} />,
    color: '#b45309',
    bg: '#fefce8',
    description: 'Rewards, retention, VIP programs',
    systemPrompt: `You are a customer loyalty and retention expert with deep knowledge of points programs, VIP tiers, 
referral mechanics, and retention campaigns for Egyptian e-commerce.
You know that Egyptian customers respond to: exclusive early access, WhatsApp-first notifications, cashback in EGP,
family/friend referrals, and Ramadan/seasonal special events.
Design loyalty programs that are simple to understand, generous enough to feel real, and operationally feasible for a small team.
Give specific tier names, point values, redemption rules, and communication templates.`
  }
];

// â”€â”€â”€ TABS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TABS = [
  { id: 'chat',     label: 'AI Team',      icon: <Bot size={16} /> },
  { id: 'products', label: 'Products',     icon: <Package size={16} /> },
  { id: 'users',    label: 'Users',        icon: <Users size={16} /> },
  { id: 'adspy',    label: 'Ads Spy',      icon: <Search size={16} /> },
  { id: 'loyalty',  label: 'Loyalty',      icon: <Crown size={16} /> },
  { id: 'reports',  label: 'Reports',      icon: <BarChart2 size={16} /> },
];

// â”€â”€â”€ CHART COLORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CHART_COLORS = ['#1877F2', '#7c3aed', '#e11d48', '#059669', '#d97706', '#0891b2'];

// â”€â”€â”€ SIMPLE MARKDOWN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SimpleMarkdown = ({ text }) => {
  if (!text) return null;
  const blocks = text.split('\n\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {blocks.map((block, idx) => {
        if (block.startsWith('### ')) return <h3 key={idx} style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{block.slice(4)}</h3>;
        if (block.startsWith('## ')) return <h2 key={idx} style={{ margin: '12px 0 4px', fontSize: '18px', fontWeight: 700 }}>{block.slice(3)}</h2>;
        if (block.startsWith('#### ')) return <h4 key={idx} style={{ margin: '6px 0 2px', fontSize: '14px', fontWeight: 700 }}>{block.slice(5)}</h4>;
        if (block.includes('\n- ') || block.startsWith('- ')) {
          const items = block.split('\n').filter(l => l.trim().startsWith('- ')).map(l => l.slice(2));
          return <ul key={idx} style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />)}
          </ul>;
        }
        if (/^\d+\./.test(block.trim())) {
          const items = block.split('\n').filter(l => /^\d+\./.test(l.trim())).map(l => l.replace(/^\d+\.\s*/, ''));
          return <ol key={idx} style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />)}
          </ol>;
        }
        return <p key={idx} style={{ margin: 0, lineHeight: '1.65' }} dangerouslySetInnerHTML={{ __html: formatInline(block) }} />;
      })}
    </div>
  );
};

const formatInline = (text) => {
  let f = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--primary); font-weight: 700;">$1</strong>');
  f = f.replace(/\*(.*?)\*/g, '<em style="color: #0ea5e9;">$1</em>');
  f = f.replace(/!\[([^\]]*)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 240px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 16px rgba(0,0,0,0.1); display: block; margin: 12px 0; border: 1px solid #e2e8f0;" />');
  f = f.replace(/\[([^\]]+)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--primary); font-weight: 600; text-decoration: underline; text-underline-offset: 4px;">$1</a>');
  f = f.replace(/`(.*?)`/g, '<code style="background:#f1f5f9;color:#e11d48;padding:2px 5px;border-radius:4px;font-size:13px;font-family:monospace">$1</code>');
  return f;
};

// â”€â”€â”€ INLINE CHART PARSER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const parseChartFromText = (text) => {
  if (!text) return null;
  const chartMatch = text.match(/```chart\n([\s\S]*?)```/);
  if (chartMatch) {
    try { return JSON.parse(chartMatch[1]); } catch { return null; }
  }
  return null;
};

const parseGenerativeUI = (text) => {
  if (!text) return { journeyData: null, whatsappData: null, cleanText: text };
  let cleanText = text;
  
  let journeyData = null;
  const journeyMatch = text.match(/```journey\n([\s\S]*?)```/);
  if (journeyMatch) {
    try { journeyData = JSON.parse(journeyMatch[1]); } catch {}
    cleanText = cleanText.replace(/```journey\n[\s\S]*?```/, '');
  }

  let whatsappData = null;
  const whatsappMatch = text.match(/```whatsapp\n([\s\S]*?)```/);
  if (whatsappMatch) {
    try { whatsappData = JSON.parse(whatsappMatch[1]); } catch {}
    cleanText = cleanText.replace(/```whatsapp\n[\s\S]*?```/, '');
  }

  return { journeyData, whatsappData, cleanText };
};

const InlineChart = ({ chartData }) => {
  if (!chartData) return null;
  const { type, data, title, xKey, yKey, nameKey, valueKey } = chartData;

  const commonProps = {
    width: '100%', height: 200,
    style: { marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }
  };

  if (type === 'bar') return (
    <div style={commonProps.style}>
      {title && <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey={xKey || 'name'} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Bar dataKey={yKey || 'value'} fill="#1877F2" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (type === 'pie') return (
    <div style={commonProps.style}>
      {title && <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>}
      <ResponsiveContainer width="100%" height={160}>
        <RechartsPie>
          <Pie data={data} dataKey={valueKey || 'value'} nameKey={nameKey || 'name'} cx="50%" cy="50%" outerRadius={60} label>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );

  if (type === 'line') return (
    <div style={commonProps.style}>
      {title && <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1877F2" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey={xKey || 'name'} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Area type="monotone" dataKey={yKey || 'value'} stroke="#1877F2" strokeWidth={2} fill="url(#colorGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  // KPI cards
  if (type === 'kpi') return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.length, 3)}, 1fr)`, gap: '8px', marginTop: '12px' }}>
      {data.map((item, i) => (
        <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: CHART_COLORS[i % CHART_COLORS.length] }}>{item.value}</p>
          {item.change && <p style={{ margin: '2px 0 0', fontSize: '11px', color: item.change.startsWith('+') ? '#059669' : '#e11d48' }}>{item.change}</p>}
        </div>
      ))}
    </div>
  );

  return null;
};

// â”€â”€â”€ LOYALTY PROGRAM COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LoyaltyProgram = ({ allOrders }) => {
  const tiers = [
    { name: 'Bronze', nameAr: 'Ø¨Ø±ÙˆÙ†Ø²ÙŠ', min: 0, max: 999, color: '#b45309', icon: 'ðŸ¥‰', perks: ['5% discount on next order', 'Birthday gift', 'Early sale access'] },
    { name: 'Silver', nameAr: 'ÙØ¶ÙŠ', min: 1000, max: 2999, color: '#64748b', icon: 'ðŸ¥ˆ', perks: ['10% discount always', 'Free shipping', 'Priority customer service', 'Monthly exclusive deals'] },
    { name: 'Gold', nameAr: 'Ø°Ù‡Ø¨ÙŠ', min: 3000, max: 5999, color: '#d97706', icon: 'ðŸ¥‡', perks: ['15% discount always', 'Free express shipping', 'Dedicated WhatsApp line', 'First access to new products'] },
    { name: 'VIP Diamond', nameAr: 'Ù…Ø§Ø³ÙŠ', min: 6000, max: Infinity, color: '#7c3aed', icon: 'ðŸ’Ž', perks: ['20% discount always', 'Personal stylist', 'Free returns', 'Surprise monthly gift', 'Co-creation opportunities'] },
  ];

  // Calculate customer totals from orders
  const customerTotals = {};
  allOrders.forEach(order => {
    const name = order.customer || order.customerName || 'Unknown';
    const phone = order.phone || '';
    const key = phone || name;
    if (!customerTotals[key]) customerTotals[key] = { name, phone, total: 0, orders: 0 };
    customerTotals[key].total += parseFloat(order.total) || 0;
    customerTotals[key].orders += 1;
  });

  const customers = Object.values(customerTotals).sort((a, b) => b.total - a.total);

  const getTier = (total) => tiers.find(t => total >= t.min && total <= t.max) || tiers[0];

  const tierCounts = tiers.map(t => ({
    ...t,
    count: customers.filter(c => getTier(c.total).name === t.name).length
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #1877F2)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Crown size={28} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Diar Loyalty Program</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Ø¨Ø±Ù†Ø§Ù…Ø¬ ÙˆÙ„Ø§Ø¡ Ø¯Ø§Ø± â€” Reward Your Best Customers</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{customers.length}</p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Total Customers</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{customers.filter(c => getTier(c.total).name !== 'Bronze').length}</p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Loyal Customers</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{customers.filter(c => getTier(c.total).name === 'VIP Diamond').length}</p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>VIP Diamond</p>
          </div>
        </div>
      </div>

      {/* Tier Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {tierCounts.map(tier => (
          <div key={tier.name} className="premium-card" style={{ padding: '20px', borderTop: `3px solid ${tier.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{tier.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '16px', color: tier.color }}>{tier.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  {tier.max === Infinity ? `${tier.min.toLocaleString()}+ EGP` : `${tier.min.toLocaleString()} â€“ ${tier.max.toLocaleString()} EGP`}
                </p>
              </div>
              <div style={{ marginLeft: 'auto', background: tier.color + '20', color: tier.color, borderRadius: '20px', padding: '2px 10px', fontSize: '14px', fontWeight: 700 }}>
                {tier.count}
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tier.perks.map((perk, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{perk}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Top customers by tier */}
      <div className="premium-card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>ðŸ† Customer Rankings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {customers.slice(0, 10).map((c, i) => {
            const tier = getTier(c.total);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: tier.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: tier.color, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--on-surface-variant)' }}>{c.orders} orders Â· {c.phone}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: tier.color }}>{c.total.toFixed(0)} EGP</p>
                  <p style={{ margin: 0, fontSize: '11px' }}>{tier.icon} {tier.name}</p>
                </div>
              </div>
            );
          })}
          {customers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
              <Crown size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>No orders yet. Start selling to build your loyalty program!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ ADS SPY COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AdsSpy = ({ messages, setMessages, streamOllamaChat, loading, ollamaStatus, products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [webSearching, setWebSearching] = useState(false);
  const [webResults, setWebResults] = useState([]);

  const searchCompetitorAds = async () => {
    if (!searchQuery.trim() && !selectedProduct) return;
    const query = searchQuery || selectedProduct?.titleAr || selectedProduct?.title || selectedProduct?.name || '';
    setWebSearching(true);
    setWebResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query + ' facebook ad buy online egypt')}`);
      const data = await res.json();
      setWebResults(data.results || []);
      // Now ask AI to analyze
      const prompt = `I searched the web for competitor ads for "${query}". Here are the search results:
${(data.results || []).map((r, i) => `${i+1}. ${r.title}: ${r.snippet} [${r.url}]`).join('\n')}

Task: As a media buyer expert, analyze these competitor ads. 
- What angles/hooks are competitors using?
- What's the emotional trigger in their messaging?
- What's likely their target audience?
- Write me 3 superior ad angles I should use to beat them.
- Suggest the best creative format (video hook, carousel, single image) for each angle.`;
      streamOllamaChat([...messages, { role: 'user', content: prompt }]);
    } catch (e) {
      // fallback: ask AI without web data
      const prompt = `Search for competitor ads for this product: "${query}"
Based on your knowledge of Egyptian e-commerce and Meta Ads:
- What angles/hooks do competitors typically use for this type of product?
- What's working in the Egyptian market right now?
- Write 3 ad angles I should test, with hooks, body copy, and CTA.
- Suggest budget split across 3 ad sets.`;
      streamOllamaChat([...messages, { role: 'user', content: prompt }]);
    } finally {
      setWebSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="premium-card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>ðŸ” Competitor Ads Spy</h3>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
          Search for competitor ads on Meta/Google and let AI analyze what's working
        </p>
        
        {/* Product quick-select */}
        {products && products.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>QUICK SELECT PRODUCT:</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {products.slice(0, 6).map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProduct(p); setSearchQuery(p.titleAr || p.title || p.name || ''); }}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', border: '1px solid',
                    borderColor: selectedProduct?.id === p.id ? 'var(--primary)' : 'var(--outline-variant)',
                    background: selectedProduct?.id === p.id ? 'var(--primary-container)' : '#fff',
                    color: selectedProduct?.id === p.id ? 'var(--primary)' : 'var(--on-surface)',
                    fontWeight: selectedProduct?.id === p.id ? 700 : 400
                  }}
                >
                  {p.titleAr || p.title || p.name || 'Product'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchCompetitorAds()}
            placeholder="e.g. baby diapers, summer dress, protein powder..."
            style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '14px', outline: 'none' }}
          />
          <button
            onClick={searchCompetitorAds}
            disabled={(!searchQuery.trim() && !selectedProduct) || loading || webSearching}
            className="btn btn-primary"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {webSearching ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
            {webSearching ? 'Searching...' : 'Spy'}
          </button>
        </div>
      </div>

      {/* Web results preview */}
      {webResults.length > 0 && (
        <div className="premium-card" style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>ðŸŒ WEB RESULTS FOUND ({webResults.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {webResults.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '10px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>{r.title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{r.snippet}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ PRODUCTS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ProductsTab = ({ products, allOrders, messages, streamOllamaChat, loading, ollamaStatus }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productMessages, setProductMessages] = useState({});

  const getProductStats = (product) => {
    const productId = product.id;
    const productOrders = allOrders.filter(o =>
      o.cart && o.cart.some(item => item.id === productId || item.productId === productId)
    );
    const revenue = productOrders.reduce((sum, o) => {
      const item = o.cart?.find(i => i.id === productId || i.productId === productId);
      return sum + ((item?.price || 0) * (item?.qty || 1));
    }, 0);
    return { orders: productOrders.length, revenue };
  };

  const analyzeProduct = (product) => {
    const stats = getProductStats(product);
    const prompt = `Analyze this product from my Diar store and help me maximize its sales:

**Product:** ${product.titleAr || product.name || product.title}
**Price:** ${product.price} EGP
**Description:** ${product.description || 'No description'}
**Total Orders:** ${stats.orders}
**Revenue Generated:** ${stats.revenue.toFixed(0)} EGP

Tasks:
1. Rate this product's market potential (1-10) and explain why
2. Give 3 psychological hooks for ads
3. Suggest a better product description (in Arabic)
4. Recommend the best Meta Ads creative format for this product
5. Identify the target customer persona (age, gender, location in Egypt, interests)
6. What's the best time to run ads for this product in Egypt?`;

    streamOllamaChat([...messages, { role: 'user', content: prompt }]);
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Product list */}
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
          {products?.length || 0} Products
        </p>
        {(products || []).map(product => {
          const stats = getProductStats(product);
          return (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              style={{
                padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid',
                borderColor: selectedProduct?.id === product.id ? 'var(--primary)' : 'var(--outline-variant)',
                background: selectedProduct?.id === product.id ? 'var(--primary-container)' : '#fff',
                transition: 'all 0.15s'
              }}
            >
              <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.titleAr || product.name || product.title || 'Unnamed'}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>{product.price} EGP</span>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>·</span>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{stats.orders} orders</span>
              </div>
            </div>
          );
        })}
        {(!products || products.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--on-surface-variant)' }}>
            <Package size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ fontSize: '13px' }}>No products found</p>
          </div>
        )}
      </div>

      {/* Product detail */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedProduct ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Product header */}
            <div className="premium-card" style={{ padding: '20px' }}>
              {(() => {
                const stats = getProductStats(selectedProduct);
                return (
                  <>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800 }}>{selectedProduct.titleAr || selectedProduct.name || selectedProduct.title}</h3>
                    <p style={{ margin: '0 0 16px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>{selectedProduct.description || 'No description'}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      {[
                        { label: 'Price', value: `${selectedProduct.price} EGP`, color: '#1877F2' },
                        { label: 'Total Orders', value: stats.orders, color: '#059669' },
                        { label: 'Revenue', value: `${stats.revenue.toFixed(0)} EGP`, color: '#7c3aed' },
                      ].map((kpi, i) => (
                        <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                          <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{kpi.label}</p>
                          <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: kpi.color }}>{kpi.value}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => analyzeProduct(selectedProduct)}
                      disabled={loading || ollamaStatus !== 'online'}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Sparkles size={16} />
                      Analyze with AI & Get Ad Strategy
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed var(--outline-variant)' }}>
            <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              <Package size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Select a product to analyze</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// â”€â”€â”€ USERS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const UsersTab = ({ trackedCustomers, allOrders, messages, streamOllamaChat, loading, ollamaStatus }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const analyzeUser = (user) => {
    const events = user.trackingData?.events || [];
    const prompt = `Analyze this specific customer's journey on my website:

**Customer:** ${user.customer || user.customerName || 'Unknown'}
**Total Spent:** ${user.total} EGP
**Events:** ${events.map(e => e.type + (e.details?.productName ? ` (${e.details.productName})` : '')).join(' â†’ ')}

Tasks:
1. Map this customer's full journey (where they went, what interested them, where they hesitated)
2. What do their browsing patterns tell you about their intent?
3. Why did they convert (or not convert)?
4. What product should I upsell/cross-sell to this customer?
5. Write a personalized WhatsApp message to re-engage them`;
    streamOllamaChat([...messages, { role: 'user', content: prompt }]);
    setSelectedUser(user);
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
          {trackedCustomers.length} Tracked Users
        </p>
        {trackedCustomers.map((user, i) => (
          <div
            key={i}
            onClick={() => analyzeUser(user)}
            style={{
              padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid',
              borderColor: selectedUser === user ? 'var(--primary)' : 'var(--outline-variant)',
              background: selectedUser === user ? 'var(--primary-container)' : '#fff',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: 'var(--primary)', flexShrink: 0 }}>
                {(user.customer || 'U')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.customer || 'Unknown'}</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--on-surface-variant)' }}>{user.total} EGP Â· {user.trackingData?.events?.length || 0} events</p>
              </div>
            </div>
          </div>
        ))}
        {trackedCustomers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--on-surface-variant)' }}>
            <Users size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ fontSize: '13px' }}>No tracked customers yet</p>
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedUser ? (
          <div className="premium-card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px' }}>{selectedUser.customer}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(selectedUser.trackingData?.events || []).map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>{event.type}</p>
                    {event.details && <p style={{ margin: 0, fontSize: '12px', color: 'var(--on-surface-variant)' }}>{JSON.stringify(event.details)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed var(--outline-variant)' }}>
            <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              <Users size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>Click any user to analyze their journey</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// ðŸŽ¨ GENERATIVE UI COMPONENTS
// ==========================================

const CustomerJourneyUI = ({ data }) => {
  if (!data) return null;
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', margin: '16px 0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#3b82f6" /> {data.name}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Journey Analysis</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{data.spent}</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#10b981', fontWeight: 500, background: '#d1fae5', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>Total Spent</p>
        </div>
      </div>
      
      <div style={{ padding: '20px' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline</h4>
        <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', marginLeft: '12px', paddingBottom: '10px' }}>
          {data.timeline?.map((item, idx) => (
            <div key={idx} style={{ position: 'relative', paddingLeft: '24px', marginBottom: idx === data.timeline.length - 1 ? 0 : '20px' }}>
              <div style={{ position: 'absolute', left: '-6px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: item.event.includes('cart') ? '#e11d48' : '#3b82f6', border: '2px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                {item.event === 'view_page' ? 'Viewed Page' : item.event === 'add_to_cart' ? 'Added to Cart' : item.event}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#e2e8f0', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ background: '#fff', padding: '16px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><Brain size={14} /> Intent</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>{data.intent}</p>
        </div>
        <div style={{ background: '#fff', padding: '16px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> Recommended Upsell</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>{data.upsell}</p>
        </div>
      </div>
    </div>
  );
};

const WhatsAppMockUI = ({ messages }) => {
  if (!messages || !Array.isArray(messages)) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
      {messages.map((msg, idx) => (
        <div key={idx} style={{ background: '#e5ddd5', borderRadius: '24px', overflow: 'hidden', border: '8px solid #0f172a', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#075e54', padding: '12px 16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={16} color="#075e54" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{msg.type}</p>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>Broadcast List</p>
            </div>
          </div>
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: '#dcf8c6', padding: '12px', borderRadius: '8px 8px 0 8px', alignSelf: 'flex-end', maxWidth: '90%', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#111', lineHeight: 1.5, whiteSpace: 'pre-wrap' }} dir="auto">{msg.message}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: '#667781' }}>10:42 AM</span>
                <CheckCircle2 size={12} color="#53bdeb" />
              </div>
            </div>
          </div>
          <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <button 
              onClick={() => navigator.clipboard.writeText(msg.message)}
              style={{ width: '100%', padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '12px', color: '#334155', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
            >
              <Copy size={14} /> Copy for WhatsApp
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ðŸ¤– MAIN COMPONENT ðŸ¤–â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DataEnginePredictor({ trackedCustomers = [], allOrders = [] }) {
  const { products } = useStore();

  const [activeTab, setActiveTab] = useState('chat');
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('diar_ai_history_v2');
      if (saved) {
        return JSON.parse(saved).filter(m => m.content && m.content.trim() !== '');
      }
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  const [modelName, setModelName] = useState('qwen:3b');
  const [ollamaStatus, setOllamaStatus] = useState('checking');
  const [availableModels, setAvailableModels] = useState([]);
  const [savedReports, setSavedReports] = useState(() => {
    const saved = localStorage.getItem('diar_reports_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  useEffect(() => {
    const toSave = messages.filter(m => m.content && m.content.trim() !== '');
    localStorage.setItem('diar_ai_history_v2', JSON.stringify(toSave));
    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        chatScrollRef.current.scrollTop = scrollHeight;
      }
    }
  }, [messages]);

  const checkOllamaConnection = async () => {
    try {
      setOllamaStatus('checking');
      const res = await fetch('http://127.0.0.1:11434/api/tags');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOllamaStatus('online');
      if (data.models?.length > 0) {
        setAvailableModels(data.models.map(m => m.name));
        const preferred = data.models.find(m => m.name.includes('qwen'));
        setModelName(preferred ? preferred.name : data.models[0].name);
      }
    } catch {
      setOllamaStatus('offline');
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const streamOllamaChat = async (newMessagesArray) => {
    setLoading(true);
    setError('');

    const productsContext = products?.map(p => {
      const img = p.image?.length > 200 ? '/placeholder_img' : (p.image || '');
      return `[${p.name}|${p.price}EGP|Img:${img}]`;
    }).join(',') || "None";
    const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const usersContext = trackedCustomers?.length || 0;
    
    // Aggregate events across all users for the AI's report
    const productStats = {};
    let totalViews = 0, totalCarts = 0, totalSales = 0;
    
    trackedCustomers?.forEach(user => {
      user.trackingData?.events?.forEach(e => {
        const pName = e.details?.productName;
        if (pName) {
          if (!productStats[pName]) productStats[pName] = { views: 0, carts: 0, sales: 0 };
          if (e.type === 'view_page') { productStats[pName].views++; totalViews++; }
          if (e.type === 'add_to_cart') { productStats[pName].carts++; totalCarts++; }
        }
      });
    });

    // Aggregate actual sales from orders
    allOrders?.forEach(order => {
      order.items?.forEach(item => {
        const pName = item.title;
        if (pName) {
          if (!productStats[pName]) productStats[pName] = { views: 0, carts: 0, sales: 0 };
          if (typeof productStats[pName].sales === 'undefined') productStats[pName].sales = 0;
          productStats[pName].sales += (item.qty || 1);
          totalSales += (item.qty || 1);
        }
      });
    });
    
    const topViewed = Object.entries(productStats).sort((a,b)=> (b[1].views||0) - (a[1].views||0)).slice(0,3).map(x=>`${x[0]} (${x[1].views||0} views)`);
    const topCarts = Object.entries(productStats).sort((a,b)=> (b[1].carts||0) - (a[1].carts||0)).slice(0,3).map(x=>`${x[0]} (${x[1].carts||0} carts)`);
    const topSales = Object.entries(productStats).sort((a,b)=> (b[1].sales||0) - (a[1].sales||0)).slice(0,3).map(x=>`${x[0]} (${x[1].sales||0} sold)`);
    
    const eventContext = `\\nSTORE ANALYTICS:\\nTotal Store Views: ${totalViews} | Total Add to Carts: ${totalCarts} | Total Items Sold: ${totalSales}\\nTop Viewed Products: ${topViewed.join(', ') || 'N/A'}\\nMost Added to Cart: ${topCarts.join(', ') || 'N/A'}\\nBest Selling Products (Most Orders): ${topSales.join(', ') || 'N/A'}`;

    const contextStr = `\\nSTORE DATA:\\nOrders: ${allOrders?.length||0} | Rev: ${totalRevenue}EGP | Users: ${usersContext}\\nProducts: ${productsContext}\\n${eventContext}\\nTo show product images, use ![Name](image_url).`;

    const systemMsg = { 
      role: 'system', 
      content: activePersona.systemPrompt + '\\n\\n[CRITICAL LANGUAGE INSTRUCTIONS]\\nYou are an Egyptian AI. You must respond ONLY in Arabic (Egyptian dialect). DO NOT output any other languages. Start your response directly without greetings.\\n\\nSTORE CONTEXT:\\n' + contextStr 
    };
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Keep only the last 4 messages, and truncate long ones, so the prompt doesn't get massively bloated
    const recentMessages = newMessagesArray.filter(m => !m.isHidden).slice(-10).map(m => ({
      ...m,
      content: m.content.length > 600 ? m.content.slice(0, 3000) + '... (truncated)' : m.content
    }));
    const withSystem = [systemMsg, ...recentMessages];

    const placeholder = { role: 'assistant', content: '', persona: activePersona.id };
    setMessages([...newMessagesArray, placeholder]);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({ 
          model: modelName, 
          messages: withSystem, 
          stream: true,
          keep_alive: "24h",
          options: {
            temperature: 0.2,
            top_p: 0.9,
            repeat_penalty: 1.1
          }
        })
      });
      if (!response.ok) throw new Error();

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let currentText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete chunk in the buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              currentText += parsed.message.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: currentText };
                return updated;
              });
            }
          } catch (e) {
            console.error('Stream parse error:', e);
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.message?.content) {
            currentText += parsed.message.content;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: currentText };
              return updated;
            });
          }
        } catch(e) {}
      }

      // Save as report
      const report = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        persona: activePersona.label,
        personaColor: activePersona.color,
        title: currentText.slice(0, 80) + (currentText.length > 80 ? '...' : ''),
        messages: [...newMessagesArray, { role: 'assistant', content: currentText }]
      };
      setSavedReports(prev => {
        const updated = [report, ...prev].slice(0, 50);
        localStorage.setItem('diar_reports_v2', JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Cannot connect to AI. Make sure Ollama is running.');
        setOllamaStatus('offline');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', content: chatInput }];
    setChatInput('');
    streamOllamaChat(newMessages);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('diar_ai_history_v2');
  };

  // â”€â”€â”€ QUICK ACTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const quickActions = [
    {
      label: 'Funnel Analysis',
      icon: <BarChart2 size={14} />,
      prompt: () => {
        const customers = trackedCustomers.slice(0, 10).map(c => ({
          name: c.customer, total: c.total,
          events: c.trackingData?.events?.map(e => e.type).join(' â†’ ')
        }));
        return `Analyze our sales funnel and identify where customers drop off:\n${JSON.stringify(customers)}\n\nGive me:\n1. Drop-off rates at each stage with percentages\n2. Top 3 reasons customers abandon\n3. Specific fixes for each drop-off point\n4. Expected ROAS improvement if we fix the top issue`;
      }
    },
    {
      label: 'Top Product Ad',
      icon: <Sparkles size={14} />,
      prompt: () => {
        const p = products?.[0];
        if (!p) return 'What is the best ad strategy for a general e-commerce store in Egypt?';
        return `Write a complete Meta Ads campaign for this product:\nName: ${p.name}\nPrice: ${p.price} EGP\nDescription: ${p.description || 'Fashion product'}\n\nInclude:\n- 3 ad copy variations (hook + body + CTA) in Egyptian Arabic\n- Audience targeting (interests, age, gender, location)\n- Budget recommendation (daily budget, duration)\n- Creative brief (what images/videos to shoot)`;
      }
    },
    {
      label: 'Loyalty Program',
      icon: <Crown size={14} />,
      prompt: () => `Design a complete loyalty program for Diar, an Egyptian fashion e-commerce store. Include:\n1. Tier names (in Arabic and English) with spending thresholds in EGP\n2. Specific rewards for each tier\n3. Points system (how many points per EGP spent)\n4. How to communicate this on WhatsApp\n5. A launch announcement message in Egyptian Arabic\n6. How to track and manage it manually using a simple spreadsheet`
    },
    {
      label: 'WhatsApp Campaign',
      icon: <Gift size={14} />,
      prompt: () => `Write 5 WhatsApp broadcast messages for my Egyptian fashion e-commerce store.\nInclude: flash sale, new arrival, cart abandonment, post-purchase upsell, and loyalty reward.\nWrite in Egyptian Arabic dialect. Keep each under 150 words. Include emojis. Include a clear CTA.`
    }
  ];

  const toggleOllama = async () => {
    const action = ollamaStatus === 'online' ? 'stop' : 'start';
    setOllamaStatus('checking');
    try {
      await fetch('http://localhost:3005/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      setTimeout(checkOllamaConnection, 2000);
    } catch (e) {
      console.error(e);
      setTimeout(checkOllamaConnection, 1000);
    }
  };

  // â”€â”€â”€ OLLAMA STATUS PILL â”€â”€â”€
  const StatusPill = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
      <button 
        onClick={toggleOllama}
        title={ollamaStatus === 'online' ? "Click to Stop AI Server" : "Click to Start AI Server"}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px',
          background: ollamaStatus === 'online' ? '#dcfce7' : ollamaStatus === 'checking' ? '#f1f5f9' : '#fee2e2',
          color: ollamaStatus === 'online' ? '#166534' : ollamaStatus === 'checking' ? '#475569' : '#991b1b',
          fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
        }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
        {ollamaStatus === 'online' ? 'AI Online' : ollamaStatus === 'checking' ? 'Connecting...' : 'AI Offline'}
      </button>
      {availableModels.length > 0 && (
        <select value={modelName} onChange={e => setModelName(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
          {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      )}
    </div>
  );

  return (
    <div dir="ltr" style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>

      {/* â”€â”€â”€ TOP BAR (Sleek Dropdowns) â”€â”€â”€ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 16px 0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {/* Mode Dropdown */}
          <div style={{ position: 'relative' }}>
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
              style={{
                appearance: 'none', padding: '8px 32px 8px 16px', borderRadius: '12px',
                border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 600,
                color: '#1e293b', cursor: 'pointer', outline: 'none'
              }}
            >
              {TABS.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '11px', pointerEvents: 'none', color: '#64748b' }} />
          </div>

          {/* Persona Dropdown (Only in Chat) */}
          {activeTab === 'chat' && (
            <div style={{ position: 'relative' }}>
              <select 
                value={activePersona.id} 
                onChange={(e) => setActivePersona(PERSONAS.find(p => p.id === e.target.value))}
                style={{
                  appearance: 'none', padding: '8px 32px 8px 16px', borderRadius: '12px',
                  border: `1px solid ${activePersona.color}40`, background: `${activePersona.color}10`,
                  fontSize: '14px', fontWeight: 600, color: activePersona.color, cursor: 'pointer', outline: 'none'
                }}
              >
                {PERSONAS.map(persona => (
                  <option key={persona.id} value={persona.id}>{persona.label}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '11px', pointerEvents: 'none', color: activePersona.color }} />
            </div>
          )}
          
          {/* Clear Chat Button */}
          {activeTab === 'chat' && messages.length > 0 && (
            <button onClick={clearHistory} style={{ padding: '8px 14px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#991b1b', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={14} style={{ marginRight: '6px' }} />
              Clear
            </button>
          )}

        </div>
        <StatusPill />
      </div>

      {/* â”€â”€â”€ TAB CONTENT â”€â”€â”€ */}
      {activeTab === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
          
          {/* Messages */}
          <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--on-surface-variant)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: activePersona.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activePersona.color, fontSize: '28px' }}>
                  {activePersona.icon}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '16px', color: 'var(--on-surface)' }}>Ask your {activePersona.label}</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>{activePersona.description}</p>
                </div>
                {/* Quick actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '500px' }}>
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => { streamOllamaChat([...messages, { role: 'user', content: action.prompt() }]); }}
                      disabled={loading || ollamaStatus !== 'online'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                        borderRadius: '20px', border: '1px solid var(--outline-variant)', background: '#fff',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--on-surface-variant)',
                        transition: 'all 0.15s'
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  if (msg.isHidden) return null;
                  const chartData = msg.role === 'assistant' ? parseChartFromText(msg.content) : null;
                  const { journeyData, whatsappData, cleanText } = msg.role === 'assistant' ? parseGenerativeUI(msg.content) : { journeyData: null, whatsappData: null, cleanText: msg.content };
                  const persona = msg.persona ? PERSONAS.find(p => p.id === msg.persona) : activePersona;

                  return (
                    <Message key={idx} from={msg.role === 'assistant' ? 'assistant' : 'user'}>
                      <MessageAvatar
                        src={msg.role === 'user'
                          ? "https://cdn.21st.dev/assets/mirror/51/513d06f542692036ff0bb17938f04b3efd60567ba2cae08049469d21f18e0524.jpg"
                          : null}
                        name={msg.role === 'user' ? 'You' : (persona?.label || 'AI')}
                      />
                      <MessageContent from={msg.role === 'assistant' ? 'assistant' : 'user'}>
                        {msg.role === 'user'
                          ? msg.content
                          : msg.content
                            ? <>
                                {cleanText.trim() && <SimpleMarkdown text={cleanText.replace(/```chart[\s\S]*?```/g, '')} />}
                                {journeyData && <CustomerJourneyUI data={journeyData} />}
                                {whatsappData && <WhatsAppMockUI messages={whatsappData} />}
                                {chartData && <InlineChart chartData={chartData} />}
                              </>
                            : <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: persona?.color }}>
                                <Loader2 size={15} className="spin" />
                                <span style={{ fontSize: '13px' }}>Thinking...</span>
                              </div>
                        }
                      </MessageContent>
                    </Message>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: '0 20px', padding: '10px 14px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Input area */}
          <div style={{ padding: '16px 0', borderTop: 'none' }}>
            {/* Quick action chips (only when messages exist) */}
            {messages.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => streamOllamaChat([...messages, { role: 'user', content: action.prompt() }])}
                    disabled={loading || ollamaStatus !== 'online'}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            )}
            
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <button
                  onClick={stopGeneration}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                    borderRadius: '20px', border: '1px solid #e11d48', background: '#fff1f2',
                    color: '#e11d48', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(225, 29, 72, 0.15)'
                  }}
                >
                  <Square fill="currentColor" size={14} />
                  Stop AI
                </button>
              </div>
            )}

            <div style={{ position: 'relative', display: 'flex', gap: '10px', background: '#fff', padding: '12px 16px', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <input
                dir="auto"
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={`Ask your ${activePersona.label}...`}
                disabled={loading || ollamaStatus !== 'online'}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', position: 'relative', zIndex: 10, padding: '2px 0' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={(!chatInput.trim() && !loading) || ollamaStatus !== 'online'}
                style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, position: 'relative', zIndex: 10, background: activePersona.color, color: '#fff', opacity: (!chatInput.trim() && !loading) ? 0.5 : 1 }}
              >
                {loading ? <Loader2 className="spin" size={15} /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ProductsTab products={products} allOrders={allOrders} messages={messages} streamOllamaChat={streamOllamaChat} loading={loading} ollamaStatus={ollamaStatus} />
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <UsersTab trackedCustomers={trackedCustomers} allOrders={allOrders} messages={messages} streamOllamaChat={streamOllamaChat} loading={loading} ollamaStatus={ollamaStatus} />
        </div>
      )}

      {activeTab === 'adspy' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <AdsSpy messages={messages} setMessages={setMessages} streamOllamaChat={streamOllamaChat} loading={loading} ollamaStatus={ollamaStatus} products={products} />
          {/* Show AI response for ads spy */}
          {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
            <div className="premium-card" style={{ marginTop: '16px', padding: '20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>ðŸ¤– AI ANALYSIS</p>
              <SimpleMarkdown text={messages[messages.length - 1].content} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'loyalty' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <LoyaltyProgram allOrders={allOrders} />
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {savedReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--on-surface-variant)' }}>
                <BarChart2 size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ margin: 0, fontSize: '15px' }}>No saved reports yet. Start a conversation with your AI team!</p>
              </div>
            ) : savedReports.map(report => (
              <div
                key={report.id}
                className="premium-card"
                style={{ padding: '16px', cursor: 'pointer', borderLeft: `3px solid ${report.personaColor}` }}
                onClick={() => { setMessages(report.messages); setActiveTab('chat'); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: report.personaColor, background: report.personaColor + '20', padding: '2px 8px', borderRadius: '10px' }}>{report.persona}</span>
                      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>{report.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.title}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}





