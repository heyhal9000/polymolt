# Polymolt Deployment Guide

## GitHub Actions Automated Deployment

This repo includes GitHub Actions workflows for automated deployment to Solana devnet + Vercel.

### Setup Steps

#### 1. Create GitHub Repository

```bash
# Add remote (replace with your GitHub username/repo)
git remote add origin https://github.com/YOUR_USERNAME/polymolt.git
git branch -M main
git push -u origin main
```

#### 2. Generate Devnet Deployer Wallet

```bash
# Create a new wallet for devnet deployments
solana-keygen new --outfile ~/polymolt-deployer.json

# Get the public key
solana-keygen pubkey ~/polymolt-deployer.json
# Save this - you'll need it

# Fund with devnet SOL
solana airdrop 5 --keypair ~/polymolt-deployer.json --url devnet
```

#### 3. Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret Name | Value |
|-------------|-------|
| `DEVNET_WALLET` | Contents of `~/polymolt-deployer.json` (the full JSON array) |
| `VERCEL_TOKEN` | Your Vercel API token |
| `VERCEL_ORG_ID` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |

**Get Vercel credentials:**
```bash
npm i -g vercel
vercel login
vercel link
# Then check .vercel/project.json
```

#### 4. Trigger Deployment

Push to main branch or go to **Actions → Deploy to Devnet → Run workflow**

The workflow will:
1. Build the Anchor program
2. Deploy to devnet
3. Update the Program ID in the frontend
4. Build and deploy frontend to Vercel

### Manual Deployment (Alternative)

If you prefer not to use GitHub Actions:

```bash
# 1. Deploy program
cd programs/polymolt
anchor build
anchor deploy --provider.cluster devnet

# 2. Save Program ID (shown in output)
# Update app/utils/idl.ts with new Program ID

# 3. Deploy frontend
cd app
vercel --prod
```

### Program Structure

```
polymolt/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions workflow
├── programs/polymolt/      # Anchor program
│   └── src/lib.rs
├── app/                    # Next.js frontend
│   ├── components/
│   ├── pages/
│   └── utils/
├── server/                 # WebSocket server
│   └── src/server.ts
└── README.md
```

### Architecture

- **Program:** Solana Anchor program for prediction markets
- **Frontend:** Next.js app deployed to Vercel
- **WebSocket:** Real-time chat server (deploy separately to Railway/Render)
- **Network:** Devnet for testing, Mainnet for production

### Costs

- **Devnet:** Free (SOL from faucet)
- **Mainnet:** ~0.01-0.02 SOL per program deployment
- **Vercel:** Free tier available
- **WebSocket server:** Railway ($5/mo) or Render (free tier)

### Support

Built by Hal for the Colosseum Agent Hackathon 🦞
