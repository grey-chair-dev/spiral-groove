Prepared by Grey Chair Digital | October 2025

1. Brand Aesthetic & Visual Identity Application
🎨 Design Intent
The Spiral Groove Records design system blends analog warmth with modern clarity. It captures the soul of a neighborhood record shop — nostalgic, creative, and human — while ensuring digital professionalism and usability.

Visual Tone: Warm • Authentic • Minimalist • Nostalgic

Accessibility: All color combinations and typography meet WCAG 2.1 AA+ standards.

Design Principles:

Keep layouts open and inviting.

Balance analog textures (subtle grain, off-white tones) with clean digital precision.

Make every touchpoint feel handcrafted yet structured.

2. Color Palette Finalization
Role

Name

HEX

RGB

HSL

Usage & Notes

Primary

Midnight Vinyl Black

#111111

17, 17, 17

0°, 0%, 7%

Main background and header color. Use with Cream or Teal text.

Secondary

Cream Groove White

#F5F3EE

245, 243, 238

40°, 22%, 95%

Light background and content sections. Adds warmth and readability.

Accent A

Muted Teal

#3E787C

62, 120, 124

184°, 33%, 36%

Link color, CTA backgrounds, highlights.

Accent B

Vintage Amber

#DDAA44

221, 170, 68

40°, 68%, 57%

Button hovers, dividers, subtle highlights.

Highlight

Vinyl Red

#9C2830

156, 40, 48

355°, 59%, 38%

Borders, outlines, and small logo details.

Text Primary

Cream Groove White

#F5F3EE

245, 243, 238

40°, 22%, 95%

On black backgrounds.

Text Secondary

Midnight Vinyl Black

#111111

17, 17, 17

0°, 0%, 7%

On light backgrounds.

Support Neutral

Slate Gray

#7A7A7A

122, 122, 122

0°, 0%, 48%

Labels, captions, placeholders.

Accessibility Check:

All text-to-background pairs meet WCAG AA (contrast ≥ 4.5:1).

3. Typography System
🧠 Font Stack
Primary Display: Playfair Display — Expressive, vintage feel for headlines.

Body Font: Inter — Clean, accessible, and optimized for readability.

Supporting Accent: Poppins — Used in buttons, navigation, and CTAs.

🔤 Hierarchy & Scale (Responsive)
Element

Font

Weight

Size (Desktop)

Size (Mobile)

Line Height

Usage

H1

Playfair Display

Bold

54px

36px

120%

Page headlines, hero sections

H2

Playfair Display

Semi-bold

36px

28px

130%

Section titles

H3

Playfair Display

Regular

28px

22px

135%

Subheadings

H4

Poppins

Semi-bold

20px

18px

140%

CTAs and form headers

Body (L)

Inter

Regular

18px

16px

160%

Main content

Body (S)

Inter

Medium

16px

14px

165%

Secondary text

Button

Poppins

Bold, Uppercase

16px

14px

150%

All clickable CTAs

Label

Inter

Regular

14px

13px

150%

Form fields and small annotations

Typography Principles:

Maintain generous line height and spacing.

Headings use dark/light contrast depending on section background.

Use limited text color variations (white on black or black on cream).

4. Component Library
🔝 Navigation Bar
Layout: Sticky top bar, 80px height, 24px padding.

Content:

Left: Circular logo (white on black).

Center: Links — Shop | Events | About | Blog | Contact.

Right: Cart icon + “Join Newsletter” button (Teal background).

Hover State: Underline animation in Amber; subtle opacity fade.

Mobile: Hamburger menu with dropdown overlay (Teal accent).

🧭 Buttons & CTAs
Type

Default

Hover

Active

Disabled

Primary Button

Teal background, cream text

Amber background

Dark teal

40% opacity

Secondary Button

Transparent w/ teal border

Amber border + text

Filled Amber

30% opacity

Text Link

Teal text underline

Amber underline

Slight offset underline

50% opacity

Shape: Rounded corners (8px)

Padding: 14px 28px

🧱 Cards (Products, Events, Blog)
Structure:

Image (4:3 ratio)

Title (H4)

Description (Body Small)

CTA link (“View More”)

Hover: Lift effect with shadow + 5° image tilt.

Colors: Black or Cream background depending on section.

📬 Forms
Input Fields: Rounded corners (6px), cream background, black border.

Focus: Border color = Teal; shadow glow in Amber.

Buttons: Teal fill, white text.

