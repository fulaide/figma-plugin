
// code.ts (TypeScript file that will be compiled to code.js)

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 600 });

// Called when a message is received from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import-variables') {
    try {
      const collections = msg.variables.collections;
      
      // Process each collection
      for (const collection of collections) {
        // Create a variable collection or use existing
        let variableCollection: VariableCollection;
        const existingCollections = figma.variables.getLocalVariableCollections();
        const existingCollection = existingCollections.find(c => c.name === collection.name);
        
        if (existingCollection) {
          variableCollection = existingCollection;
        } else {
          variableCollection = figma.variables.createVariableCollection(collection.name);
        }
        
        // Process each mode in the collection
        for (const mode of collection.modes) {
          // Find or create the mode
          let modeId: string;
          const existingMode = variableCollection.modes.find(m => m.name === mode.name);
          
          if (existingMode) {
            modeId = existingMode.modeId;
          } else {
            modeId = variableCollection.addMode(mode.name);
          }
          
          // Process variables for this mode
          for (const [varName, varDetails] of Object.entries(mode.variables)) {
            const details = varDetails as { type: string, value: any };
            
            // Try to find existing variable
            let variable: Variable;
            const existingVariables = figma.variables.getLocalVariables();
            const existingVariable = existingVariables.find(v => 
              v.name === varName && v.variableCollectionId === variableCollection.id
            );
            
            if (existingVariable) {
              variable = existingVariable;
            } else {
              // Create a new variable
              variable = figma.variables.createVariable(
                varName,
                variableCollection.id,
                convertType(details.type)
              );
            }
            
            // Set the value for this mode
            variable.setValueForMode(modeId, details.value);
          }
        }
      }
      
      figma.notify('Variables imported successfully!');
    } catch (error) {
      figma.notify(`Error importing variables: ${error.message}`);
    }
  }
  
  // When the plugin is done, close it
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Helper function to convert string type to Figma's VariableType
function convertType(type: string): VariableResolvedDataType {
  switch (type) {
    case 'STRING':
      return 'STRING';
    case 'BOOLEAN':
      return 'BOOLEAN';
    case 'FLOAT':
    case 'INTEGER':
      return 'FLOAT';
    case 'COLOR':
      return 'COLOR';
    default:
      return 'STRING';
  }
}