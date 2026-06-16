
const { PGlite } = require("@electric-sql/pglite");
const { drizzle } = require("drizzle-orm/pglite");
const { v4: uuidv4 } = require("uuid");
const schema = require("./src/models/Schema.ts"); // this is ts, we cant require it directly in cjs.

