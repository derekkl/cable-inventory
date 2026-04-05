#!/bin/bash
set -e

APP_NAME="cable-inventory"
REPO="https://github.com/derekkl/cable-inventory"

echo "==> Deploying $APP_NAME to OpenShift..."

if ! oc whoami &>/dev/null; then
  echo "ERROR: Not logged in to OpenShift. Run 'oc login' first."
  exit 1
fi

if oc get bc/$APP_NAME &>/dev/null; then
  echo "==> App exists, triggering rebuild..."
  oc start-build $APP_NAME --follow
else
  echo "==> Creating app from $REPO..."
  oc new-app --name=$APP_NAME nginx~$REPO
  echo "==> Waiting for first build..."
  oc logs -f bc/$APP_NAME
  echo "==> Exposing route..."
  oc create route edge --service=$APP_NAME
fi

echo ""
echo "==> Done! App URL:"
oc get route $APP_NAME --template='https://{{.spec.host}}'
echo ""
