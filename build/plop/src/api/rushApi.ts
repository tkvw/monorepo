import { RushConfiguration } from "@microsoft/rush-lib";

export const rushApi = async (startingFolder:string): Promise<RushConfiguration> => RushConfiguration.loadFromDefaultLocation({
    startingFolder: startingFolder ?? process.cwd()
}) 
