/**
 * Configuration for Magic Metrics Funnel - Looker Studio Community Visualization
 * Defines data schema and style options
 */

const config = {
  data: [
    {
      id: "dimensions",
      label: "Dimensions",
      elements: [
        {
          id: "step",
          label: "Funnel Step",
          type: "DIMENSION",
          options: {
            min: 1,
            max: 1
          }
        },
        {
          id: "stepOrder",
          label: "Step Order (optional)",
          type: "DIMENSION",
          options: {
            min: 0,
            max: 1
          }
        }
      ]
    },
    {
      id: "metrics",
      label: "Metrics",
      elements: [
        {
          id: "users",
          label: "Users/Count",
          type: "METRIC",
          options: {
            min: 1,
            max: 1
          }
        }
      ]
    }
  ],
  style: [
    {
      id: "colors",
      label: "Colors",
      elements: [
        {
          id: "startColor",
          label: "Start Color",
          type: "FILL_COLOR",
          defaultValue: "#1a73e8"
        },
        {
          id: "endColor",
          label: "End Color",
          type: "FILL_COLOR",
          defaultValue: "#34a853"
        },
        {
          id: "dropoffColor",
          label: "Drop-off Color",
          type: "FILL_COLOR",
          defaultValue: "#ea4335"
        },
        {
          id: "textColor",
          label: "Text Color",
          type: "FILL_COLOR",
          defaultValue: "#202124"
        }
      ]
    },
    {
      id: "layout",
      label: "Layout",
      elements: [
        {
          id: "orientation",
          label: "Orientation",
          type: "SELECT_SINGLE",
          defaultValue: "vertical",
          options: [
            {label: "Vertical", value: "vertical"},
            {label: "Horizontal", value: "horizontal"}
          ]
        },
        {
          id: "funnelWidth",
          label: "Funnel Width (%)",
          type: "NUMBER",
          defaultValue: 80,
          options: {
            min: 50,
            max: 100
          }
        },
        {
          id: "stepSpacing",
          label: "Step Spacing",
          type: "NUMBER",
          defaultValue: 10,
          options: {
            min: 0,
            max: 50
          }
        }
      ]
    },
    {
      id: "display",
      label: "Display Options",
      elements: [
        {
          id: "showConversionRate",
          label: "Show Conversion Rate",
          type: "BOOLEAN",
          defaultValue: true
        },
        {
          id: "showDropoff",
          label: "Show Drop-off",
          type: "BOOLEAN",
          defaultValue: true
        },
        {
          id: "showPercentages",
          label: "Show Percentages",
          type: "BOOLEAN",
          defaultValue: true
        },
        {
          id: "showValues",
          label: "Show Values",
          type: "BOOLEAN",
          defaultValue: true
        },
        {
          id: "animateOnLoad",
          label: "Animate on Load",
          type: "BOOLEAN",
          defaultValue: true
        }
      ]
    },
    {
      id: "typography",
      label: "Typography",
      elements: [
        {
          id: "fontSize",
          label: "Font Size",
          type: "NUMBER",
          defaultValue: 14,
          options: {
            min: 10,
            max: 24
          }
        },
        {
          id: "fontFamily",
          label: "Font Family",
          type: "SELECT_SINGLE",
          defaultValue: "roboto",
          options: [
            {label: "Roboto", value: "roboto"},
            {label: "Arial", value: "arial"},
            {label: "Google Sans", value: "google-sans"}
          ]
        }
      ]
    }
  ],
  interactions: [
    {
      id: "filter",
      supportedActions: ["FILTER"]
    }
  ]
};

// Export for Looker Studio
if (typeof dscc !== 'undefined') {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
