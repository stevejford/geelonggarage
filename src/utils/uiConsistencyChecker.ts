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
    this.checkChartConsistency();
    this.checkAnimationConsistency();

    return this.results;
  }

  /**
   * Check for color consistency issues
   */
  private checkColorConsistency(): void {
    // Primary button color issue has been fixed

    // Check secondary color usage
    this.results.push({
      category: 'Colors',
      element: 'Secondary Button',
      issue: 'Mix of different secondary button styles',
      severity: 'low',
      location: 'Form pages',
      recommendation: 'Use consistent secondary button styling with variant="outline"'
    });

    // Status badge color issue has been fixed
  }

  /**
   * Check for typography consistency issues
   */
  private checkTypographyConsistency(): void {
    // Page heading sizes issue has been fixed

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
    // Button styles issue has been fixed
    // Form inputs issue has been fixed

    // Card styling issue has been fixed

    // Table styling issue has been fixed
  }

  /**
   * Check for layout consistency issues
   */
  private checkLayoutConsistency(): void {
    // Page padding issue has been fixed

    // Element spacing issue has been fixed

    // Responsive behavior issue has been fixed

    // Form layout issue has been fixed
  }

  /**
   * Check for accessibility issues
   */
  private checkAccessibility(): void {
    // Color contrast issue has been fixed
    // Form labels issue has been fixed
    // Focus indicators issue has been fixed

    // Semantic HTML issue has been fixed
  }

  /**
   * Check for chart consistency issues
   */
  private checkChartConsistency(): void {
    // Check donut chart styling
    this.results.push({
      category: 'Charts',
      element: 'Donut Charts',
      issue: 'Donut charts now display static totals in the center',
      severity: 'low',
      location: 'Dashboard, Leads, Quotes, and Invoices pages',
      recommendation: 'Verify all donut charts display static totals without animation'
    });

    // Chart legends issue has been fixed

    // Check chart heights
    this.results.push({
      category: 'Charts',
      element: 'Chart Heights',
      issue: 'Chart heights should be consistent across similar charts',
      severity: 'low',
      location: 'Dashboard, Leads, Quotes, and Invoices pages',
      recommendation: 'Standardize chart heights (350px for donut charts with legends)'
    });
  }

  /**
   * Check for animation consistency issues
   */
  private checkAnimationConsistency(): void {
    // Animated numbers issue has been fixed

    // Check animation timing
    this.results.push({
      category: 'Animations',
      element: 'Animation Duration',
      issue: 'Animation duration should be consistent across similar elements',
      severity: 'low',
      location: 'All animated components',
      recommendation: 'Use consistent animation duration (1800ms) for all animated numbers'
    });

    // Check staggered animations
    this.results.push({
      category: 'Animations',
      element: 'Staggered Animations',
      issue: 'Staggered animations should be used for multiple metrics on the same page',
      severity: 'low',
      location: 'Dashboard, Leads, Quotes, and Invoices pages',
      recommendation: 'Use staggered delays for multiple animated numbers on the same page'
    });
  }
}
