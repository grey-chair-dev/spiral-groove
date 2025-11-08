# Groovy Retro 70s Alternative Design

This branch (`alternative`) features a complete redesign of the Spiral Groove Records website with a vibrant, groovy retro 70s aesthetic inspired by [Vecteezy's groovy vector collection](https://www.vecteezy.com/free-vector/groovy).

## Design Philosophy

The alternative design embraces the psychedelic, colorful, and fun aesthetic of the 1970s with:
- **Vibrant color palette**: Bright oranges, yellows, pinks, purples, and teals
- **Retro typography**: Righteous and Fredoka fonts for that groovy feel
- **Decorative elements**: Daisies, peace signs, and wavy patterns
- **Psychedelic gradients**: Rainbow gradients throughout the interface
- **Playful interactions**: Scale animations, colorful hover effects

## Color Palette

### Primary Colors
- **Primary Black**: `#1a1a1a` (slightly softer than pure black)
- **Primary Cream**: `#FFF8E7` (warm cream background)
- **Accent Orange**: `#FF6B35` (vibrant orange)
- **Accent Yellow**: `#FFD23F` (sunny yellow)
- **Accent Pink**: `#FF6B9D` (bubblegum pink)
- **Accent Purple**: `#9B59B6` (psychedelic purple)
- **Accent Teal**: `#00CED1` (retro teal)

### Gradient Backgrounds
- **Groovy Rainbow**: Horizontal gradient across all accent colors
- **Groovy Sunset**: Diagonal gradient (orange → pink → purple)
- **Groovy Waves**: Repeating diagonal pattern overlay

## Typography

### Fonts
- **Display**: Playfair Display (elegant serif, kept for contrast)
- **Body**: Inter (clean, readable)
- **Accent**: Poppins (modern sans-serif)
- **Groovy**: Righteous (retro display font for headings)
- **Groovy Body**: Fredoka (playful sans-serif for buttons and UI)

### Text Effects
- **Groovy Text**: Large headings with rainbow gradient text
- **Gradient Text**: Multi-color gradient text effects
- **Header Brand**: Logo text with rainbow gradient

## Components

### GroovyDecorations.tsx
New decorative components:
- **GroovyDaisy**: Colorful daisy flower with multiple petals
- **PeaceSign**: Peace symbol with gradient stroke
- **GroovyDivider**: Wavy SVG divider with gradient fill
- **GroovyPattern**: Repeating diagonal pattern background
- **FloatingGroovyElements**: Animated decorative elements (optional)

### Updated Components

#### Hero Section
- Rainbow gradient overlay on carousel
- Decorative daisies and peace signs
- Colorful carousel indicators (yellow active, pink hover)

#### Header
- Rainbow gradient banner at top
- Orange border accent
- Groovy fonts for navigation
- Rainbow gradient hover effects on dropdown menus

#### Buttons
- Rainbow gradient background
- Scale animation on hover
- Enhanced shadow effects
- Groovy body font

#### Badges
- Vibrant color options (orange, yellow, pink, purple)
- Groovy body font
- Bold styling

## Styling Updates

### Global CSS
- Subtle diagonal pattern overlay on body background
- Rainbow gradient scrollbar
- Enhanced button hover effects
- Groovy text classes for headings

### Tailwind Config
- New color tokens for all groovy colors
- Background image utilities for gradients
- Font family utilities for groovy fonts

## Usage

To use this alternative design:

1. **Switch to the alternative branch**:
   ```bash
   git checkout alternative
   ```

2. **Install dependencies** (if needed):
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Design Inspiration

This design is inspired by:
- 1970s psychedelic art and design
- Groovy vector graphics from Vecteezy
- Retro music culture aesthetics
- Flower power and peace movement visuals
- Vintage record store vibes

## Key Features

✅ Vibrant retro color palette  
✅ Groovy typography (Righteous, Fredoka)  
✅ Decorative elements (daisies, peace signs)  
✅ Rainbow gradients throughout  
✅ Wavy dividers and patterns  
✅ Enhanced button and link styling  
✅ Playful hover animations  
✅ Maintains all original functionality  

## Comparison with Main Branch

| Feature | Main Branch | Alternative Branch |
|---------|-------------|-------------------|
| Color Scheme | Teal & Red | Rainbow (Orange, Yellow, Pink, Purple, Teal) |
| Typography | Playfair, Inter, Poppins | + Righteous, Fredoka |
| Background | Clean white | Cream with subtle patterns |
| Buttons | Solid teal | Rainbow gradient |
| Headings | Serif display | Groovy rainbow text |
| Decorations | Minimal | Daisies, peace signs, wavy patterns |
| Overall Feel | Modern, clean | Retro, playful, vibrant |

## Notes

- All SEO, analytics, and PWA features from the main branch are preserved
- All functionality remains intact
- Design is fully responsive
- Accessibility maintained (color contrast may need review for some combinations)

