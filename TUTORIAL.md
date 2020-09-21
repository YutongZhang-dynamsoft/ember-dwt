# How to make WebTWAIN App with Ember.js

## Installation

### Install Ember.js

The installation of Ember.js is simple. With single command `npm install -g ember-cli`, you can finalize from installation to deploying Ember.js and Ember-based application.

### Install Dynamic Web TWAIN

> TODO: Complete DWT installation procedures

## Create The Project

Open a terminal, change your directory to the path where you hope to create a project. Then, type the following command in the terminal:

```bash
ember new ember-dwt
```

This command will create the structured project with templates and install all the dependencies for you.

## Integrate With Dynamic Web TWAIN

Once you have created the project, let's integrates it with Dynamic Web TWAIN. 

Firstly, we should install its package. In your terminal, enter `npn install dwt`.

Secondly, we need ncp to do extra work for us. In your terminal, enter `npm install ncp`.

Thirdly, modify the script to let the ember-cli to copy the resource files to a path when building. In `package.json`, we update the `"scripts"` part to the following one:

```js
"scripts": {
  "build": "ember build --environment=production && ncp node_modules/dwt/dist public/lib/dwt",
  "lint": "npm-run-all --aggregate-output --continue-on-error --parallel lint:*",
  "lint:hbs": "ember-template-lint .",
  "lint:js": "eslint .",
  "start": "ncp node_modules/dwt/dist public/lib/dwt && ember serve",
  "test": "npm-run-all lint:* test:*",
  "test:ember": "ember test"
}
```

Finally, create the folders we just specified in `package.json`. Changing your working directory to the project's root and use the following commands to create the folder.

```bash
cd public
mkdir lib
cd lib
mkdir dwt
```

Now, let's type `npm start` in the terminal and try to build the project.

If you could see the resource files have been copied to the specified path and the terminal report "Serving on http://localhost:4200", you have successfully imported the Dynamic Web TWAIN.

## Development

### Scan

We are now able to write down the code. The first feature we implement is scanning. It's the fundamental feature of Dynamic Web TWAIN, and it is the goal of our application. 