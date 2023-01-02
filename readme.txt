How to set up 

(If you haven't already)
0. Npm install mongodb, express, pug

1. Npm install
2. Node database-initializer.js
3. node server.js

You must start on the home page(to initialize user and artist data). Then you must register and log into the website and continue from there
NOTE: The searches are case sensitive

Overall, I think the design is fairly user friendly, I followed Alina's statement in the fact that we could keep session data on the server.
This meant a partial integration in mongodb since all the queries and most of the data were in the data base. The only things were some of
the user and artist data that were kept in the session. One issue I did face was getting individual reviews to show up on the account since
I was not tracking with unique specifiers. One way I supposed to work around this is to epand the variable for reviews in the user data to track
the review content itself.

I implemented some extra features such as extra information for the workshop as well as being able to see the workshop page and a list of
all the enrolled people and extra information. 

youtube video link: https://youtu.be/ctUIXXloQyQ