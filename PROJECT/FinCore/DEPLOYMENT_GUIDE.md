# FinCore Production Deployment Guide

Whenever you are ready to take **FinCore** live to the internet, follow this roadmap. We have three standard, battle-tested production deployment options.

---

## Architecture Overview

FinCore consists of three tiers:
1. **Frontend**: Vite + React 19 Single Page Application.
2. **Backend**: FastAPI + Uvicorn ASGI Python 3.12 Web API.
3. **Database**: MySQL 8.0 with relational tables, indexes, views, and cascade rules.

---

## 🚀 Option 1: Modern Cloud Platform (Recommended for Easiest Setup)
* **Frontend**: Vercel or Netlify (Free tier available)
* **Backend**: Render.com or Railway.app (Free / Low cost)
* **Database**: Aiven.io, Railway.app, or Clever Cloud (Managed MySQL)

### Step 1: Managed MySQL Database
1. Create a MySQL database instance on [Aiven.io](https://aiven.io) or [Railway](https://railway.app).
2. Note the host, port, username, password, and database name.
3. Import your database dump:
   ```bash
   mysql -h <host> -P <port> -u <user> -p <db_name> < fincore_database.sql
   ```

### Step 2: Deploy Backend (Render.com)
1. Push your repository to GitHub.
2. Create a new **Web Service** on Render connected to your GitHub repo.
3. Settings:
   - **Root Directory**: `.`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port 10000`
4. Set Environment Variables in Render:
   - `DATABASE_URL`: `mysql+pymysql://<user>:<password>@<host>:<port>/<db_name>?charset=utf8mb4`
   - `JWT_SECRET`: `your_strong_production_secret_32chars`
   - `SECRET_KEY`: `your_strong_secret_key_32chars`
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USERNAME`: `vsktupakula05@gmail.com`
   - `SMTP_PASSWORD`: `weyqzqvfslwbeutr`
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`

### Step 3: Deploy Frontend (Vercel)
1. Import your GitHub repository in [Vercel](https://vercel.com).
2. Configure Project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable in Vercel:
   - `VITE_API_URL`: `https://your-backend.onrender.com`

---

## 🖥️ Option 2: Single Virtual Private Server (AWS EC2 / DigitalOcean / Hostinger VPS)
Best for full control and high performance on a single Ubuntu 22.04 / 24.04 server.

### 1. Server Prerequisites
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv mysql-server nginx certbot python3-certbot-nginx nodejs npm
```

### 2. Configure MySQL
```bash
sudo mysql_secure_installation
sudo mysql -u root -p
CREATE DATABASE fincore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fincore_user'@'localhost' IDENTIFIED BY 'StrongProdPassword!123';
GRANT ALL PRIVILEGES ON fincore_db.* TO 'fincore_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import initial seed data:
mysql -u fincore_user -p fincore_db < fincore_database.sql
```

### 3. Deploy Backend via Systemd Service
Create `/etc/systemd/system/fincore-backend.service`:
```ini
[Unit]
Description=FinCore FastAPI Daemon
After=network.target mysql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/FinCore
ExecStart=/home/ubuntu/FinCore/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=5
EnvironmentFile=/home/ubuntu/FinCore/.env

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable fincore-backend
sudo systemctl start fincore-backend
```

### 4. Build Frontend & Configure Nginx
```bash
cd /home/ubuntu/FinCore/frontend
npm install
npm run build
```

Configure Nginx `/etc/nginx/sites-available/fincore`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend Single Page App
    location / {
        root /home/ubuntu/FinCore/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable site and get free SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/fincore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔒 Production Checklist Before Going Live
- [ ] Change all default demo passwords (`Admin@123`, `Customer@123`) via the newly added Change Password feature.
- [ ] Generate fresh 64-character random strings for `JWT_SECRET` and `SECRET_KEY`.
- [ ] Ensure `ENVIRONMENT=production` in `.env`.
- [ ] Set exact CORS origins in `backend/app/main.py` matching your live domain URL.
- [ ] Ensure HTTPS / SSL is enforced on all API endpoints and pages.
