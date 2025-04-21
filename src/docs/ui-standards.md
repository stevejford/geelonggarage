# UI Standards Guide

This document outlines the UI standards for the application to ensure consistency across all pages and components.

## Button Standards

### Primary Buttons
- Always use the `Button` component from `@/components/ui/button`
- Use the default variant (no need to specify variant="default")
- Primary buttons are blue by default (bg-blue-600 hover:bg-blue-700)
- Example: `<Button>Save</Button>`

### Secondary Buttons
- Always use the `Button` component from `@/components/ui/button`
- Use the outline variant: `variant="outline"`
- Example: `<Button variant="outline">Cancel</Button>`

### Destructive Buttons
- Use the destructive variant: `variant="destructive"`
- Example: `<Button variant="destructive">Delete</Button>`

### Success Buttons
- Use the success variant: `variant="success"`
- Example: `<Button variant="success">Approve</Button>`

### Warning Buttons
- Use the warning variant: `variant="warning"`
- Example: `<Button variant="warning">Flag</Button>`

### Ghost Buttons
- Use the ghost variant: `variant="ghost"`
- Example: `<Button variant="ghost">More</Button>`

### Link Buttons
- Use the link variant: `variant="link"`
- Example: `<Button variant="link">View details</Button>`

### Button Sizes
- Default: Standard size for most buttons
- sm: Small buttons for compact UIs
- lg: Large buttons for emphasis
- icon: Square buttons for icons
- xs: Extra small buttons for very compact UIs

## Status Badge Standards

Always use the `StatusBadge` component from `@/components/ui/status-badge` for status indicators.

### Status Colors
- new: Blue
- pending: Yellow
- active: Green
- inactive: Gray
- completed: Green
- cancelled: Red
- scheduled: Purple
- inProgress: Blue
- paid: Green
- unpaid: Red
- overdue: Orange
- draft: Gray
- sent: Blue
- accepted: Green
- rejected: Red
- qualified: Green
- unqualified: Red
- contacted: Blue
- converted: Purple

## Typography Standards

### Font Families
- Primary Font: `Inter` (sans-serif) for UI elements, body text, and forms
- Secondary Font: `Lora` (serif) for headings and titles

### Font Sizes
- Form Labels: 16px (1rem) - `text-form-label`
- Input Fields: 16px (1rem) - `text-form-input`
- Helper Text / Error Messages: 14px (0.875rem) - `text-form-helper`
- Buttons: 16px (1rem) - `text-form-button`
- Form Headings: 20px (1.25rem) - `text-form-heading`

### Headings
- Page titles (h1): `text-3xl font-bold font-serif`
- Section headings (h2): `text-2xl font-semibold font-serif`
- Card titles (h3): `text-xl font-semibold font-serif`
- Subsection headings (h4): `text-lg font-medium font-serif`

### Body Text
- Standard text: `text-base font-sans`
- Small text: `text-sm font-sans`
- Extra small text: `text-xs font-sans`

### Line Height
- Body text: 1.5 (150%) - `leading-relaxed`
- Form elements: 1.5 (150%) - `leading-form`
- Headings: 1.3 (130%) - `leading-tight`

### Best Practices
- Maintain consistent typography across the application
- Use relative units (rem) for font sizes to ensure accessibility
- Ensure text contrast meets WCAG guidelines
- Limit design to 2-3 font weights for a clean look
- Use proper visual hierarchy with consistent heading sizes

## Form Standards

### Form Layout
- Use consistent grid layouts for forms
- Group related fields together
- Use a consistent spacing between form elements (space-y-4)

### Form Labels
- Always use the `Label` component from `@/components/ui/label`
- Labels should be left-aligned
- Example: `<Label htmlFor="name">Name</Label>`

### Form Inputs
- Always use the `Input` component from `@/components/ui/input`
- Example: `<Input id="name" name="name" />`

### Form Textareas
- Always use the `Textarea` component from `@/components/ui/textarea`
- Example: `<Textarea id="description" name="description" />`

### Form Checkboxes
- Always use the `Checkbox` component from `@/components/ui/checkbox`
- Example: `<Checkbox id="terms" name="terms" />`

### Form Selects
- Always use the `Select` component from `@/components/ui/select`
- Example:
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Card Standards

Always use the `Card` components from `@/components/ui/card` for card layouts.

### Card Structure
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter>
    {/* Card footer */}
  </CardFooter>
</Card>
```

## Table Standards

Always use the `Table` components from `@/components/ui/table` for tables.

### Table Structure
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Value 1</TableCell>
      <TableCell>Value 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Layout Standards

### Page Layout
- Use `container mx-auto py-6 space-y-6` for page containers
- Use consistent spacing between sections (space-y-6)

### Responsive Design
- Use responsive grid layouts for all pages
- Use `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6` for card grids
- Ensure all pages work well on mobile devices

## Accessibility Standards

### Color Contrast
- Ensure all text meets WCAG AA contrast requirements
- Use the default colors defined in the theme for consistent contrast

### Focus Indicators
- Ensure all interactive elements have visible focus states
- Don't remove focus outlines

### Semantic HTML
- Use appropriate semantic HTML elements
- Use proper heading hierarchy
- Use proper form labels
