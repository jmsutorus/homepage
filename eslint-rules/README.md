# Custom ESLint Rules

This directory contains custom ESLint rules specific to this project.

## Rules

### `button-cursor-pointer`

**Type:** `suggestion` (warning)
**Auto-fixable:** Yes (for simple cases)

Enforces that all native HTML `<button>` elements include `cursor-pointer` in their `className` attribute.

#### Why This Rule Exists

Buttons should have a pointer cursor to indicate they're clickable. While the `Button` component from `@/components/ui/button` includes `cursor-pointer` by default, native `<button>` elements need it added manually.

#### Examples

❌ **Incorrect:**
```tsx
// Missing cursor-pointer
<button className="bg-blue-500 text-white px-4 py-2">
  Click me
</button>

// No className at all
<button onClick={handleClick}>
  Click me
</button>
```

✅ **Correct:**
```tsx
// Has cursor-pointer
<button className="cursor-pointer bg-blue-500 text-white px-4 py-2">
  Click me
</button>

// Better: Use the Button component instead
import { Button } from "@/components/ui/button";

<Button>Click me</Button>
```

#### Auto-fix

The rule can automatically add `cursor-pointer` to existing `className` attributes:

```bash
npm run lint -- --fix
```

**Note:** The auto-fix does NOT add a `className` attribute if one doesn't exist. You'll need to add it manually.

#### Best Practice

**Prefer using the `Button` component** from `@/components/ui/button` instead of native `<button>` elements. The Button component:
- Has `cursor-pointer` built-in
- Includes consistent styling
- Supports variants and sizes
- Has proper focus states

Only use native `<button>` elements when absolutely necessary (e.g., within other UI library components).

## Adding New Rules

To add a new custom rule:

1. Create a new file in this directory (e.g., `my-rule.js`)
2. Export the rule following ESLint's rule format
3. Add the rule to `index.js`
4. Update `eslint.config.mjs` to enable the rule
5. Document the rule in this README

## Rule Format

```javascript
module.exports = {
  meta: {
    type: "problem" | "suggestion" | "layout",
    docs: {
      description: "Rule description",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code" | "whitespace" | null,
    schema: [], // JSON Schema for rule options
    messages: {
      messageId: "Error message template",
    },
  },
  create(context) {
    return {
      // AST visitors
    };
  },
};
```

## Resources

- [ESLint Custom Rules Documentation](https://eslint.org/docs/latest/extend/custom-rules)
- [AST Explorer](https://astexplorer.net/) - Useful for understanding AST structure
