# Cable Inventory

Audio cable inventory app — identify, catalog, and manage your cable collection.

[![Contribute](https://www.eclipse.org/che/contribute.svg)](https://workspaces.openshift.com#https://github.com/derekkl/cable-inventory)

## Features

- Inventory of cables with connector type, signal type, quantity
- Search and filter by signal type
- Add, edit, delete cables
- Data persisted in browser localStorage (seeded from `data/cables.json`)

## Open in Dev Spaces

Click the badge above, then run the **Serve** command or:

```bash
python3 -m http.server 8080
```

Open the **http-8080** endpoint from the ENDPOINTS panel.

## Deploy to OpenShift

```bash
oc login --token=xxx --server=https://...
bash deploy.sh
```

## Local use

Open `index.html` directly in a browser — no server needed.
