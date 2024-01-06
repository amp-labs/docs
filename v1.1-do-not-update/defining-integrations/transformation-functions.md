---
title: "Transformation Functions"
slug: "transformation-functions"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Thu Apr 06 2023 03:20:25 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Wed Apr 12 2023 03:17:46 GMT+0000 (Coordinated Universal Time)"
---
A transformation function is a function that you define of how we should transform a field before sending it to you. Each function should live in its own file inside of the `amp` directory. See [Define integrations](doc:defining-integrations) for the directory structure.

We support TypeScript transformation functions. Each file must export a single `main` function that takes in an input parameter and returns an output, which represents the transformed field. The type signature of the function must indicate the return type. Below is a sample transformation function which removes the "http" and "https" prefixes in URLs.

```typescript
// removeHttpPrefix.ts
export const main = (input: string): string => {
  // input: "https://someurl.com"
  const parts = input.split('//');
  // parts: ["https:", "someurl.com"]
  // return last element
  return parts[parts.length-1];
}
```

> 🗺️ On the roadmap
> 
> Support for Python and Ruby.