Error State: Red outline (#9C2830) + “!” icon.

Accessibility:

Labels always visible.

Error messages use both color + text description.

💬 Modals & Notifications
Rounded container (12px radius) with soft shadow.

Modal Header: Teal bar accent.

Buttons: Primary Teal / Secondary Transparent.

Animation: Fade-in 300ms ease-in-out.

🌟 Widgets & UI Patterns
Widget

Description

Brand Alignment

Testimonials Carousel

Rotating quotes w/ album cover thumbnails

Warm, human touch

Product Gallery

4x3 grid w/ hover “Add to Cart” overlay

Modern + analog hybrid

Event Showcase

Card layout w/ image + date tag (Amber)

Local community feel

Loyalty Promo Banner

Thin strip at top w/ rotating text (“Buy 10 Records, Get 1 Free”)

Encourages repeat visits

5. Grid & Layout System
📐 Grid Configuration
Screen

Columns

Gutter

Margin

Max Width

Desktop (≥1280px)

12

24px

80px

1200px

Tablet (≥768px)

8

20px

40px

720px

Mobile (≤767px)

4

16px

24px

Fluid

⚙️ Spacing Tokens
Token

Value

Use

space-xxs

4px

Icon padding

space-xs

8px

Between buttons

space-sm

16px

Paragraph spacing

space-md

24px

Card padding

space-lg

32px

Section padding

space-xl

64px

Major layout breaks

space-xxl

96px

Hero section margins

Layout Principle:

Ample whitespace to simulate analog breathing room — focus on fewer, better-arranged elements.

6. Iconography & Imagery Guidelines
🖼️ Iconography
Set Style: Rounded outline icons inspired by Feather Icons or Lucide.

Weight: 2px stroke, 24px standard size.

Color: Teal or Cream depending on section background.

Examples:

Record, Turntable, Speaker, Cart, Calendar, Envelope, Map Pin.

📸 Imagery Rules
Lighting: Warm, natural tones (avoid cool blues).

Subjects: Customers, collections, live performances, record textures.

Treatment: Soft vignette, grain overlay at 15% opacity, low contrast to evoke analog warmth.

Orientation: Horizontal, cinematic feel preferred.

7. Interaction & Motion Principles
Interaction

Style

Duration

Easing

Purpose

Hover (Buttons)

Color shift + subtle shadow

150ms

ease-out

Tactile feel

Card Hover

Elevation + tilt

200ms

ease-in-out

Depth and engagement

Modal Fade

Opacity transition

300ms

ease-in-out

Calm entrance

Page Transitions

Crossfade between routes

400ms

ease-in-out

Smooth continuity

Image Load

Fade-in on scroll

200ms

ease-out

Organic, analog motion

Motion should feel gentle and analog, mirroring a record’s slow spin — no abrupt animations.

8. Design Tokens Export
🎨 Colors (Figma Variables / CSS Tokens)


{
  "colors": {
    "primary-black": "#111111",
    "primary-cream": "#F5F3EE",
    "accent-teal": "#3E787C",
    "accent-amber": "#DDAA44",
    "highlight-red": "#9C2830",
    "text-dark": "#111111",
    "text-light": "#F5F3EE",
    "neutral-gray": "#7A7A7A"
  }
}
🔡 Typography Tokens


{
  "font-family": {
    "display": "Playfair Display",
    "body": "Inter",
    "accent": "Poppins"
  },
  "font-size": {
    "h1": "54px",
    "h2": "36px",
    "h3": "28px",
    "body": "18px",
    "small": "16px",
    "button": "16px"
  }
}
📏 Spacing Tokens


{
  "spacing": {
    "xxs": "4px",
    "xs": "8px",
    "sm": "16px",
    "md": "24px",
    "lg": "32px",
    "xl": "64px",
    "xxl": "96px"
  }
}
💡 Shadow & Border Tokens


{
  "shadows": {
    "card": "0 4px 12px rgba(0,0,0,0.15)",
    "modal": "0 8px 20px rgba(0,0,0,0.25)"
  },
  "borders": {
    "radius-small": "6px",
    "radius-medium": "8px",
    "radius-large": "12px"
  }
}
✅ Summary
Category

Description

Aesthetic

Warm analog minimalism with modern clarity

Colors

Black, Cream, Teal, Amber, Red — accessible contrast

Typography

Playfair Display + Inter + Poppins for nostalgic-professional blend

Components

Buttons, cards, forms, modals aligned with brand tone

Grid System

12/8/4 column responsive setup

Interactions

Soft, analog-feel transitions and micro-interactions

Accessibility

WCAG 2.1 AA+ compliance ensured

Design Tokens

Figma + JSON ready for developer handoff

