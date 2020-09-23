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

Firstly, we should install its package. In your terminal, enter `npm install dwt`.

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

> Notice that we do not modify the command for `au run`. Therefore, `au run` would not copy the resource files for you. 

## Development

### Scan

We are now able to write down the code. The first feature we implement is scanning. It's the fundamental feature of Dynamic Web TWAIN, and it is the goal of our application. 

First step, creating a component template under `/app/components`with name `dwt.hbs`. The **hbs** is the template file that ember.js uses for final HTML document rendering. It hries HTML syntax but adds its own marker for substitution. In the template file, we put the following code.

```html
<div id="dwt-viewer" style="width: inherit; height: 50vh;"></div>
<div id="dwt-control">
  <button {{ on 'click' this.acquireImage }}>Scan</button>
</div>
```

We add two `<div>` elements to the template so that one can contains the viewer whereas the remaining one could group the buttons. You may wonder what is "`{{ on 'click' this.acquireImage }}`". Well, it tells ember to bind the `acquireImage` method as the click handler.

Next, we create the script file `dwt.js`, which has the same name as the template one in the same folder. The script file and the template file should be inside the same folder. In the script file, we add the following code.

```js
import Component from '@ember/component'
import { action } from '@ember/object'
import Dynamsoft from 'dwt'

export default class DwtComponent extends Component {
  constructor(...args) {
    super(args)
    this.dwtConfig = {
      obj: null,
      licenseKey: 'your license key here',

    }
    this.viewerConfig = {
      containerId: 'dwt-viewer',
      obj: null,
      height: '100%',
      width: '100%'
    }
  }
  /* Ember uses decorator to indicate which ones are action methods, 
     though decorator mode has not been finalized yet. */
  @action
  acquireImage () {
    const DWObject = this.dwtConfig.obj;
    if (DWObject) {
      if (DWObject.UseLocalService) {
        let configure = {
          IfShowUI: this.showUI,
          PixelType: this.colorMode,
          Resolution: this.resolution,
          IfFeederEnabled: this.autoFeeder,
          IfDuplexEnabled: this.duplex,
          IfDisableSourceAfterAcquire: true,
          // Advance settings
          IfGetImageInfo: true,
          IfGetExtImageInfo: true,
          extendedImageInfoQueryLevel: 0
        }
        DWObject.SelectSourceByIndex(this.selectScanner)
        DWObject.AcquireImage(
          configure,
          () => { DWObject.CloseSource() },
          () => { DWObject.CloseSource() }
        )
      }
    }
  }
  didInsertElement() {
    this.initDwt() 
  }
  async initDwt() {
    await this.mountDwt()
    await this.bindViewer()
  }
  async mountDwt () {
    await this.unmountDwt()
    return new Promise((res, rej) => {
      const that = this
      const env = Dynamsoft.WebTwainEnv
      env.AutoLoad = false
      env.ResourcesPath = '/lib/dwt'
      env.UseLocalService = true
      env.IfAddMD5InUploadHeader = false
      env.IfConfineMaskWithinTheViewer = false
      env.ProductKey = this.dwtConfig.licenseKey
      let dwtConfig = { WebTwainId: 'dwt-id' }
      env.CreateDWTObjectEx(
          dwtConfig, 
          (dwtObject) => { that.dwtConfig.obj = dwtObject;res();},
          (errStr) => { console.log(`failed to initialize dwt, message: ${errStr}`);rej(); }
        )
    })
    
  }
  unmountDwt () {
    let unmount = function () {
      return Dynamsoft.WebTwainEnv.DeleteDWTObject('')
    }
    return new Promise((res, rej) => {
      let result = unmount()
      if (result) res(result)
      else rej(result)
    })
  }
  bindViewer () {
    let options = {
      width: this.viewerConfig.width,
      height: this.viewerConfig.height,
      view: {
        bShow: true,
        Width: this.viewerConfig.width,
        Height: this.viewerConfig.height
      }
    }
    if (this.dwtConfig.obj.BindViewer(this.viewerConfig.containerId, options)) {
      this.viewerConfig.obj = this.dwtConfig.obj.Viewer
    }
  }
  getViewerStyle () {
    return `"width: ${this.viewerConfig.width}; height: ${this.viewerConfig.height};"`
  }
}
```

There are some points to keep in mind in this code.

1. Though we have copied the resource files to a path, we still have to configure its path to the SDK environment. The SDK will load extra files (css and js files) from the specified path. If not given a value or given a wrong value, the initialization process would not succeed.
2. The dwt object and the viewer should be created respectively and sequentially. The viewer should not be created until the dwt object has been successfully created.
3. The viewer create process will insert a div containing the viewer as the child element of your specified `<div>`. If you uses `'100%'` as the width or height, you must ensure your specified container have an explicit size at the time of creation. 
4. Similar to the initialization process in Vue.js, the environment could be created after the HTML elements have been rendered on the page. Thereafter, we overload the `didElementInsert` to let ember.js invoke initialization methods for us at the correct timing. 

Finally, we need to mount the newly implemented component to the view. Since we do not have other routes in this tutorial, we mount the DWT component to the homepage. Open `application.hbs` from `app/templates`, then insert `<Dwt />` to the top. Don't forget to **remove the `Welcome` component and the `outlet`**. 

```html
<!-- If you restricly followed this tutorial, your application.hbs should not contain any code other than <Dwt /> -->
<Dwt />
```

Moreover, if you hope to add more features, please refer to [Make a component-based document scanning web app]() to get inspired. The fundamental idea is the same: make the component then mount to the page.

## Test our application

We have finished the development work. Let's run it and check whether we have done the correct work.

In your terminal, typing `npm start` and wait for building. Once you see it is serving on `http://localhost:4200`, go to the browser and open the address. Your app successfully run when you see the following page.

![App first state if successfully runs](D:\\docs\\ember-dwt\\success-run-first-page.png)