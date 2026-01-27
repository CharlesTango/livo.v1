# Livo Logo Assets for Outlook Add-in

This document outlines the PNG logo files needed for the Outlook add-in.

## Required Logo Files

### 1. Header Logos (with "Livo" text in Momo Signature font)

#### `livo-logo-medium.png`
- **Usage**: Authentication/Login page header
- **Height**: 56px (width will vary based on text length)
- **Format**: PNG with transparent background
- **Font**: Momo Signature
- **Text**: "Livo"
- **Color**: Dark (#1A1A1A) - to match the design system secondary color
- **Placement**: `/outlook-addin/assets/livo-logo-medium.png`

#### `livo-logo-small.png`
- **Usage**: Matter creation form header
- **Height**: 36px (width will vary based on text length)
- **Format**: PNG with transparent background
- **Font**: Momo Signature
- **Text**: "Livo"
- **Color**: Dark (#1A1A1A) - to match the design system secondary color
- **Placement**: `/outlook-addin/assets/livo-logo-small.png`

### 2. Manifest Icons (for Office ribbon and app catalog)

These are referenced in `manifest.xml` and should ideally contain the "L" or full "Livo" branding:

#### `icon-16.png`
- **Size**: 16x16px
- **Usage**: Ribbon button (small)
- **Format**: PNG with transparent background

#### `icon-32.png`
- **Size**: 32x32px
- **Usage**: Ribbon button (medium)
- **Format**: PNG with transparent background

#### `icon-80.png`
- **Size**: 80x80px
- **Usage**: Ribbon button (large)
- **Format**: PNG with transparent background

#### `icon-64.png`
- **Size**: 64x64px
- **Usage**: App catalog icon
- **Format**: PNG with transparent background

#### `icon-128.png`
- **Size**: 128x128px
- **Usage**: High-resolution app catalog icon
- **Format**: PNG with transparent background

## Design Guidelines

- **Background**: All logos should have transparent backgrounds
- **Font**: Momo Signature (for text logos)
- **Primary Color**: #1A1A1A (secondary dark from design system)
- **Alternative**: You can use the Livo brand green (#B6D7C4) for backgrounds on icon files if needed
- **Quality**: Export at 2x resolution for retina displays, then scale down for crisp rendering

## How to Create

You can create these PNG files using:
1. **Design Tools**: Figma, Sketch, Adobe Photoshop, Illustrator
2. **Online Tools**: 
   - Canva (if Momo Signature font is available)
   - Font generator websites
3. **Code Export**: Use HTML canvas or similar to render the font and export as PNG

## Installation

1. Place all PNG files in the `/outlook-addin/assets/` directory
2. Ensure filenames match exactly as listed above
3. The webpack configuration will automatically copy these to the dist folder during build
4. Files will be served at `https://localhost:3001/assets/[filename]` during development

## Current Status

✅ Code updated to use image files instead of text
✅ CSS styles updated for proper image rendering
⏳ PNG files need to be created and placed in assets folder

## Notes

- The logo images will scale automatically based on container height
- Images use `object-fit: contain` to maintain aspect ratio
- If you don't have access to Momo Signature font, you can:
  - Use a similar script/signature font
  - Purchase or download Momo Signature font if available
  - Commission a designer to create custom logo files
