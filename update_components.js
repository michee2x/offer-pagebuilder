const { Project, SyntaxKind } = require("ts-morph");

const project = new Project();
const sourceFile = project.addSourceFileAtPath("src/config/components.tsx");

// 1. Remove Feature* imports (except FeatureCTA, FeaturePricing)
const imports = sourceFile.getImportDeclarations();
for (const imp of imports) {
  for (const named of imp.getNamedImports()) {
    const name = named.getName();
    if (name.startsWith("Feature") && name !== "FeatureCTA" && name !== "FeaturePricing") {
      named.remove();
    }
    if (name.startsWith("Features")) {
      named.remove();
    }
  }
}
// Clean up empty imports
for (const imp of sourceFile.getImportDeclarations()) {
  if (imp.getNamedImports().length === 0 && !imp.getDefaultImport()) {
    imp.remove();
  }
}

// 2. Remove Feature* from ComponentType union and add missing ones
const compTypeAlias = sourceFile.getTypeAliasOrThrow("ComponentType");
let unionTypes = compTypeAlias.getTypeNodeOrThrow().getElements().map(e => e.getLiteralText());

// Remove features
unionTypes = unionTypes.filter(t => {
  if (t === "FeatureCTA" || t === "FeaturePricing") return true;
  if (t.startsWith("Feature") || t.startsWith("Features")) return false;
  return true;
});

// Add missing Heroes & Footers
const toAdd = [
  "HeroClarityBlog", "HeroFeedbackApp", "HeroRemoteCollab", "HeroSectionOne", "HeroWithForm",
  "FooterCentered", "FooterDark", "FooterGradient", "FooterLinks"
];

for (const add of toAdd) {
  if (!unionTypes.includes(add)) unionTypes.push(add);
}

// Rebuild union node
compTypeAlias.setTypeNode(unionTypes.map(t => `"${t}"`).join(" | "));

// 3. Remove Feature* from COMPONENT_REGISTRY
const registryVar = sourceFile.getVariableDeclarationOrThrow("COMPONENT_REGISTRY");
const initializer = registryVar.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

const keysToRemove = [];
for (const prop of initializer.getProperties()) {
  if (prop.getKind() === SyntaxKind.PropertyAssignment) {
    const name = prop.getName();
    if ((name.startsWith("Feature") || name.startsWith("Features")) && name !== "FeatureCTA" && name !== "FeaturePricing") {
      keysToRemove.push(prop);
    }
  }
}
for (const prop of keysToRemove) {
  prop.remove();
}

// 4. Add dummy templates for the missing components (if not already existing)
function addRegistryEntry(name, fields = {}) {
  const existing = initializer.getProperty(name);
  if (existing) return;
  initializer.addPropertyAssignment({
    name: name,
    initializer: `{
    type: "${name}",
    label: "${name.replace(/([A-Z])/g, ' $1').trim()}",
    semantic: { purpose: "${name} section", example: {} },
    defaultProps: { className: "" },
    fields: { className: { type: "text", label: "Custom className" } },
    render: (props: any) => {
       return <${name} {...props} />;
    }
  }`
  });
}

for (const add of toAdd) {
  addRegistryEntry(add);
}

// Ensure imports for missing components are there (Actually the inline require in render bypasses needing top level imports, but top level is better)
// We already have React imported. But inline require in Next.js browser side might fail. We should use standard imports.
// Wait, top level imports were deleted. Let's add them back.

const heroImport = sourceFile.addImportDeclaration({
  moduleSpecifier: "../components/macro/Hero",
  namedImports: ["HeroClarityBlog", "HeroFeedbackApp", "HeroRemoteCollab", "HeroSectionOne", "HeroWithForm"]
});

const footerImport = sourceFile.addImportDeclaration({
  moduleSpecifier: "../components/macro/Footer",
  namedImports: ["FooterCentered", "FooterDark", "FooterGradient", "FooterLinks"]
});

sourceFile.saveSync();
console.log("Successfully rebuilt components.tsx and flushed Feature items!");
