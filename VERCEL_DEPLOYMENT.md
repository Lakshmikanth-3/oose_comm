# Deploying Community Tool System to Vercel

This guide will help you deploy the Community Tool Support System to Vercel with MongoDB as the database backend.

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register) (free)
- [Git](https://git-scm.com/)
- GitHub/GitLab/Bitbucket account (for pushing code)

## Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for free account
   - Create a new project

2. **Create a Cluster**
   - Click "Create a Deployment"
   - Choose "Free" tier (M0)
   - Select your region
   - Click "Create Deployment"
   - Wait for cluster to be created (5-10 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `toolsadmin`
   - Password: Generate secure password (save this!)
   - Click "Add User"

4. **Get Connection String**
   - Go to "Database Deployment" → "Connect"
   - Click "Drivers"
   - Choose "Node.js" and version "5.9 or later"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `myFirstDatabase` with `community_tools`
   
   Example:
   ```
   mongodb+srv://toolsadmin:yourpassword@cluster0.xxxxx.mongodb.net/community_tools?retryWrites=true&w=majority
   ```

5. **Add IP Whitelist**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Vercel to connect

## Step 2: Push Code to GitHub

1. **Initialize Git Repository**
   ```bash
   cd C:\Users\23CS101\Documents\comm
   git init
   ```

2. **Create .gitignore**
   ```bash
   # Add to .gitignore
   node_modules/
   .env
   .env.local
   .vercel
   *.db
   ```

3. **Commit Code**
   ```bash
   git add .
   git commit -m "Initial commit: Community Tool System"
   ```

4. **Push to GitHub**
   - Create new repository on [GitHub](https://github.com/new)
   - Copy the repository URL
   - Run these commands:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/community-tool-system.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the project and click "Import"

2. **Configure Environment Variables**
   - In Vercel, go to "Settings" → "Environment Variables"
   - Add these variables:
   
   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | Your MongoDB connection string |
   | `NODE_ENV` | `production` |

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Vercel will provide your deployment URL

## Step 4: Verify Deployment

1. **Check API Endpoints**
   - Visit: `https://your-deployment.vercel.app/api/tools`
   - You should see the tools list

2. **Initialize Database**
   - Visit: `https://your-deployment.vercel.app/api/setup`
   - This will create collections and add sample data

3. **Access Application**
   - Visit: `https://your-deployment.vercel.app`
   - The application should load and work normally

## Environment Variables for Production

When deploying, set these environment variables in Vercel:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/community_tools
NODE_ENV=production
```

## Troubleshooting

### "Cannot find module 'mongodb'"
- Ensure you ran `npm install` before pushing to GitHub
- Check that `package.json` includes mongodb dependency

### "MongoDB connection failed"
- Verify MongoDB URI is correct
- Check IP whitelist (0.0.0.0/0) in MongoDB Atlas
- Ensure database user password is correct

### "Deployment timeout"
- MongoDB connection might be slow
- Increase timeout in vercel.json (currently 30 seconds)
- Or use a different database solution

### Application not loading
- Check Vercel build logs for errors
- Ensure all environment variables are set
- Verify the public directory is correct

## Next Steps

1. **Enable custom domain**
   - In Vercel dashboard, go to "Settings" → "Domains"
   - Add your custom domain

2. **Set up auto-deployments**
   - Vercel automatically deploys on GitHub push
   - Disable this in Settings if not desired

3. **Monitor performance**
   - Use Vercel Analytics to track usage
   - Monitor MongoDB Atlas for database performance

## Database Schema

The system uses MongoDB with these collections:

- **users** - User information (name, email, phone)
- **tools** - Tool inventory (name, description, quantity, location)
- **usage** - Borrow/return tracking (user_id, tool_id, dates, status, rating)

## Local Development

To run locally with MongoDB:

1. Create `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/community_tools
   NODE_ENV=development
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## File Structure for Vercel

```
project/
├── api/                          # Vercel serverless functions
│   ├── tools.js
│   ├── users.js
│   └── usage.js
├── public/                       # Static files
│   ├── index.html
│   ├── css/style.css
│   └── js/script.js
├── package.json
├── vercel.json
├── .vercelignore
└── .env.local
```

## Support

For issues with Vercel deployment:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

For MongoDB issues:
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
