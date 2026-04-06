# Quick Deployment to Vercel

## The Easy Way (5 minutes)

### Step 1: Create MongoDB Atlas Account (free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up and create a **free cluster** (M0)
3. Create a database user (e.g., username: `toolsadmin`)
4. Get the connection string and replace password + database name:
   ```
   mongodb+srv://toolsadmin:YOUR_PASSWORD@cluster.mongodb.net/community_tools
   ```
5. Add IP whitelist: Allow 0.0.0.0/0 (or all IPs)

### Step 2: Push to GitHub
```bash
cd C:\Users\23CS101\Documents\comm
git init
git add .
git commit -m "Community Tool System for Vercel"
git remote add origin https://github.com/YOUR_USERNAME/community-tool-system.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Add environment variable:
   - Name: `MONGODB_URI`
   - Value: Paste your full MongoDB connection string directly
   - Do **not** choose "Reference Secret" unless you have already created a secret with that exact name
5. Click "Deploy"

### Step 4: Initialize Database
After deployment completes, visit:
```
https://your-deployment.vercel.app/api/setup
```

### Step 5: Use Your App
Open: `https://your-deployment.vercel.app`

## API Endpoints

- `GET /api/tools` - List all tools
- `POST /api/tools` - Add new tool
- `GET /api/users` - List all users
- `POST /api/users` - Add new user
- `GET /api/usage` - List all usage records
- `POST /api/usage?action=borrow` - Borrow a tool
- `POST /api/usage?action=return` - Return a tool
- `GET /api/setup` - Initialize database

## Environment Variables Needed

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/community_tools
```

## If Vercel shows "references Secret \"mongodb_uri\", which does not exist"

That means the variable was created as a secret reference instead of a plain environment variable.

Fix it by:
1. Opening your Vercel project → Settings → Environment Variables
2. Deleting the broken `MONGODB_URI` entry
3. Adding it again as a normal variable with the MongoDB URI pasted directly
4. Redeploying the project

If you really want to use a secret, create a secret named `mongodb_uri` first and then reference it, but a plain environment variable is simpler.

## Troubleshooting

**"Cannot reach database"**
- Check MongoDB URI is correct
- Ensure IP whitelist includes 0.0.0.0/0

**"Tools not loading"**
- Run `/api/setup` endpoint once to initialize data
- Check browser console for network errors

**"CORS errors"**
- CORS is enabled in all API endpoints

## Next Steps

1. Get a custom domain in Vercel Settings
2. Set up auto-deployments (automatic on Git push)
3. Monitor usage in Vercel Analytics

That's it! Your app is now live! 🚀
