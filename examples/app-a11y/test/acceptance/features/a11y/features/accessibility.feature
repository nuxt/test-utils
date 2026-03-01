@tag-a11y

Feature: Accessibility compliance

  Scenario: Home page is accessible
    Given the user navigates to the home page
    Then the page has no accessibility violations

  Scenario: Violations are detected on non-compliant page
    Given the user navigates to the violations page
    Then accessibility violations are detected
