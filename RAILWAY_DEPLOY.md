# Django Dealership App - Railway Deployment

## Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/WVGo0j?referralCode=alphasec)

## Manual Deployment Steps

1. Fork this repository
2. Go to [Railway.app](https://railway.app)
3. Click "Deploy from GitHub repo"
4. Select this repository
5. Set root directory to `server`
6. Add environment variables:
   - `DEBUG=False`
7. Deploy!

Your app will be available at: `https://your-app-name.up.railway.app`

## Local Development

1. Navigate to the server directory: `cd server`
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Start server: `python manage.py runserver`
