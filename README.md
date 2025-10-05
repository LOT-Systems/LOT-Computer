# LOT Systems

### Run locally

<details>
  <summary>example.env</summary>

```
NODE_ENV="development"
DEBUG=true

APP_NAME="LOT"
APP_DESCRIPTION="LOT is a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials."

PORT=4400
APP_HOST="http://127.0.0.1:4400"
DATABASE_URL="postgresql://user@localhost:5432/database"

JWT_SECRET="..."
JWT_COOKIE_KEY="jwt"

OPEN_WEATHER_API_KEY="..."
GEONAMES_USERNAME="..."

MAILCHIMP_MANDRILL_API_KEY="..."
MAILCHIMP_FROM_EMAIL="support@lot-systems.com"
MAILCHIMP_FROM_NAME="LOT Systems"

ADMINS='["alice@acme.com"]'

```

</details>

```bash
# Before running
yarn migrations:up

# Run in development mode:
yarn server:watch
yarn client:watch

# Run in production mode:
yarn production:run
```

### Production server

The app is hosted on Heroku. To deploy to the production server, you must configure a separate Git remote:

```bash
git remote add heroku https://git.heroku.com/lot-systems.git
```

Once configured, simply push the changes to the `heroku` remote:

```bash
git push heroku master
```

To inspect the app logs, visit [Papertrail](https://my.papertrailapp.com/systems/lot-systems/events).
