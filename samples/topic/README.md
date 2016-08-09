This sample illustrate how to use cta-messaging to broadcast messages (eg. notifications) to multiple destinations

Start two consoles (or more) to run different instances of subscriber

````javascript
node subscriber.js // console 1
node subscriber.js // console 2
````

Start publisher in a different console

````javascript
node publisher.js // console 3
````

You should see all subscribers consoles receiving the same message sent from the publisher