# Pluralizer

A lightweight JavaScript library for handling pluralization in multiple languages with a rule-based approach.

## Features

- Rule-based pluralization system
- Support for complex pluralization rules in any language
- Works in browser and Node.js environments (UMD compatible)
- Zero dependencies
- Tiny footprint (~3KB)

## Usage

### Basic Example

```javascript
// Set pluralization rules
pluralizer.setRules("ends(1)#ends(range(2,4))#or(ends(range(5, 19)), ends(0))");

// Use the rules with variables
const result = pluralizer.make("#{яблоко@яблока@яблок?count}", { count: 5 });
// result: "яблок"
```

### Rule Expressions

The library supports various expressions for defining pluralization rules:

- `ends(value)` - Checks if the number ends with the specified value
- `range(from, to)` - Creates a range of numbers
- `or(expr1, expr2)` - Logical OR between expressions
- `and(expr1, expr2)` - Logical AND between expressions
- `equals(value)` - Checks if the number equals the specified value
- `any()` - Matches any value

### Template Format

Templates use the following format: `#{form1@form2@form3?variable}`

Where:
- `form1`, `form2`, `form3` are different word forms
- `variable` is the variable name to check against the rules

## Demo

Open `index.html` in your browser to try the interactive demo.

## License

MIT
