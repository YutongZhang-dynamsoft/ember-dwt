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
    this.formats = [
      {id: 'pdf', text: 'pdf'},
      {id: 'jpg', text: 'jpg'},
      {id: 'tif', text: 'tif'}
    ]
    this.selectFormat = 'pdf'
    this.fileName = ''
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
  didInsertElement() {
    this.initDwt() 
  }
  async initDwt() {
    // let unmounted = await this.unmountDwt()
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
  @action
  updateValue (val) {
    this.selectFormat = val
  }
  @action
  uploadFile () {
    const host = '127.0.0.1'
    const protocol = 'http'
    const uploadPath = '/api/File'
    let uploadFileName = this.fileName + '.' + this.selectFormat
    const port = 51065

    let format = (select => {
              switch (select) {
                case 'jpg': { return Dynamsoft.EnumDWT_ImageType.IT_JPG }
                case 'pdf': { return Dynamsoft.EnumDWT_ImageType.IT_PDF }
                case 'tif': { return Dynamsoft.EnumDWT_ImageType.IT_TIF }
            }
        })(this.selectFormat)

        console.log(format)

    let uploadFormat = Dynamsoft.EnumDWT_UploadDataFormat.Binary

    const DWObj = this.dwtConfig.obj
    if (DWObj) {
        DWObj.HTTPPort = port
        DWObj.IfSSL = false
        let indices = DWObj.SelectedImagesIndices
        DWObj.HTTPUpload(
            // protocol + '//' + host + ':' + port + uploadPath,
            'http://localhost:4200/api/File',
            indices,
            format,
            uploadFormat,  // 0 for binary; 1 for base64
            uploadFileName,
            () => { alert('success') },
            (errCode, errStr, res) => {
                console.error(`${errCode}: ${errStr}. Server return: ${ res }`)
            }
        )
    }
  }
  @action
  printUpload () {
    console.log(`to upload: ${this.fileName}.${this.selectFormat}`)
  }
}