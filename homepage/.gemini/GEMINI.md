# Gemini Configuration

This file outlines the structure of the repository, lists the available MCP servers, and provides configuration details for the Gemini CLI.

## Repository Structure

The repository is a Next.js project with the following structure:

- `app/`: Contains the application's pages and components.
- `public/`: Stores static assets like images and SVGs.
- `.next/`:  The Next.js build output directory.
- `node_modules/`: Contains the project's dependencies.
- `.gemini/`: Stores Gemini-related configuration and files.

## MCP Servers

The following MCP servers are available for this project:

- `context7`: Provides access to pull the latest documentation on libraries
- `next-devtools`: Provides tools for interacting with the Next.js development server.
- `shadcn`: Offers utilities for working with shadcn components.

## Configuration

- **Always Use:** `context7`
- **When Applicable:**
    - `next-devtools`
    - `shadcn`
