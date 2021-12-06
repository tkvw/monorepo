export function getCwd(){
    return process.env.RUSH_INVOKED_FOLDER ?? process.cwd()
}