# Next.js Insurance Management System

## Overview
This is a Next.js application for managing insurance policies and client information. The application was originally built with both App Router and Pages Router, but has been configured to use Pages Router for compatibility.

## Current State
- ✅ Dependencies installed with pnpm
- ✅ Next.js configured for Replit environment
- ✅ Development server running on port 5000
- ✅ Resolved routing conflicts between App Router and Pages Router
- ✅ Supabase client configured with demo fallbacks

## Project Architecture
- **Framework**: Next.js 15.2.0 with Pages Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (configured with demo fallbacks)
- **Package Manager**: pnpm
- **Main Features**: 
  - Insurance policy management
  - Client information tracking
  - Policy expiration alerts
  - CRUD operations for insurance records

## Recent Changes
- **Date**: September 19, 2025
- Removed App Router (app/ directory) to resolve routing conflicts
- Added Supabase dependency
- Configured Next.js for Replit proxy environment
- Set up development workflow on port 5000
- Added fallback values for Supabase environment variables

## Setup Notes
- The application requires Supabase environment variables for full functionality:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Currently configured with demo fallbacks for development/testing
- Main application functionality is in `pages/index.js`

## User Preferences
- Uses Portuguese language for UI elements
- Insurance management specific to Brazilian market (CPF field)
- Simple, functional design with inline styles