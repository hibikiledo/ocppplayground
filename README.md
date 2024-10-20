### Purpose
To allow for experimentation with OCPPJ 1.6 enabled EV chargers (charge points) without the need to build your own central system.

In actual business use cases, you would need to implement your own central system. This project aims ease the initial phases where we want to learn, observe, and experiment with different charge point models and/or behaviors.

### Main Design Consideration

Charge point websocket connection is decoupled from web app's websocket connection. This allow the charge point connection to stay intact when we refresh the web app.

### Limitations
1. Multiple web app users connecting to the same charge point identity is not supported.
2. Multiple charge points connecting with the same charge point identity is not supported.

### Demo
https://ocpp.evtoolbox.app

### Usage
1. On you charge point's specific commissioning / setup tool, Take note of your charge point identity
2. On you charge point's specific commissioning / setup tool, Configure your charge point to use the central system URL shown on the demo website.
3. On the demo site, Enter your charge point identity on the demo website
4. On the demo site, Click 'Start'
5. Wait for your first message to arrive

### Self-hosting
You can run this project using `docker-compose.production.yml` file.

The docker compose file listen on 127.0.0.1 which is intentional to prevent unintentionally expose the ports on Ubuntu (ufw) for example.

You are recommended to provide your own reverse proxy and HTTPS certificates.

If you're using nginx as your reverse proxy, consider setting `proxy_read_timeout` higher than 60 seconds (default heartbeat intervel). 300 seconds seems to be good starting point.
