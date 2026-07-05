// Type declarations for CSS modules and side-effect CSS imports
// These are handled by Metro/Expo at build time but tsc doesn't understand them

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.css" {
  const content: string;
  export default content;
}
