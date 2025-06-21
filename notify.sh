#!/bin/bash

# Static.news Notification Script
# Configure your preferred notification method here

MESSAGE="$1"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Method 1: Email-to-SMS (configure your carrier's gateway)
# Examples:
# AT&T: phonenumber@txt.att.net
# Verizon: phonenumber@vtext.com
# T-Mobile: phonenumber@tmomail.net
# Sprint: phonenumber@messaging.sprintpcs.com

# Uncomment and configure:
# PHONE_EMAIL="YOUR_PHONE_NUMBER@YOUR_CARRIER_GATEWAY"
# echo "$TIMESTAMP - $MESSAGE" | mail -s "Static.news Alert" "$PHONE_EMAIL"

# Method 2: Textbelt (1 free SMS/day)
# PHONE_NUMBER="YOUR_PHONE_NUMBER"
# curl -X POST https://textbelt.com/text \
#   --data-urlencode phone="$PHONE_NUMBER" \
#   --data-urlencode message="Static.news: $MESSAGE" \
#   -d key=textbelt

# Method 3: macOS notification (if you're nearby)
if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript -e "display notification \"$MESSAGE\" with title \"Static.news Progress\" sound name \"Glass\""
fi

# Method 4: Log to file (always active)
echo "$TIMESTAMP - $MESSAGE" >> ~/static-news-notifications.log

# Method 5: Terminal bell (if terminal is open)
echo -e "\a"
echo "🔔 NOTIFICATION: $MESSAGE"

# Method 6: Push notification via Pushover (requires account)
# PUSHOVER_USER="YOUR_USER_KEY"
# PUSHOVER_TOKEN="YOUR_APP_TOKEN"
# curl -s -F "token=$PUSHOVER_TOKEN" \
#   -F "user=$PUSHOVER_USER" \
#   -F "title=Static.news" \
#   -F "message=$MESSAGE" \
#   https://api.pushover.net/1/messages.json

echo "Notification sent: $MESSAGE"