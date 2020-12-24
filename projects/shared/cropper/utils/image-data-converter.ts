export class ImageDataConverter {
  dataURI: string;

  constructor(dataURI) {
    this.dataURI = dataURI;
  }

  getByteString() {
    let byteString;
    if (this.dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(this.dataURI.split(',')[1]);
    } else {
      byteString = decodeURI(this.dataURI.split(',')[1]);
    }
    return byteString;
  }

  getMimeString() {
    return this.dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0];
  }

  convertToTypedArray() {
    const byteString = this.getByteString();
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return ia;
  }

  dataURItoBlob() {
    const mimeString = this.getMimeString();
    const intArray = this.convertToTypedArray();
    return new Blob([intArray], {type: mimeString});
  }
}
