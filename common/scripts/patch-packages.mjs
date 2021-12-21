import path from "path";
import fs from "fs/promises";

// https://github.com/apollographql/invariant-packages/issues/227
async function patch_ts_invariant_packages(){
    const file = path.resolve(process.cwd(),"common/temp/node_modules/.pnpm/ts-invariant@0.9.4/node_modules/ts-invariant/process/package.json");
    const data = JSON.parse(await fs.readFile(file,{
        encoding: "utf-8"
    }));
    data['type'] = 'module';
    await fs.writeFile(file,JSON.stringify(data,null,2),{
        encoding: "utf-8"
    });
}

await patch_ts_invariant_packages();