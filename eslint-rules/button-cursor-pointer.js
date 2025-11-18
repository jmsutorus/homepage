/**
 * ESLint rule to enforce cursor-pointer on native HTML button elements
 *
 * This rule checks that all <button> elements include "cursor-pointer" in their className.
 * It encourages using the Button component from @/components/ui/button instead,
 * which has cursor-pointer by default.
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce cursor-pointer on native HTML button elements",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      missingCursorPointer:
        "Native <button> element should include 'cursor-pointer' in className. Consider using the Button component from @/components/ui/button instead.",
      preferButtonComponent:
        "Prefer using the Button component from @/components/ui/button over native <button> elements.",
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // Check if this is a native button element (lowercase)
        if (node.name.type === "JSXIdentifier" && node.name.name === "button") {
          // Find the className attribute
          const classNameAttr = node.attributes.find(
            (attr) =>
              attr.type === "JSXAttribute" &&
              attr.name &&
              attr.name.name === "className"
          );

          if (!classNameAttr) {
            // No className at all - report error
            context.report({
              node,
              messageId: "missingCursorPointer",
            });
            return;
          }

          // Check the className value
          const classNameValue = classNameAttr.value;

          if (!classNameValue) {
            // className exists but no value
            context.report({
              node,
              messageId: "missingCursorPointer",
            });
            return;
          }

          let classNameString = "";

          if (classNameValue.type === "Literal") {
            // Static className string
            classNameString = classNameValue.value;
          } else if (
            classNameValue.type === "JSXExpressionContainer" &&
            classNameValue.expression.type === "Literal"
          ) {
            // className={`some-class`} or className={"some-class"}
            classNameString = classNameValue.expression.value;
          } else if (
            classNameValue.type === "JSXExpressionContainer" &&
            classNameValue.expression.type === "TemplateLiteral"
          ) {
            // Template literal - check quasis for static parts
            const quasis = classNameValue.expression.quasis;
            classNameString = quasis.map((q) => q.value.raw).join(" ");
          } else if (
            classNameValue.type === "JSXExpressionContainer"
          ) {
            // Dynamic className - we can't fully validate, but check if it includes cursor-pointer in any static parts
            const sourceCode = context.getSourceCode();
            const classNameText = sourceCode.getText(classNameValue.expression);

            // If we can see "cursor-pointer" anywhere in the expression, assume it's okay
            if (classNameText.includes("cursor-pointer")) {
              return;
            }

            // Otherwise, warn that we couldn't verify
            context.report({
              node,
              messageId: "missingCursorPointer",
            });
            return;
          }

          // Check if cursor-pointer is in the className string
          if (!classNameString.includes("cursor-pointer")) {
            context.report({
              node: classNameAttr,
              messageId: "missingCursorPointer",
              fix(fixer) {
                // Auto-fix: add cursor-pointer to the beginning of the className
                if (classNameValue.type === "Literal") {
                  const newValue = `cursor-pointer ${classNameValue.value}`;
                  return fixer.replaceText(classNameValue, `"${newValue}"`);
                }
                // For complex expressions, don't auto-fix
                return null;
              },
            });
          }
        }
      },
    };
  },
};
