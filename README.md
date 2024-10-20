### Purpose
To allow for experimentation with OCPPJ 1.6 enabled EV chargers (charge points) without the need to build your own central system.

In actual business use cases, you would need to implement your own central system. This project aims ease the initial phases where we want to learn, observe, and experiment with different charge point models and/or behaviors.

### Design Considerations

1. Charge point websocket connection is decoupled from web app's websocket connection. This allow the charge point connection to stay intact when we refresh the web app.
2. Web app acts as a central system. This allows you to modify the response to charge points' call message with ease.

### Data Handling
1. No data is stored on the server. The only persistence used here is Redis PubSub.
2. Nginx access logs and error logs are kept for a week. These logs include your charge point identity.
3. OCPP messages are not stored anywhere.

If you want absolute control in data handling, please self-host this yourself. Refer to the self-hosting section below.

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

The default central system behavior can be modified by clicking respectative 'Configure' button on the web app UI. The default configuration should already allow your charge point to connect to the central system.

### Self-hosting
You can run this project using `docker-compose.production.yml` file.

The docker compose file listen on 127.0.0.1 which is intentional to prevent unintentionally expose the ports on certain linux distrubutions. Eg. Ubuntu with ufw.

If you plan to expose the service publicly, you are recommended to provide your own reverse proxy and HTTPS certificates.

If you're using nginx as your reverse proxy, consider setting `proxy_read_timeout` higher than 60 seconds (default heartbeat intervel). 300 seconds seems to be good starting point.

### Donate
No pressure. If you would like to you can. If don't feel like it, that's fine too!.

https://buymeacoffee.com/nutratthanan
