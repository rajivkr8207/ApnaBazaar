# Backend setup

## MongoDB

Stock adjustment approvals and sale updates use MongoDB transactions. The database
must be a replica set (a single-node replica set is sufficient for local development)
or a sharded cluster; a standalone MongoDB server cannot run these operations.

For a local MongoDB server:

1. Set `replication.replSetName: rs0` in the MongoDB server configuration and restart it.
2. Run `mongosh` and execute `rs.initiate()` once.
3. Set `MONGODB_URI` in `.env` to
   `mongodb://127.0.0.1:27017/rjsupermarket?replicaSet=rs0&retryWrites=false`.

The application also sets `retryWrites: false` when connecting. This option alone
does not enable transactions on a standalone server.
