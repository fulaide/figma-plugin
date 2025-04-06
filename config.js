const StyleDictionary = require('style-dictionary');

// Register a format for Tailwind v4 theme CSS variables
StyleDictionary.registerFormat({
  name: 'css/tailwind-v4-theme',
  formatter: function({ dictionary, file }) {
    const tokens = dictionary.allTokens;
    
    // Function to transform token paths to tailwind v4 CSS variable naming
    const getVariableName = (token) => {
      const tokenType = token.type;
      const path = token.path;

      // Apply specific prefixes based on token type
      switch (tokenType) {
        case 'fontFamily':
          return `--font-${path[path.length - 1]}`;
        case 'fontSize':
          return `--text-${path[path.length - 1]}`;
        case 'fontWeight':
          return `--font-weight-${path[path.length - 1]}`;
        case 'lineHeight':
          return `--leading-${path[path.length - 1]}`;
        case 'letterSpacing':
          return `--tracking-${path[path.length - 1]}`;
        default:
          return `--${path.join('-')}`;
      }
    };

    // Generate the CSS content
    let cssContent = `@theme {\n`;
    
    tokens.forEach(token => {
      const variableName = getVariableName(token);
      cssContent += `  ${variableName}: ${token.value};\n`;
    });
    
    cssContent += `}\n`;
    return cssContent;
  }
});

// Register a format for Figma-compatible JSON
StyleDictionary.registerFormat({
  name: 'json/figma-variables',
  formatter: function({ dictionary }) {
    const figmaVariables = {
      collections: [{
        name: "Design System",
        modes: [{
          name: "Default",
          variables: {}
        }]
      }]
    };
    
    const variables = figmaVariables.collections[0].modes[0].variables;
    
    dictionary.allTokens.forEach(token => {
      const tokenType = token.type;
      const tokenName = token.path.join('/');
      
      let variableType;
      let value;
      
      // Map token types to Figma variable types
      switch (tokenType) {
        case 'fontFamily':
          variableType = 'STRING';
          value = token.value;
          break;
        case 'fontSize':
          variableType = 'FLOAT';
          // Convert rem to pixels (assuming 1rem = 16px)
          value = parseFloat(token.value) * 16;
          break;
        case 'fontWeight':
          variableType = 'INTEGER';
          value = parseInt(token.value);
          break;
        case 'lineHeight':
          variableType = 'FLOAT';
          if (token.value.includes('%')) {
            value = parseFloat(token.value) / 100;
          } else {
            value = parseFloat(token.value);
          }
          break;
        case 'letterSpacing':
          variableType = 'FLOAT';
          // Convert em to pixels
          if (token.value.includes('em')) {
            value = parseFloat(token.value) * 16;
          } else {
            value = parseFloat(token.value);
          }
          break;
        default:
          variableType = 'STRING';
          value = token.value;
      }
      
      variables[tokenName] = {
        type: variableType,
        value: value
      };
    });
    
    return JSON.stringify(figmaVariables, null, 2);
  }
});

// Define the configuration
module.exports = {
  source: ['tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'theme.css',
          format: 'css/tailwind-v4-theme'
        }
      ]
    },
    figma: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'figma-variables.json',
          format: 'json/figma-variables'
        }
      ]
    }
  }
};