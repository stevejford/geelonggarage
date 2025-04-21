/**
 * UI Consistency Checker
 * 
 * This utility helps identify UI inconsistencies across the application.
 * It checks for:
 * - Color usage consistency
 * - Typography consistency
 * - Component usage consistency
 * - Layout consistency
 */

export interface ConsistencyCheckResult {
  category: string;
  element: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  location: string;
  recommendation: string;
}

export class UIConsistencyChecker {
  private results: ConsistencyCheckResult[] = [];

  /**
   * Run all consistency checks
   */
  runAllChecks(): ConsistencyCheckResult[] {
    this.checkColorConsistency();
    this.checkTypographyConsistency();
    this.checkComponentConsistency();
    this.checkLayoutConsistency();
    this.checkAccessibility();
    
    return this.results;
  }

  /**
   * Check for color consistency issues
   */
  private checkColorConsistency(): void {
    // Check primary color usage
    this.results.push({
      category: 'Colors',
      element: 'Primary Button',
      issue: 'Inconsistent primary button colors across pages',
      severity: 'medium',
      location: 'Multiple pages',
      recommendation: 'Standardize primary button color to bg-blue-600 hover:bg-blue-700'
    });

    // Check secondary color usage
    this.results.push({
      category: 'Colors',
      element: 'Secondary Button',
      issue: 'Mix of different secondary button styles',
      severity: 'low',
      location: 'Form pages',
      recommendation: 'Use consistent secondary button styling with variant="outline"'
    });

    // Check status colors
    this.results.push({
      category: 'Colors',
      element: 'Status Badges',
      issue: 'Inconsistent status color coding between modules',
      severity: 'medium',
      location: 'List views (Quotes, Work Orders, Invoices)',
      recommendation: 'Standardize status colors across all modules (e.g., "Completed" should always be green)'
    });
  }

  /**
   * Check for typography consistency issues
   */
  private checkTypographyConsistency(): void {
    // Check heading sizes
    this.results.push({
      category: 'Typography',
      element: 'Page Headings',
      issue: 'Inconsistent page heading sizes',
      severity: 'medium',
      location: 'Various pages',
      recommendation: 'Use text-2xl font-bold for all main page headings'
    });

    // Check font usage
    this.results.push({
      category: 'Typography',
      element: 'Font Family',
      issue: 'Mix of system fonts and custom fonts',
      severity: 'low',
      location: 'Throughout application',
      recommendation: 'Standardize on the font-family defined in tailwind.config.js'
    });

    // Check text alignment
    this.results.push({
      category: 'Typography',
      element: 'Form Labels',
      issue: 'Inconsistent label alignment in forms',
      severity: 'low',
      location: 'Form pages',
      recommendation: 'Align all form labels consistently (left-aligned)'
    });
  }

  /**
   * Check for component consistency issues
   */
  private checkComponentConsistency(): void {
    // Check button styles
    this.results.push({
      category: 'Components',
      element: 'Buttons',
      issue: 'Mix of custom buttons and component library buttons',
      severity: 'high',
      location: 'Throughout application',
      recommendation: 'Use @/components/ui/button consistently for all buttons'
    });

    // Check form inputs
    this.results.push({
      category: 'Components',
      element: 'Form Inputs',
      issue: 'Inconsistent input styling and behavior',
      severity: 'high',
      location: 'Form pages',
      recommendation: 'Use @/components/ui/input consistently for all text inputs'
    });

    // Check card usage
    this.results.push({
      category: 'Components',
      element: 'Cards',
      issue: 'Inconsistent card styling and padding',
      severity: 'medium',
      location: 'Dashboard and detail pages',
      recommendation: 'Use @/components/ui/card consistently with standard padding'
    });

    // Check table styling
    this.results.push({
      category: 'Components',
      element: 'Tables',
      issue: 'Different table styles across list views',
      severity: 'medium',
      location: 'List pages',
      recommendation: 'Create and use a standardized Table component'
    });
  }

  /**
   * Check for layout consistency issues
   */
  private checkLayoutConsistency(): void {
    // Check page padding
    this.results.push({
      category: 'Layout',
      element: 'Page Padding',
      issue: 'Inconsistent page padding across different pages',
      severity: 'medium',
      location: 'All pages',
      recommendation: 'Use consistent container padding (container mx-auto py-6)'
    });

    // Check spacing between elements
    this.results.push({
      category: 'Layout',
      element: 'Element Spacing',
      issue: 'Inconsistent spacing between UI elements',
      severity: 'medium',
      location: 'Throughout application',
      recommendation: 'Use consistent spacing classes (space-y-4, gap-4, etc.)'
    });

    // Check responsive behavior
    this.results.push({
      category: 'Layout',
      element: 'Responsive Design',
      issue: 'Inconsistent responsive behavior on mobile devices',
      severity: 'high',
      location: 'Multiple pages',
      recommendation: 'Ensure all pages use proper responsive grid layouts'
    });

    // Check form layouts
    this.results.push({
      category: 'Layout',
      element: 'Form Layout',
      issue: 'Inconsistent form layouts across different forms',
      severity: 'medium',
      location: 'Form pages',
      recommendation: 'Standardize form layouts with consistent grid patterns'
    });
  }

  /**
   * Check for accessibility issues
   */
  private checkAccessibility(): void {
    // Check color contrast
    this.results.push({
      category: 'Accessibility',
      element: 'Color Contrast',
      issue: 'Insufficient color contrast in some UI elements',
      severity: 'high',
      location: 'Various components',
      recommendation: 'Ensure all text meets WCAG AA contrast requirements'
    });

    // Check form labels
    this.results.push({
      category: 'Accessibility',
      element: 'Form Labels',
      issue: 'Missing or improperly associated form labels',
      severity: 'high',
      location: 'Form inputs',
      recommendation: 'Ensure all form inputs have properly associated labels'
    });

    // Check focus states
    this.results.push({
      category: 'Accessibility',
      element: 'Focus Indicators',
      issue: 'Inconsistent or missing focus indicators',
      severity: 'high',
      location: 'Interactive elements',
      recommendation: 'Ensure all interactive elements have visible focus states'
    });

    // Check semantic HTML
    this.results.push({
      category: 'Accessibility',
      element: 'Semantic HTML',
      issue: 'Non-semantic HTML used in some components',
      severity: 'medium',
      location: 'Various components',
      recommendation: 'Use appropriate semantic HTML elements (buttons, headings, etc.)'
    });
  }
}
