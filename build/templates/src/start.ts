#!/usr/bin/env node
import {start} from "@tkvw/rush-templates";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

start({
    configFile: path.join(__dirname,"plopfile.js")
});


