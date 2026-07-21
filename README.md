# Room 803 Mess Management System - GitHub Pages Build

This directory is ready for deployment on **GitHub Pages** with real-time sync connected to your **Turso Edge Database**.

## 🔑 Configured Database Credentials

* **Turso Database URL**: `https://room-803-mess-db-mess-management-system.aws-eu-west-1.turso.io`
* **Turso Region**: `aws-eu-west-1`
* **Storage Engine**: `v29.0-GITHUB` (Dual Turso SQL + Supabase Sync)

---

## 🚀 How to Publish on GitHub Pages (3 Steps)

### Step 1: Create a GitHub Repository
1. Go to **[https://github.com/new](https://github.com/new)**.
2. Name your repository: `room-803-mess`.
3. Choose **Public** -> click **Create repository**.

### Step 2: Upload Project Files to GitHub
Choose either option below:

#### Option A: Drag & Drop Files on GitHub Web
1. On your new repository page, click **uploading an existing file**.
2. Select and drag all files from this directory (`mess-management-system-github`).
3. Click **Commit changes**.

#### Option B: Git Command Line
```bash
git init
git add .
git commit -m "Initial commit for Room 803 Mess System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/room-803-mess.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. On your repository page, click **Settings** (top navigation bar).
2. On the left menu, click **Pages**.
3. Under **Build and deployment -> Source**, select **Deploy from a branch**.
4. Under **Branch**, select `main` and `/ (root)`, then click **Save**.

🎉 Your website will be live at:
`https://YOUR-USERNAME.github.io/room-803-mess/`
