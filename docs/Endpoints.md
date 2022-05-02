endpoints for our app:

GET /
=> brings up the main login page

GET /user-created/
=> brings up the main login page but with a success message after user makes accounts

GET /bad-login/
=> brings up the main login page but with an error message if the login was unsuccessful

GET /make-account/
=> brings up the page to make an account

GET /make-account/
=> brings up the page to make an account but with an error message if the submission doesn't work

POST /make-account/make/
=> post request to make a new account & add to database. it will redirect based on information provided.

POST /login-user/
=> post request to sign in a user into their account. it will redirect based on information provided.

GET /home/goals/
=> get request for client side javascript to retrieve json object of goals

GET /user-account-page/:user
=> brings up the user account page of a user to view their information

GET /user-account-page/:user/get
=> get request for client side javascript to retrieve json obect of user information

GET /user-account-page/:username/delete
=> deletes a username from the database & redirects to main page

DELETE /delete-goal/
=> deletes a user's goal from the database

GET /add-goals/:user
=> brings up the user's main goal page to view/add/delete goals

POST /add-goals/add/
=> adds a new user goal to the database

GET /home/goals/
=> get request for client side javascript to retrieve a json object of a user's goals

GET /home/goals/:username
=> get request for client side javascript to retrieve a json object of a user's goals using a browser URL and not request body

GET /app/
=> required API root endpoint, just sends a message to the cient