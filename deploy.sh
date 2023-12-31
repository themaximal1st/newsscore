#!/bin/bash

APP_NAME="newsscore.com"

UPDATES=$(git pull)
if [[ $UPDATES != *"Already up to date"* ]]; then
  npm install

  if pm2 list | grep -q $APP_NAME; then
    pm2 restart $APP_NAME
  else
    pm2 start src/index.js --name $APP_NAME
  fi
else
  echo "No updates found. Nothing to do."
fi

