# The CRAP UI

## About
Welcome to the CRAP UI. Here you can easily conenct to your manager node and setup your cluster

## Prerquisities
This UI requires you to copy your public key to the manager node, follow these [instructions](https://askubuntu.com/questions/46930/how-can-i-set-up-password-less-ssh-login).

After you have to create a file .env in root (frontend) where you specify the variable **`VITE_PRIVATE_KEY_PATH=<private_key_path>`** where `<private_key_path>` should specify the path to your key.

## File Structure
```
.
├── README.md
├── electron
│   ├── main.js
│   └── preload.js
├── src
│   ├── App.jsx
│   ├── components
│   ├── features
│   ├── main.jsx
│   ├── pages
│   ├── routes
│   └── style.css
```

### electron
Contains main.js and preload.js which specifies how the desktop window should look and act. Also safely handles network connections.

### src
contains App.jsx and main.jsx which contains the actual app
#### components
Here components that are used within the code are defined
#### features
Here functions that are used by the code are defined. Usually handles.
#### pages
All the pages of the app
#### routes
Contains the navigation structure of the app
