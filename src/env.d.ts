/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Fontsource variable packages ship CSS but no type declarations for the
// bare side-effect import; declare them so `astro check` is happy.
declare module '@fontsource-variable/newsreader';
declare module '@fontsource-variable/jetbrains-mono';
declare module '@fontsource/roboto';
declare module '@fontsource/ubuntu';
