import { createRunCommand } from "./createRunCommand.js";

export const runFromRush = createRunCommand({
    cwd: process.env.RUSH_INVOKED_FOLDER ?? process.cwd()
});
