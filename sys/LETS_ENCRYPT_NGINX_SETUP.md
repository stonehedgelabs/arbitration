# 🧠 Setup Guide: Nginx + Let's Encrypt (Without ELB)

This guide walks you through configuring **Nginx** as a lightweight reverse proxy with **Let's Encrypt TLS** to securely serve your app running on port **8000**, all **without an AWS ELB**.

---

## 🧩 Step 1 — Install Nginx and Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 🧩 Step 2 — Configure Nginx as a Reverse Proxy

Create your site configuration file:

```bash
sudo nano /etc/nginx/sites-available/sysg.conf
```

Paste this:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the config and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/sysg.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

At this point, `http://yourdomain.com` should proxy traffic to your app running on port `8000`.

---

## 🧩 Step 3 — Point DNS to Your Server

Make sure your domain or subdomain points to your EC2 instance’s **public IPv4 address**.

Test with:

```bash
dig +short yourdomain.com
```

---

## 🧩 Step 4 — Get a Let's Encrypt TLS Certificate

Run the Certbot command:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will:
- Detect your Nginx configuration
- Prove domain ownership via HTTP-01
- Automatically configure HTTPS and redirects
- Reload Nginx with your certificate

---

## 🧩 Step 5 — Verify HTTPS

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://yourdomain.com
```

You should see:

```
HTTP/1.1 200 OK
server: nginx/1.18.0 (Ubuntu)
```

---

## 🧩 Step 6 — Enable Auto-Renewal

Certbot installs a cron job automatically, but you can test it:

```bash
sudo certbot renew --dry-run
```

---

## 🧠 Notes / Tweaks

- **Open Ports** in your EC2 Security Group: `80` (HTTP) and `443` (HTTPS).
- **Restrict App Port**: your app can safely listen on `127.0.0.1:8000`.
- **Force HTTPS Redirect** (Certbot usually adds this automatically):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

---

✅ **Done!**  
Your server now provides secure HTTPS termination directly via Nginx with automatic certificate renewal — no expensive ELB needed.
