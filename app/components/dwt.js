import Component from '@ember/component'
import { action } from '@ember/object'
import Dynamsoft from 'dwt'
// import {did-insert} from '@ember/render-modifiers'

export default class DwtComponent extends Component {
  constructor(...args) {
    super(args)
    this.dwtConfig = {
      obj: null,
      licenseKey: 't01016QAAADyBe7yfb9oPaRKoDodUi2D6w3Dj/XeSforvLiBX6PXItwyqx3NL/4Uso1U/t4Gol58RCjB9B1q+RjxJ2qOVHa1eGzRmGbzga3PGGn1/tDAWpk/DKsyhQmO9F1PDDdxIL+c=',

    }
    this.viewerConfig = {
      containerId: 'dwt-viewer',
      obj: null,
      height: '100%',
      width: '100%'
    }
  }
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

  testAction (foo) {
    // alert(foo)
    window.Dynamsoft = Dynamsoft
  }
  didInsertElement() {
    this.initDwt() 
  }
  async initDwt() {
    // let unmounted = await this.unmountDwt()
    await this.mountDwt()
    await this.bindViewer()
  }
  mountDwt () {
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