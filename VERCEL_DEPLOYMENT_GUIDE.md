# Vercel Deployment Guide for PromSell

## 🚀 Project Overview

PromSell is a Next.js 15 application that allows users to sell and purchase AI prompt templates. The project uses Supabase for authentication and database, Stripe for payments, and Google AI for prompt generation.

## ✅ What Your Project HAS for Vercel Deployment

### 1. **Next.js 15 Configuration** ✅

- Modern Next.js 15.4.4 with App Router
- Proper `next.config.js` setup
- Build scripts configured (`npm run build`)

### 2. **Package Dependencies** ✅

- All required dependencies in `package.json`
- React 19.1.0 compatibility
- Proper dev dependencies for build process

### 3. **Build Configuration** ✅

- Tailwind CSS with DaisyUI
- PostCSS configuration
- ESLint configuration
- Proper content paths in Tailwind config

### 4. **File Structure** ✅

- App Router structure (`src/app/`)
- API routes properly organized
- Component structure follows Next.js conventions

## ❌ What Your Project NEEDS for Vercel Deployment

### 1. **Environment Variables Setup**

You MUST configure these environment variables in Vercel:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google AI API
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### 2. **Missing Stripe Configuration File**

Your project references `@/lib/stripe` but this file doesn't exist. You need to create it:

```javascript
// src/lib/stripe.js
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const STRIPE_CONFIG = {
  payment_method_types: ["card"],
  mode: "payment",
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
};
```

### 3. **Database Schema Requirements**

Your project expects these Supabase tables and functions:

- `profiles` table with `role` column
- `prompts` table for storing prompt templates
- `user_prompts` table for tracking ownership
- `user_owns_prompt` database function
- `payout_methods` table
- RLS policies configured

## 🔧 Deployment Requirements

### **Minimum Requirements:**

- Node.js 18.17 or later
- npm or yarn package manager
- Vercel account
- Supabase project
- Stripe account
- Google AI API access

### **Recommended Requirements:**

- Node.js 20.x LTS
- Vercel Pro plan (for custom domains and advanced features)
- Supabase Pro plan (for better performance and features)

## 📋 Pre-Deployment Checklist

### 1. **Environment Setup**

- [ ] Create `.env.local` file with all required variables
- [ ] Test locally with `npm run dev`
- [ ] Ensure all API routes work locally
- [ ] Test Stripe checkout flow
- [ ] Test Supabase authentication

### 2. **Code Quality**

- [ ] Run `npm run lint` and fix any errors
- [ ] Ensure all imports resolve correctly
- [ ] Check for any hardcoded localhost URLs
- [ ] Verify all API endpoints are working

### 3. **Database Setup**

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] RLS policies configured
- [ ] Test authentication flow
- [ ] Test database operations

## 🚀 Deployment Steps

### **Step 1: Prepare Your Repository**

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### **Step 2: Connect to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click "New Project"
4. Import your PromSell repository

### **Step 3: Configure Environment Variables**

In Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add each environment variable from the list above
3. Set them for Production, Preview, and Development

### **Step 4: Configure Build Settings**

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### **Step 5: Deploy**

1. Click "Deploy"
2. Wait for build to complete
3. Check for any build errors
4. Test the deployed application

## 🔍 Post-Deployment Verification

### **Check These URLs:**

- [ ] Homepage loads correctly
- [ ] Authentication works (sign in/sign up)
- [ ] API routes respond properly
- [ ] Stripe checkout flow works
- [ ] Prompt generation works
- [ ] Database operations function

### **Common Issues to Watch For:**

1. **Environment Variables**: Ensure all are set in Vercel
2. **CORS Issues**: Check if Supabase allows your Vercel domain
3. **Build Errors**: Check Vercel build logs for missing dependencies
4. **API Errors**: Verify all environment variables are accessible

## 🛠️ Troubleshooting

### **Build Fails:**

```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm install --legacy-peer-deps
# or
yarn install --ignore-engines
```

### **Environment Variables Not Working:**

- Ensure variables are set for all environments (Production, Preview, Development)
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### **API Routes Not Working:**

- Verify Supabase URL and keys
- Check RLS policies in Supabase
- Ensure database functions exist

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## ⚠️ Important Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Update `NEXT_PUBLIC_APP_URL`** to your Vercel domain after deployment
3. **Test thoroughly** in Vercel preview deployments before going to production
4. **Monitor Vercel analytics** for performance insights
5. **Set up custom domain** if needed (requires Vercel Pro)

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Application builds without errors
- ✅ All pages load correctly
- ✅ Authentication works end-to-end
- ✅ Stripe payments process successfully
- ✅ Prompt generation functions properly
- ✅ Database operations work as expected

---

**Need Help?** Check the Vercel deployment logs and ensure all environment variables are properly configured. Most deployment issues stem from missing or incorrect environment variable configuration.
