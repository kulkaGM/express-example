**Run the project"** install packages with `npm i`\
Create your config.js from next to app.js, there's example config in lib/exampleConfig.js\
Run the application with `npm start` or `node .`

**Safety**: Administrator can delete and create users.\
Any User can create his own Services\
On run of the app, theres admin account create if none exists yet, you can configure this in config.js, it is recommended to leave as default\
Api example http://localhost:8080/api/users/login\
And other below

### User
Login User\
POST `/api/users/login`\
Content-Type: application/json
```JSON
{
  "email": "testemail@test.com",
  "password": "testpassword"
}
```


\
Create User (admin only)\
POST `/api/users`\
Content-Type: application/json
```JSON
{
  "name": "Stan",
  "lastName": "Lee",
  "companyName": "Marvel",
  "email": "testemail@test.com",
  "password": "testpassword"
}
```

\
Get User by ID (admin only)\
GET `/api/users/1`

\
Delete User by ID (does not delete Users services!)  (admin only)\
DELETE `/api/users/1`

### Services
Loged in user, can create, delete only his services, if not an admin\
API for admin for sevices, not implemented yet

Service Create\
POST `/api/services`\
Content-Type: application/json
```JSON
{
  "name": "Automatic messages"
}
```

\
Get Service by ID\
GET `/api/services/1`

\
Delete Service by ID\
DELETE `/api/services/1`