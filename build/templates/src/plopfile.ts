import { createTemplateRunner, NodePlopAPI,RushConfiguration } from '@tkvw/rush-templates';
import addPackageJsonData from "./addPackageJsonData.js";


const templateRunner = createTemplateRunner(
  addPackageJsonData
);


export default templateRunner(async (plop) => {

  plop.setGenerator('test', {
    prompts: [
      {
        type: 'confirm',
        name: 'wantTacos',
        message: 'Do you want tacos?'
      }
    ],
    actions: function (data) {
      var actions = [];

      if (data?.wantTacos) {
        actions.push({
          type: 'add',
          path: 'folder/{{dashCase name}}.txt',
          templateFile: 'templates/tacos.txt'
        });
      } else {
        actions.push({
          type: 'add',
          path: 'folder/{{dashCase name}}.txt',
          templateFile: 'templates/burritos.txt'
        });
      }

      return actions;
    }
  });
});
