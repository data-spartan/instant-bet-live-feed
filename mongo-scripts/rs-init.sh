
DELAY=10

mongosh <<EOF
var config = {
    "_id": "dbrs",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongodb-live-feed-1:27017",
            "priority": 2
        },
        {
            "_id": 2,
            "host": "mongodb-live-feed-2:27017",
            "priority": 1
        },
        {
            "_id": 3,
            "host": "mongodb-live-feed-3:27017",
            "priority": 1
        },
    ]
};
rs.initiate(config, { force: true });
rs.reconfig(config, { force: true });
EOF

echo "****** Waiting for ${DELAY} seconds for replicaset configuration to be applied ******"

sleep $DELAY

# mongosh < scripts/init.js